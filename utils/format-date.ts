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
