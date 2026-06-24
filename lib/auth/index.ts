import { betterAuth } from "better-auth";
import { Pool } from "pg";
import React from "react";
import { emailOTP } from "better-auth/plugins/email-otp";
import { render } from "@react-email/render";
import { VerificationEmail } from '@/emails/verification';
import { resend } from "@/lib/resend/client";


const database = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: database,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP( { email, otp, type }) {
        if (type === "email-verification") {
          const html = await render(React.createElement(VerificationEmail, { code: otp }));
          resend.emails.send({
            from: "LIFFTLABS <login@lifftlabs.com>",
            to: email,
            subject: "Your LIFFTLABS verification code",
            html,
          });
        }
      },
    }),
  ],
});
