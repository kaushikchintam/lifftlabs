import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import * as React from "react";

export interface WaitlistLiveEmailProps {
  journeyTitle: string;
  matchUrl: string;
}

export const WaitlistLiveEmail = ({
  journeyTitle = "Managing my finances",
  matchUrl = "https://lifftlabs.com",
}: WaitlistLiveEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>A {journeyTitle.toLowerCase()} mentor is ready for you on LIFFT.</Preview>
    <Body style={{ background: "#FAFAFA", fontFamily: "Helvetica, Arial, sans-serif", padding: "32px 0" }}>
      <Container style={{ background: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: 16, padding: 40, maxWidth: 520 }}>
        <Heading style={{ color: "#111111", fontSize: 28, margin: "0 0 16px" }}>Your mentor is ready</Heading>
        <Text style={{ color: "#4A4A4A", fontSize: 16, lineHeight: "24px" }}>
          You joined the waitlist for {journeyTitle.toLowerCase()}. A vetted mentor is now live. We kept your answers,
          so you can go straight to your match.
        </Text>
        <Button
          href={matchUrl}
          style={{ background: "#111111", color: "#FFFFFF", borderRadius: 12, padding: "14px 22px", fontSize: 15 }}
        >
          See my match →
        </Button>
      </Container>
    </Body>
  </Html>
);

export default WaitlistLiveEmail;
