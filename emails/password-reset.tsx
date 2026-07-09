import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface PasswordResetEmailProps {
  resetLink: string;
  fullName?: string;
  supportEmail?: string;
}

const brand = "#2596BE";
const ink = "#18150F";
const inkMuted = "#6F6B60";
const paper = "#FBF7EE";
const pageBg = "#DDEBF3";
const serif = "Georgia, 'Times New Roman', serif";
const sans = "Helvetica, Arial, sans-serif";

export const PasswordResetEmail = ({
  resetLink,
  fullName,
  supportEmail = "login@lifftlabs.com",
}: PasswordResetEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>Reset your LIFFT Labs password — link expires in 1 hour.</Preview>
    <Body style={bodyStyle}>
      <Container style={cardStyle}>
        <Section style={{ padding: "44px 40px 0 40px", textAlign: "center" }}>
          <Text style={logoWordmark}>LIFFT&nbsp;LABS</Text>
        </Section>

        <Text style={eyebrow}>Password reset</Text>

        <Heading style={headline}>
          {fullName ? `Hi ${fullName}, reset` : "Reset"} your LIFFT Labs password.
        </Heading>

        <Text style={bodyText}>
          Click the button below to choose a new password. This link expires in 1 hour.
        </Text>

        <Section style={{ padding: "10px 40px 30px 40px", textAlign: "center" }}>
          <Button href={resetLink} style={buttonStyle}>
            Reset password
          </Button>
        </Section>

        <Text style={notice}>
          Didn't request this? Ignore this email — your password won't change.
          If you're concerned, contact{" "}
          <Link href={`mailto:${supportEmail}`} style={{ color: brand }}>
            {supportEmail}
          </Link>.
        </Text>
      </Container>

      <Container style={{ maxWidth: 480 }}>
        <Text style={footerStrong}>Securely powered by LIFFT Labs</Text>
        <Text style={footerMuted}>
          Powering tomorrow's healthcare workforce
          <br />© {new Date().getFullYear()} LIFFT Labs · London, UK
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;

const bodyStyle: React.CSSProperties = { margin: 0, padding: 0, backgroundColor: pageBg, fontFamily: sans };
const cardStyle: React.CSSProperties = { maxWidth: 480, margin: "40px auto 0 auto", backgroundColor: paper, borderRadius: 24, border: "1px solid rgba(24,21,15,0.10)", overflow: "hidden" };
const logoWordmark: React.CSSProperties = { paddingLeft: 12, fontFamily: sans, fontWeight: 700, fontSize: 19, letterSpacing: 1.6, color: ink, verticalAlign: "middle" };
const eyebrow: React.CSSProperties = { margin: "38px 40px 0 40px", textAlign: "center", fontFamily: sans, fontWeight: 700, fontSize: 13, letterSpacing: 1.4, textTransform: "uppercase", color: brand };
const headline: React.CSSProperties = { margin: "14px 44px 0 44px", textAlign: "center", fontFamily: serif, fontWeight: 400, fontSize: 27, lineHeight: 1.25, color: ink };
const bodyText: React.CSSProperties = { margin: "16px 44px 0 44px", textAlign: "center", fontFamily: sans, fontSize: 15, lineHeight: 1.6, color: inkMuted };
const buttonStyle: React.CSSProperties = { backgroundColor: brand, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 15, borderRadius: 10, padding: "14px 32px", textDecoration: "none" };
const notice: React.CSSProperties = { margin: "0 44px 44px 44px", textAlign: "center", fontFamily: sans, fontSize: 14, lineHeight: 1.6, color: inkMuted };
const footerStrong: React.CSSProperties = { margin: "24px 16px 8px 16px", textAlign: "center", fontFamily: sans, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, color: "#8A857A" };
const footerMuted: React.CSSProperties = { margin: "0 16px 8px 16px", textAlign: "center", fontFamily: sans, fontSize: 12, lineHeight: 1.6, color: "#9A958A" };