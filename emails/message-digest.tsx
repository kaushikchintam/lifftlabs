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

/**
 * EM — new message notification (P6-05).
 * Deliberately NO message content: email is less private than the app, and
 * for an NHS audience career conversations may be sensitive. Sender + a
 * nudge is enough to bring people back.
 */

interface MessageDigestProps {
  recipientName: string;
  senderName: string;
  threadUrl: string;
}

export default function MessageDigest({
  recipientName,
  senderName,
  threadUrl,
}: MessageDigestProps) {
  return (
    <Html>
      <Head />
      <Preview>New message from {senderName} on LIFFT</Preview>
      <Body style={{ backgroundColor: "#faf8f4", fontFamily: "Georgia, serif" }}>
        <Container style={{ padding: "32px 24px", maxWidth: "520px" }}>
          <Heading as="h1" style={{ fontSize: "22px", color: "#1f3d2b" }}>
            New message from {senderName}
          </Heading>
          <Text style={{ fontSize: "15px", color: "#333" }}>
            Hi {recipientName}, {senderName} sent you a message on LIFFT.
          </Text>
          <Text>
            <Link href={threadUrl} style={{ color: "#a1502a", fontSize: "15px" }}>
              Read and reply
            </Link>
          </Text>
          <Text style={{ fontSize: "13px", color: "#777", marginTop: "24px" }}>
            You won't be emailed again about this conversation for a little
            while, even if more messages arrive.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}