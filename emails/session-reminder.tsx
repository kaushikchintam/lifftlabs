import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Link,
} from "@react-email/components";

/** EM-05 — 24-hour session reminder. */

interface SessionReminderProps {
  recipientName: string;
  counterpartName: string;
  whenFormatted: string; // pre-formatted in the session's timezone
  sessionUrl: string;
}

export default function SessionReminder({
  recipientName,
  counterpartName,
  whenFormatted,
  sessionUrl,
}: SessionReminderProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Reminder: session with {counterpartName} — {whenFormatted}
      </Preview>
      <Body style={{ backgroundColor: "#faf8f4", fontFamily: "Georgia, serif" }}>
        <Container style={{ padding: "32px 24px", maxWidth: "520px" }}>
          <Heading as="h1" style={{ fontSize: "22px", color: "#1f3d2b" }}>
            Your session is coming up
          </Heading>

          <Text style={{ fontSize: "15px", color: "#333" }}>
            Hi {recipientName}, a quick reminder — your session with{" "}
            {counterpartName} is scheduled for:
          </Text>

          <Text
            style={{ fontSize: "16px", fontWeight: "bold", color: "#1f3d2b" }}
          >
            {whenFormatted}
          </Text>

          <Text style={{ fontSize: "15px", color: "#333" }}>
            The join button opens 15 minutes before the start time:
          </Text>

          <Text>
            <Link href={sessionUrl} style={{ color: "#a1502a", fontSize: "15px" }}>
              Open your session
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}