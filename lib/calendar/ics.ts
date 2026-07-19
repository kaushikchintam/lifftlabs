/**
 * Minimal iCalendar builder for session confirmation emails (EM-04).
 * METHOD:REQUEST + a stable UID means clients treat later sends with the
 * same UID (e.g. a METHOD:CANCEL on cancellation) as updates to this event.
 */

function icsDate(d: Date): string {
  // UTC basic format: 20260815T140000Z
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export interface SessionIcsInput {
  uid: string; // session id — stable across sends
  start: Date;
  end: Date;
  summary: string;
  description: string;
  organizerEmail: string;
  attendees: Array<{ name: string; email: string }>;
  url?: string;
}

export function buildSessionIcs(input: SessionIcsInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LIFFT//Mentoring//EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${input.uid}@lifftlabs.com`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(input.start)}`,
    `DTEND:${icsDate(input.end)}`,
    `SUMMARY:${escapeText(input.summary)}`,
    `DESCRIPTION:${escapeText(input.description)}`,
    `ORGANIZER;CN=LIFFT:mailto:${input.organizerEmail}`,
    ...input.attendees.map(
      (a) =>
        `ATTENDEE;CN=${escapeText(a.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:${a.email}`
    ),
    ...(input.url ? [`URL:${input.url}`] : []),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // iCalendar requires CRLF line endings
  return lines.join("\r\n");
}