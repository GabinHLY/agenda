export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

export function formatShortDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

export function addDays(dateStr, amount) {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + amount);
  return d.toISOString().slice(0, 10);
}

export function getWeekDates(centerDate) {
  const base = new Date(`${centerDate}T12:00:00`);
  const day = (base.getDay() + 6) % 7;
  base.setDate(base.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}
