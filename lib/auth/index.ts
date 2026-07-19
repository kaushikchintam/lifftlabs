import { betterAuth } from "better-auth";
import { Pool } from "pg";
import React from "react";
import { emailOTP, magicLink } from "better-auth/plugins";
import { render } from "@react-email/render";
import { VerificationEmail } from '@/emails/verification';
import { MentorApprovalEmail } from '@/emails/mentor-approved';
import { resend } from "@/lib/resend/client";
import { PasswordResetEmail } from '@/emails/password-reset';


const database = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: database,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "https://dingbat-payday-bogus.ngrok-free.dev",
  ],
  account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"], // Add trusted providers
		},
	},
  advanced: {
    database: {
      generateId: crypto.randomUUID,
    },
  },
  emailAndPassword: { enabled: true,
    async sendResetPassword({user, token}) {
      const resetLink = `${process.env.BETTER_AUTH_URL}/reset-password?token=${token}`;
      const html = await render 
        (React.createElement(PasswordResetEmail, {
          resetLink,
          fullName: user.name, 
        })
      );
      await resend.emails.send({
        from: "LIFFT LABS <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your LIFFT Labs password",
        html,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP( { email, otp, type }) {
        if (type === "email-verification") {
          const html = await render(React.createElement(VerificationEmail, { code: otp }));
          await resend.emails.send({
            from: "LIFFT LABS <onboarding@resend.dev>",
            to: email,
            subject: "Your LIFFT LABS verification code",
            html,
          });
        }
      },
    }),
    magicLink({
      disableSignUp: false, 
      async sendMagicLink(data) {
        if (!data.metadata?.isAdminApproval) return; 

        const { fullName, stripeLink } = data.metadata ?? {};
        const html = await render(
          React.createElement(MentorApprovalEmail, {
            fullName,
            profileLink: data.url,
            stripeLink,
          })
        );
        await resend.emails.send({
          from: "LIFFT LABS <onboarding@resend.dev>",
          to: data.email,
          subject: "Your mentor application has been approved",
          html
        });
      },
    })
  ],
});