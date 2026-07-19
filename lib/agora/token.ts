import { RtcTokenBuilder, RtcRole } from "agora-token"; // npm i agora-token

/**
 * Agora RTC token building (P5-01).
 * App Certificate never leaves the server — tokens are minted here only.
 *
 * uid: Agora wants a numeric uid; our user ids are text. Derive a stable
 * 31-bit integer per user so "who is who" is consistent across joins,
 * renewals, and any future server-side event processing. (Collision odds at
 * two-participant scale: negligible; the channel is also participant-gated.)
 */

export function deterministicUid(userId: string): number {
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) + hash + userId.charCodeAt(i)) | 0; // djb2
  }
  const uid = Math.abs(hash) % 2147483646; // 31-bit, leave 0 unused
  return uid === 0 ? 1 : uid;
}

export function buildRtcToken(input: {
  channel: string;
  uid: number;
  /** Absolute expiry — set to session end + grace, so early page loads and
   *  long sessions never hit a dead token mid-call. */
  expiresAt: Date;
}): string {
  const appId = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;

  const secondsUntilExpiry = Math.max(
    60,
    Math.floor((input.expiresAt.getTime() - Date.now()) / 1000)
  );

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    input.channel,
    input.uid,
    RtcRole.PUBLISHER,
    secondsUntilExpiry,
    secondsUntilExpiry
  );
}