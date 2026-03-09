import { addDays, todayString } from "./date-utils";
import { createId } from "./task-utils";

export function seedState() {
  const today = todayString();
  const tomorrow = addDays(today, 1);

  return {
    tasks: [
      {
        id: createId(),
        title: "Priorite du jour",
        date: today,
        startTime: "09:00",
        endTime: "11:00",
        priority: "high",
        recurrence: "none",
        notes: "Le seul bloc qui compte vraiment aujourd'hui.",
        completed: false,
      },
      {
        id: createId(),
        title: "Sport",
        date: today,
        startTime: "18:30",
        endTime: "19:45",
        priority: "medium",
        recurrence: "weekly",
        notes: "",
        completed: false,
      },
      {
        id: createId(),
        title: "Planifier demain",
        date: today,
        startTime: "21:15",
        endTime: "21:30",
        priority: "low",
        recurrence: "daily",
        notes: "3 taches max, pas plus.",
        completed: false,
      },
      {
        id: createId(),
        title: "Bloc projet long terme",
        date: tomorrow,
        startTime: "10:00",
        endTime: "12:00",
        priority: "high",
        recurrence: "none",
        notes: "Avancer reellement, pas reflechir a avancer.",
        completed: false,
      },
    ],
    notes: {
      [today]: "Objectif du jour : finir une chose utile, pas commencer trois idees.",
    },
  };
}
