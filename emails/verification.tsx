import {
  Body,
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

export interface VerificationEmailProps {
  /** The 6-digit (or longer) verification code to display. */
  code: string;
  /** Minutes until the code expires. Defaults to 10. */
  expiresInMinutes?: number;
  /** Support address shown in the "not expecting this" line. */
  supportEmail?: string;
}

// ---- Brand tokens (kept local so the email has zero external deps) ----
const brand = "#2596BE";
const ink = "#18150F";
const inkMuted = "#6F6B60";
const paper = "#FBF7EE";
const pageBg = "#DDEBF3";
const codeBg = "#F1ECE0";
const serif = "Georgia, 'Times New Roman', serif";
const sans = "Helvetica, Arial, sans-serif";

export const VerificationEmail = ({
  code = "212342",
  expiresInMinutes = 10,
  supportEmail = "login@lifftlabs.com",
}: VerificationEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>{`Your LIFFT Labs verification code is ${code} — it expires in ${expiresInMinutes} minutes.`}</Preview>
    <Body style={bodyStyle}>
      <Container style={cardStyle}>
        {/* Logo */}
        <Section style={{ padding: "44px 40px 0 40px", textAlign: "center" }}>
          <Text style={logoWordmark}>LIFFT&nbsp;LABS</Text>
        </Section>

        {/* Eyebrow */}
        <Text style={eyebrow}>Verify your identity</Text>

        {/* Headline */}
        <Heading style={headline}>
          Enter this code to verify your LIFFT Labs account.
        </Heading>

        {/* Code box */}
        <Section style={{ padding: "30px 40px 0 40px" }}>
          <Section style={codeBoxStyle}>
            <Text style={codeText}>{code}</Text>
          </Section>
        </Section>

        {/* Expiry */}
        <Text style={expiryText}>
          This code expires in {expiresInMinutes} minutes.
        </Text>

        {/* Not expecting */}
        <Text style={notice}>
          Not expecting this email? Contact{" "}
          <Link href={`mailto:${supportEmail}`} style={{ color: brand, textDecoration: "underline" }}>
            {supportEmail}
          </Link>{" "}
          if you didn’t request this code — your account stays safe.
        </Text>
      </Container>

      {/* Footer */}
      <Container style={{ maxWidth: 480 }}>
        <Text style={footerStrong}>Securely powered by LIFFT Labs</Text>
        <Text style={footerMuted}>
          Powering tomorrow’s healthcare workforce
          <br />© {new Date().getFullYear()} LIFFT Labs · London, UK
        </Text>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmail;

// ---- Styles ----
const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: pageBg,
  fontFamily: sans,
};

const cardStyle: React.CSSProperties = {
  maxWidth: 480,
  margin: "40px auto 0 auto",
  backgroundColor: paper,
  borderRadius: 24,
  border: "1px solid rgba(24,21,15,0.10)",
  overflow: "hidden",
};

const logoWordmark: React.CSSProperties = {
  paddingLeft: 12,
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 19,
  letterSpacing: 1.6,
  color: ink,
  verticalAlign: "middle",
};

const eyebrow: React.CSSProperties = {
  margin: "38px 40px 0 40px",
  textAlign: "center",
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: brand,
};

const headline: React.CSSProperties = {
  margin: "14px 44px 0 44px",
  textAlign: "center",
  fontFamily: serif,
  fontWeight: 400,
  fontSize: 27,
  lineHeight: 1.25,
  color: ink,
};

const codeBoxStyle: React.CSSProperties = {
  backgroundColor: codeBg,
  borderRadius: 14,
  padding: "24px 16px",
  textAlign: "center",
};

const codeText: React.CSSProperties = {
  margin: 0,
  fontFamily: serif,
  fontWeight: 700,
  fontSize: 42,
  letterSpacing: 14,
  paddingLeft: 14,
  color: ink,
};

const expiryText: React.CSSProperties = {
  margin: "18px 40px 0 40px",
  textAlign: "center",
  fontFamily: sans,
  fontSize: 14,
  color: inkMuted,
};

const notice: React.CSSProperties = {
  margin: "30px 44px 44px 44px",
  textAlign: "center",
  fontFamily: sans,
  fontSize: 14,
  lineHeight: 1.6,
  color: inkMuted,
};

const footerStrong: React.CSSProperties = {
  margin: "24px 16px 8px 16px",
  textAlign: "center",
  fontFamily: sans,
  fontSize: 12,
  letterSpacing: 1,
  textTransform: "uppercase",
  fontWeight: 700,
  color: "#8A857A",
};

const footerMuted: React.CSSProperties = {
  margin: "0 16px 8px 16px",
  textAlign: "center",
  fontFamily: sans,
  fontSize: 12,
  lineHeight: 1.6,
  color: "#9A958A",
};
