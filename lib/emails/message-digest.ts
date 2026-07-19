import { render } from "@react-email/render";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend/client"; // adjust if your export name differs
import MessageDigest from "@/emails/message-digest";

/** P6-05 — sends the new-message nudge to the OTHER participant.
 *  Called best-effort from the message POST route after the debounce claim. */

const FROM = process.env.EMAIL_FROM ?? "LIFFT <hello@mail.lifftlabs.com>";

export async function sendMessageDigest(
  conversationId: string,
  senderId: string
): Promise<boolean> {
  try {
    const { data: participants } = await supabaseAdmin
      .from("conversation_participants")
      .select("user_id, user:user(name, email)")
      .eq("conversation_id", conversationId);

    const sender = participants?.find((p) => p.user_id === senderId) as
      | { user: { name: string } | null }
      | undefined;
    const recipient = participants?.find((p) => p.user_id !== senderId) as
      | { user: { name: string; email: string } | null }
      | undefined;

    if (!recipient?.user?.email || !sender?.user) return false;

    const html = await render(
      MessageDigest({
        recipientName: recipient.user.name,
        senderName: sender.user.name,
        threadUrl: `${process.env.BETTER_AUTH_URL}/messages/${conversationId}`,
      })
    );

    await resend.emails.send({
      from: FROM,
      to: recipient.user.email,
      subject: `New message from ${sender.user.name} on LIFFT`,
      html,
    });
    return true;
  } catch (err) {
    console.error(`[email] digest failed for ${conversationId}:`, err);
    return false;
  }
}