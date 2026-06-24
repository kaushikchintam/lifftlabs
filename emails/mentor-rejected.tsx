// rejection email
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

export interface MentorRejectionEmailProps {
  /** Applicant's full name, e.g. "Dr. Amara Okafor". */
  fullName: string;
  /** Link to reapply / update the application (optional). */
  reapplyLink?: string;
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

export const MentorRejectionEmail = ({
  fullName = "there",
  reapplyLink = "https://app.lifftlabs.com/apply",
  supportEmail = "mentor@lifftlabs.com",
}: MentorRejectionEmailProps) => (
  <Html lang="en">
    <Head />
    <Preview>
      An update on your LIFFT Labs mentor application — and how to strengthen it
      for next time.
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
        <Text style={eyebrow}>Application update</Text>

        {/* Headline */}
        <Heading style={headline}>
          Thank you for applying to mentor with LIFFT Labs.
        </Heading>

        {/* Greeting + intro */}
        <Text style={intro}>
          Hi <strong style={{ color: ink }}>{fullName}</strong>,
        </Text>
        <Text style={intro}>
          Thank you for taking the time to apply. After a careful review, we&apos;re
          not able to approve your mentor application at this time. This decision
          isn&apos;t a reflection of your skills or value — our review balances the
          experience our learners are looking for with the spaces we currently
          have open.
        </Text>

        {/* Encouragement panel */}
        <Section style={{ padding: "30px 40px 0 40px" }}>
          <Section style={panelStyle}>
            <Text style={panelHeading}>What can help next time</Text>
            <Row style={benefitRow}>
              <Column style={checkCol}>&#8226;</Column>
              <Column style={benefitText}>
                More detail on your healthcare experience and outcomes
              </Column>
            </Row>
            <Row style={benefitRowDivided}>
              <Column style={checkCol}>&#8226;</Column>
              <Column style={benefitText}>
                Verifiable credentials or references
              </Column>
            </Row>
            <Row style={benefitRowDivided}>
              <Column style={checkCol}>&#8226;</Column>
              <Column style={benefitText}>
                A clear sense of who you&apos;re best placed to mentor
              </Column>
            </Row>
          </Section>
        </Section>

        {/* Reapply CTA */}
        <Section style={{ padding: "28px 40px 0 40px" }}>
          <Button href={reapplyLink} style={primaryButton}>
            Update &amp; reapply &rarr;
          </Button>
          <Text style={caption}>
            You&apos;re welcome to apply again in the future — we&apos;d be glad to take
            another look.
          </Text>
        </Section>

        {/* Questions */}
        <Text style={questions}>
          Questions about this decision? Contact{" "}
          <Link href={`mailto:${supportEmail}`} style={{ color: brand, textDecoration: "underline" }}>
            {supportEmail}
          </Link>{" "}
          — we&apos;re happy to help.
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

export default MentorRejectionEmail;

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