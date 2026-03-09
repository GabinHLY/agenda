export const STORAGE_KEY = "louis-planner-mvp-v1";

export const RECURRENCE = [
  { value: "none", label: "Aucune" },
  { value: "daily", label: "Chaque jour" },
  { value: "weekly", label: "Chaque semaine" },
];

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Lun" },
  { value: 1, label: "Mar" },
  { value: 2, label: "Mer" },
  { value: 3, label: "Jeu" },
  { value: 4, label: "Ven" },
  { value: 5, label: "Sam" },
  { value: 6, label: "Dim" },
];

export const DEFAULT_FORM = {
  title: "",
  date: "",
  recurrence: "none",
  weekDays: [],
  timerEnabled: false,
  notes: "",
};
