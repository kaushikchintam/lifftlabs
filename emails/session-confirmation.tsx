import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";

/**
 * EM-04 — session confirmation, sent to both participants on payment.
 * A calendar invite (.ics) is attached by the send function; Google users
 * also receive a native invite via the calendar write-back, so this email's
 * job is confirmation + the session link, not calendaring.
 */

interface SessionConfirmationProps {
  recipientName: string;
  counterpartName: string;
  recipientRole: "mentor" | "learner";
  whenFormatted: string; // pre-formatted in the session's timezone
  sessionUrl: string;
}

export default function SessionConfirmation({
  recipientName,
  counterpartName,
  recipientRole,
  whenFormatted,
  sessionUrl,
}: SessionConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your session with {counterpartName} is confirmed — {whenFormatted}
      </Preview>
      <Body style={{ backgroundColor: "#faf8f4", fontFamily: "Georgia, serif" }}>
        <Container style={{ padding: "32px 24px", maxWidth: "520px" }}>
          <Heading as="h1" style={{ fontSize: "22px", color: "#1f3d2b" }}>
            Session confirmed
          </Heading>

          <Text style={{ fontSize: "15px", color: "#333" }}>
            Hi {recipientName},
          </Text>

          <Text style={{ fontSize: "15px", color: "#333" }}>
            Your {recipientRole === "mentor" ? "mentoring session" : "session"}{" "}
            with {counterpartName} is booked for:
          </Text>

          <Section
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e0d5",
              borderRadius: "8px",
              padding: "16px 20px",
              margin: "16px 0",
            }}
          >
            <Text
              style={{ fontSize: "16px", fontWeight: "bold", color: "#1f3d2b", margin: 0 }}
            >
              {whenFormatted}
            </Text>
          </Section>

          <Text style={{ fontSize: "15px", color: "#333" }}>
            A calendar invite is attached. When it's time, join from your
            session page:
          </Text>

          <Text>
            <Link href={sessionUrl} style={{ color: "#a1502a", fontSize: "15px" }}>
              Open your session
            </Link>
          </Text>

          <Text style={{ fontSize: "13px", color: "#777", marginTop: "24px" }}>
            Need to make a change? Reply to this email and we'll help.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}