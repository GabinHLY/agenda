import React, { useState } from "react";
import { PlannerDayView } from "@/components/planner/PlannerDayView";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { PlannerSharedSpaceCard } from "@/components/planner/PlannerSharedSpaceCard";
import { PlannerTopNavigation } from "@/components/planner/PlannerTopNavigation";
import { PlannerWeekView } from "@/components/planner/PlannerWeekView";
import { useAuth } from "@/features/auth/AuthContext";
import { todayString } from "@/features/planner/date-utils";
import { usePlannerData } from "@/features/planner/usePlannerData";

export default function PlannerApp() {
  const { token, user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [view, setView] = useState("day");
  const [plannerScope, setPlannerScope] = useState("personal");

  const {
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
    loading,
    sharing,
    canUseShared,
    createSharedSpace,
    joinSharedSpace,
    leaveSharedSpace,
    sharedActionLoading,
    sharedActionError,
    sharedActionSuccess,
  } = usePlannerData(selectedDate, token, plannerScope);

  function openDay(date) {
    setSelectedDate(date);
    setView("day");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PlannerHeader
          user={user}
          view={view}
          setView={setView}
          plannerScope={plannerScope}
          setPlannerScope={setPlannerScope}
          sharing={sharing}
          onLogout={logout}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          form={form}
          setForm={setForm}
          onAddTask={addTask}
        />

        <div className="grid lg:grid-cols-[320px,1fr] gap-6">
          <PlannerSidebar
            stats={stats}
            overdueTasks={overdueTasks}
            onMoveTaskToToday={(taskId) => {
              moveTaskToToday(taskId);
              setSelectedDate(todayString());
            }}
          />

          <div className="space-y-6">
            {plannerScope === "shared" ? (
              <PlannerSharedSpaceCard
                sharing={sharing}
                canUseShared={canUseShared}
                loading={sharedActionLoading}
                error={sharedActionError}
                success={sharedActionSuccess}
                onCreate={createSharedSpace}
                onJoin={joinSharedSpace}
                onLeave={leaveSharedSpace}
              />
            ) : null}

            {plannerScope === "personal" || canUseShared ? (
              <PlannerTopNavigation
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                weekDates={weekDates}
              />
            ) : null}

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Chargement de ton planning...
              </div>
            ) : null}

            {!loading && (plannerScope === "personal" || canUseShared) && view === "day" ? (
              <PlannerDayView
                selectedDate={selectedDate}
                tasks={tasksForSelectedDate}
                selectedNote={selectedNote}
                scopeLabel={plannerScope === "shared" ? "partage" : "perso"}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onToggleTimer={toggleTimer}
                onResetTimer={resetTimer}
                onClearCompleted={clearCompletedForDay}
                onUpdateNote={updateDayNote}
              />
            ) : null}

            {!loading && (plannerScope === "personal" || canUseShared) && view === "week" ? (
              <PlannerWeekView
                weekGroupedTasks={weekGroupedTasks}
                onOpenDay={openDay}
                scopeLabel={plannerScope === "shared" ? "partage" : "perso"}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
