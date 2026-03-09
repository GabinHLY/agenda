import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_FORM } from "./constants";
import { addDays, getWeekDates, todayString } from "./date-utils";
import { seedState } from "./seed";
import { createId, sortTasks } from "./task-utils";
import { apiRequest } from "@/lib/api";

const EMPTY_PLANNER = { tasks: [], notes: {} };

function normalizePlannerData(raw) {
  if (!raw || !Array.isArray(raw.tasks) || typeof raw.notes !== "object") {
    return { ...EMPTY_PLANNER };
  }

  return {
    tasks: raw.tasks,
    notes: raw.notes || {},
  };
}

export function usePlannerData(selectedDate, token, plannerScope) {
  const [personalData, setPersonalData] = useState(EMPTY_PLANNER);
  const [sharedData, setSharedData] = useState(EMPTY_PLANNER);
  const [sharing, setSharing] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM, date: todayString() });
  const [loading, setLoading] = useState(true);
  const [timerNowMs, setTimerNowMs] = useState(Date.now());
  const [sharedActionLoading, setSharedActionLoading] = useState(false);
  const [sharedActionError, setSharedActionError] = useState("");
  const [sharedActionSuccess, setSharedActionSuccess] = useState("");

  const saveTimeoutRef = useRef(null);

  const canUseShared = Boolean(sharing?.spaceId);
  const activeData = plannerScope === "shared" ? sharedData : personalData;

  useEffect(() => {
    let isCancelled = false;

    async function loadPlanner() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest("/api/planner", { token });
        if (!isCancelled) {
          setPersonalData(normalizePlannerData(response.personal));
          setSharedData(normalizePlannerData(response.shared));
          setSharing(response.sharing || null);
        }
      } catch {
        if (!isCancelled) {
          setPersonalData(seedState());
          setSharedData({ ...EMPTY_PLANNER });
          setSharing(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadPlanner();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || loading) return;
    if (plannerScope === "shared" && !canUseShared) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      apiRequest("/api/planner", {
        method: "PUT",
        token,
        body: { scope: plannerScope, data: activeData },
      }).catch(() => {
        // Keep UI responsive even if network save fails.
      });
    }, 250);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [activeData, token, loading, plannerScope, canUseShared]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const hasRunningTimer = useMemo(
    () => activeData.tasks.some((task) => task.timerEnabled && task.timerRunning && task.timerStartedAt),
    [activeData.tasks]
  );

  useEffect(() => {
    const today = todayString();
    const week = getWeekDates(selectedDate);
    const horizonDate = week[week.length - 1] > today ? week[week.length - 1] : today;

    updateActiveData((prev) => {
      const nextTasks = ensureRecurringTasksUpToDate(prev.tasks, horizonDate);
      if (nextTasks === prev.tasks) return prev;
      return { ...prev, tasks: nextTasks };
    });
  }, [selectedDate, plannerScope, canUseShared]);

  useEffect(() => {
    if (!hasRunningTimer) return;

    const interval = setInterval(() => {
      setTimerNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [hasRunningTimer]);

  const tasksForSelectedDate = useMemo(() => {
    const selectedTasks = activeData.tasks.filter((task) => task.date === selectedDate);
    const sorted = sortTasks(selectedTasks);
    return sorted.map((task) => ({
      ...task,
      elapsedTimerSeconds: computeElapsedTimerSeconds(task, timerNowMs),
    }));
  }, [activeData.tasks, selectedDate, timerNowMs]);

  const overdueTasks = useMemo(() => {
    return sortTasks(activeData.tasks.filter((task) => !task.completed && task.date < todayString()));
  }, [activeData.tasks]);

  const stats = useMemo(() => {
    const todayTasks = activeData.tasks.filter((task) => task.date === selectedDate);
    const completed = todayTasks.filter((task) => task.completed).length;
    const total = todayTasks.length;
    const active = total - completed;
    return { completed, total, active };
  }, [activeData.tasks, selectedDate]);

  const weekGroupedTasks = useMemo(() => {
    return weekDates.map((date) => ({
      date,
      tasks: sortTasks(activeData.tasks.filter((task) => task.date === date)),
    }));
  }, [activeData.tasks, weekDates]);

  const selectedNote = activeData.notes[selectedDate] || "";

  function updateActiveData(updater) {
    if (plannerScope === "shared") {
      if (!canUseShared) return;
      setSharedData((prev) => updater(prev));
      return;
    }

    setPersonalData((prev) => updater(prev));
  }

  function addTask() {
    if (!form.title.trim()) return;
    if (plannerScope === "shared" && !canUseShared) return;

    const weeklyDays = Array.isArray(form.weekDays) ? form.weekDays : [];
    const targetDates =
      form.recurrence === "weekly" && weeklyDays.length > 0
        ? weeklyDays.map((dayIndex) => getWeekDates(form.date)[dayIndex])
        : [form.date];

    const newTasks = targetDates.map((date) => ({
      id: createId(),
      title: form.title.trim(),
      date,
      recurrence: form.recurrence,
      weekDays: form.recurrence === "weekly" ? weeklyDays : [],
      timerEnabled: Boolean(form.timerEnabled),
      timerRunning: false,
      timerStartedAt: null,
      timerSeconds: 0,
      notes: form.notes.trim(),
      completed: false,
    }));

    const tasksWithRecurrenceIds = newTasks.map((task) => {
      if (task.recurrence === "none") return task;

      const weekday = task.recurrence === "weekly" ? weekdayIndex(task.date) : "daily";
      return {
        ...task,
        recurrenceGroupId: createId(),
        recurrenceWeekday: weekday,
      };
    });

    updateActiveData((prev) => ({ ...prev, tasks: [...prev.tasks, ...tasksWithRecurrenceIds] }));
    setForm({ ...DEFAULT_FORM, date: selectedDate });
    setDialogOpen(false);
  }

  function toggleTask(taskId) {
    updateActiveData((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              ...pauseTimerState(t),
            }
          : t
      );

      const toggled = updatedTasks.find((t) => t.id === taskId);
      const shouldCreateRecurring = toggled?.completed && task.recurrence !== "none";
      if (!shouldCreateRecurring) return { ...prev, tasks: updatedTasks };

      const nextDate = task.recurrence === "daily" ? addDays(task.date, 1) : addDays(task.date, 7);
      const seriesKey = recurrenceSeriesKey(task);
      const duplicateExists = updatedTasks.some(
        (t) =>
          t.date === nextDate &&
          t.recurrence === task.recurrence &&
          recurrenceSeriesKey(t) === seriesKey
      );
      if (duplicateExists) return { ...prev, tasks: updatedTasks };

      const nextOccurrence = {
        ...task,
        id: createId(),
        date: nextDate,
        completed: false,
        timerRunning: false,
        timerStartedAt: null,
      };

      return { ...prev, tasks: [...updatedTasks, nextOccurrence] };
    });
  }

  function toggleTimer(taskId) {
    updateActiveData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.id !== taskId || !task.timerEnabled || task.completed) return task;

        if (task.timerRunning) {
          return {
            ...task,
            ...pauseTimerState(task),
          };
        }

        return {
          ...task,
          timerRunning: true,
          timerStartedAt: Date.now(),
        };
      }),
    }));
  }

  function resetTimer(taskId) {
    updateActiveData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              timerRunning: false,
              timerStartedAt: null,
              timerSeconds: 0,
            }
          : task
      ),
    }));
  }

  function deleteTask(taskId) {
    updateActiveData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  }

  function moveTaskToToday(taskId) {
    updateActiveData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, date: todayString() } : task
      ),
    }));
  }

  function updateDayNote(value) {
    updateActiveData((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [selectedDate]: value,
      },
    }));
  }

  function clearCompletedForDay() {
    updateActiveData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => !(task.date === selectedDate && task.completed)),
    }));
  }

  async function createSharedSpace(name) {
    if (!token) return;

    setSharedActionError("");
    setSharedActionSuccess("");
    setSharedActionLoading(true);

    try {
      const response = await apiRequest("/api/planner/shared/create", {
        method: "POST",
        token,
        body: { name },
      });

      setSharing(response.sharing || null);
      setSharedData(normalizePlannerData(response.shared));
      setSharedActionSuccess("Planning partage cree. Envoie le code a ton pote.");
    } catch (error) {
      setSharedActionError(error.message || "Impossible de creer le planning partage.");
    } finally {
      setSharedActionLoading(false);
    }
  }

  async function joinSharedSpace(code) {
    if (!token) return;

    setSharedActionError("");
    setSharedActionSuccess("");
    setSharedActionLoading(true);

    try {
      const response = await apiRequest("/api/planner/shared/join", {
        method: "POST",
        token,
        body: { code },
      });

      setSharing(response.sharing || null);
      setSharedData(normalizePlannerData(response.shared));
      setSharedActionSuccess("Connexion au planning partage reussie.");
    } catch (error) {
      setSharedActionError(error.message || "Code de partage invalide.");
    } finally {
      setSharedActionLoading(false);
    }
  }

  async function leaveSharedSpace() {
    if (!token || !canUseShared) return;

    setSharedActionError("");
    setSharedActionSuccess("");
    setSharedActionLoading(true);

    try {
      await apiRequest("/api/planner/shared/leave", {
        method: "DELETE",
        token,
      });

      setSharing(null);
      setSharedData({ ...EMPTY_PLANNER });
      setSharedActionSuccess("Tu as quitte le planning partage.");
    } catch (error) {
      setSharedActionError(error.message || "Impossible de quitter le planning partage.");
    } finally {
      setSharedActionLoading(false);
    }
  }

  return {
    data: activeData,
    loading,
    dialogOpen,
    form,
    weekDates,
    tasksForSelectedDate,
    overdueTasks,
    stats,
    weekGroupedTasks,
    selectedNote,
    setDialogOpen,
    setForm,
    addTask,
    toggleTask,
    deleteTask,
    moveTaskToToday,
    toggleTimer,
    resetTimer,
    updateDayNote,
    clearCompletedForDay,
    sharing,
    canUseShared,
    createSharedSpace,
    joinSharedSpace,
    leaveSharedSpace,
    sharedActionLoading,
    sharedActionError,
    sharedActionSuccess,
  };
}

