const UK = "Europe/London";

/** "Thu 22 Oct, 18:00" in UK time — sessions, slots, lists. */
export function formatSession(date: string | Date): string {
  const d = new Date(date);
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: UK }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: UK }).format(d);
  return `${day.replace(",", "")}, ${time}`;
}

/** "£40" / "£42.50" from pence. */
export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(pence % 100 ? 2 : 0)}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))
}

export function formatDateOnly(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(date))
}

export function formatTimeOnly(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
  }).format(new Date(date))
}
