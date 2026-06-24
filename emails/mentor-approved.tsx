import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface MentorApprovalEmailProps {
  /** Mentor's full name, e.g. "Dr. Amara Okafor". */
  fullName: string;
  /** Secure magic link to complete the mentor profile (expires in 24h). */
  profileLink: string;
  /** Stripe Connect onboarding link for payouts. */
  stripeLink: string;
  /** Support address shown in the footer line. */
  supportEmail?: string;
}

// ---- Brand tokens (kept local so the email has zero external deps) ----
const brand = "#2596BE";
const ink = "#18150F";
const inkBody = "#3A372F";
const inkMuted = "#6F6B60";
const paper = "#FBF7EE";
const pageBg = "#DDEBF3";
const panelBg = "#F1ECE0";
const serif = "Georgia, 'Times New Roman', serif";
const sans = "Helvetica, Arial, sans-serif";

const benefits = [
  "Set your availability",
  "Set your hourly rate",
  "Start accepting learners",
];

export const MentorApprovalEmail = ({
  fullName = "there",
  profileLink = "https://app.lifftlabs.com/profile",
  stripeLink = "https://connect.stripe.com/setup",
  supportEmail = "mentor@lifftlabs.com",
}: MentorApprovalEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>
      You&apos;ve been approved as a mentor on LIFFT Labs — complete your profile
      to start accepting learners.
    </Preview>
    <Body style={bodyStyle}>
      <Container style={cardStyle}>
        {/* Logo */}
        <Section style={{ padding: "44px 40px 0 40px" }}>
          <Row>
            <Column style={logoMark}>LL</Column>
            <Column style={logoWordmark}>LIFFT&nbsp;LABS</Column>
          </Row>
        </Section>

        {/* Eyebrow */}
        <Text style={eyebrow}>You&apos;re approved</Text>

        {/* Headline */}
        <Heading style={headline}>
          Welcome aboard as a LIFFT Labs mentor.
        </Heading>

        {/* Greeting + intro */}
        <Text style={intro}>
          Hi <strong style={{ color: ink }}>{fullName}</strong>,
        </Text>
        <Text style={intro}>
          Great news — your application has been approved. You can now set up your
          mentor profile and start guiding people through their move into,
          through, and within healthcare.
        </Text>

        {/* Primary CTA: magic link */}
        <Section style={{ padding: "28px 40px 0 40px" }}>
          <Button href={profileLink} style={primaryButton}>
            Complete your profile &rarr;
          </Button>
          <Text style={caption}>
            This is a secure magic link — no password needed. It expires in 24
            hours.
          </Text>
        </Section>

        {/* What you'll be able to do */}
        <Section style={{ padding: "30px 40px 0 40px" }}>
          <Section style={panelStyle}>
            <Text style={panelHeading}>
              Once you&apos;re set up, you&apos;ll be able to
            </Text>
            {benefits.map((label, i) => (
              <Row key={label} style={i === 0 ? benefitRow : benefitRowDivided}>
                <Column style={checkCol}>&#10003;</Column>
                <Column style={benefitText}>{label}</Column>
              </Row>
            ))}
          </Section>
        </Section>

        {/* Secondary CTA: Stripe Connect */}
        <Section style={{ padding: "24px 40px 0 40px" }}>
          <Button href={stripeLink} style={secondaryButton}>
            Connect your bank account &rarr;
          </Button>
          <Text style={caption}>
            Payouts are handled securely by Stripe. Connect now or later from your
            dashboard.
          </Text>
        </Section>

        {/* Questions */}
        <Text style={questions}>
          Questions? Contact{" "}
          <Link href={`mailto:${supportEmail}`} style={{ color: brand, textDecoration: "underline" }}>
            {supportEmail}
          </Link>{" "}
          — we&apos;re glad you&apos;re here.
        </Text>
      </Container>

      {/* Footer */}
      <Container style={{ maxWidth: 480 }}>
        <Text style={footerStrong}>Securely powered by LIFFT Labs</Text>
        <Text style={footerMuted}>
          Powering tomorrow&apos;s healthcare workforce
          <br />© {new Date().getFullYear()} LIFFT Labs · London, UK
        </Text>
      </Container>
    </Body>
  </Html>
);

export default MentorApprovalEmail;

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
  paddingBottom: 44,
};

const logoMark: React.CSSProperties = {
  backgroundColor: brand,
  borderRadius: 14,
  width: 46,
  height: 46,
  textAlign: "center",
  verticalAlign: "middle",
  fontFamily: serif,
  fontWeight: 700,
  fontSize: 20,
  color: "#ffffff",
};

const logoWordmark: React.CSSProperties = {
  paddingLeft: 12,
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 19,
  letterSpacing: 1.6,
  color: ink,
};

const eyebrow: React.CSSProperties = {
  margin: "38px 40px 0 40px",
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: brand,
};

const headline: React.CSSProperties = {
  margin: "14px 40px 0 40px",
  fontFamily: serif,
  fontWeight: 400,
  fontSize: 28,
  lineHeight: 1.2,
  color: ink,
};

const intro: React.CSSProperties = {
  margin: "18px 40px 0 40px",
  fontFamily: sans,
  fontSize: 15,
  lineHeight: 1.6,
  color: inkBody,
};

const primaryButton: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: brand,
  borderRadius: 999,
  padding: "16px 28px",
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 16,
  color: "#ffffff",
  textDecoration: "none",
  textAlign: "center",
};

const secondaryButton: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  border: "1.5px solid rgba(24,21,15,0.30)",
  borderRadius: 999,
  padding: "14px 28px",
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 15,
  color: ink,
  textDecoration: "none",
  textAlign: "center",
};

const caption: React.CSSProperties = {
  margin: "10px 2px 0 2px",
  textAlign: "center",
  fontFamily: sans,
  fontSize: 12.5,
  lineHeight: 1.5,
  color: "#8A857A",
};

const panelStyle: React.CSSProperties = {
  backgroundColor: panelBg,
  borderRadius: 14,
  padding: "22px 24px",
};

const panelHeading: React.CSSProperties = {
  margin: "0 0 6px 0",
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: inkMuted,
};

const benefitRow: React.CSSProperties = {
  padding: "8px 0",
};

const benefitRowDivided: React.CSSProperties = {
  padding: "8px 0",
  borderTop: "1px solid rgba(24,21,15,0.08)",
};

const checkCol: React.CSSProperties = {
  width: 24,
  verticalAlign: "top",
  color: brand,
  fontWeight: 700,
  fontFamily: sans,
  fontSize: 15,
};

const benefitText: React.CSSProperties = {
  fontFamily: sans,
  fontSize: 15,
  lineHeight: 1.5,
  color: ink,
};

const questions: React.CSSProperties = {
  margin: "30px 40px 0 40px",
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