function computeElapsedTimerSeconds(task, nowMs) {
  if (!task.timerEnabled) return 0;

  const baseSeconds = Number(task.timerSeconds || 0);
  if (!task.timerRunning || !task.timerStartedAt) {
    return baseSeconds;
  }

  return baseSeconds + Math.max(0, Math.floor((nowMs - task.timerStartedAt) / 1000));
}

function pauseTimerState(task) {
  if (!task.timerRunning || !task.timerStartedAt) {
    return {
      timerRunning: false,
      timerStartedAt: null,
      timerSeconds: Number(task.timerSeconds || 0),
    };
  }

  const extraSeconds = Math.max(0, Math.floor((Date.now() - task.timerStartedAt) / 1000));
  return {
    timerRunning: false,
    timerStartedAt: null,
    timerSeconds: Number(task.timerSeconds || 0) + extraSeconds,
  };
}

function ensureRecurringTasksUpToDate(tasks, horizonDate) {
  let expandedTasks = tasks;
  let changed = false;
  let keepExpanding = true;
  let safety = 0;

  while (keepExpanding && safety < 1000) {
    keepExpanding = false;
    safety += 1;

    const snapshot = [...expandedTasks];
    for (const task of snapshot) {
      if (task.recurrence !== "daily" && task.recurrence !== "weekly") continue;

      const nextDate = task.recurrence === "daily" ? addDays(task.date, 1) : addDays(task.date, 7);
      if (nextDate > horizonDate) continue;

      const seriesKey = recurrenceSeriesKey(task);
      const exists = expandedTasks.some(
        (candidate) =>
          candidate.date === nextDate &&
          candidate.recurrence === task.recurrence &&
          recurrenceSeriesKey(candidate) === seriesKey
      );

      if (exists) continue;

      expandedTasks = [...expandedTasks, createNextRecurringOccurrence(task, nextDate)];
      changed = true;
      keepExpanding = true;
    }
  }

  return changed ? expandedTasks : tasks;
}

function createNextRecurringOccurrence(task, date) {
  return {
    ...task,
    id: createId(),
    date,
    completed: false,
    timerRunning: false,
    timerStartedAt: null,
  };
}

function recurrenceSeriesKey(task) {
  if (task.recurrenceGroupId) {
    return task.recurrenceGroupId;
  }

  if (task.recurrence === "weekly") {
    const weekday = task.recurrenceWeekday ?? weekdayIndex(task.date);
    return `weekly:${task.title}:${task.notes || ""}:${task.timerEnabled ? "1" : "0"}:${weekday}`;
  }

  return `daily:${task.title}:${task.notes || ""}:${task.timerEnabled ? "1" : "0"}`;
}

function weekdayIndex(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return (d.getDay() + 6) % 7;
}
