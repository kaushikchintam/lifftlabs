/** One join window for the session page, the call page and the token route. */
export const JOIN_OPENS_BEFORE_MS = 10 * 60 * 1000;
export const GRACE_AFTER_END_MS = 30 * 60 * 1000;

export function joinWindow(scheduledAt: string, endsAt: string) {
  return {
    opens: new Date(scheduledAt).getTime() - JOIN_OPENS_BEFORE_MS,
    closes: new Date(endsAt).getTime() + GRACE_AFTER_END_MS,
  };
}

export function isJoinable(status: string, scheduledAt: string, endsAt: string, now = Date.now()) {
  const { opens, closes } = joinWindow(scheduledAt, endsAt);
  return status === "confirmed" && now >= opens && now <= closes;
}
