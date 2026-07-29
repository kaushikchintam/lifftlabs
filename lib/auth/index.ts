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
        from: "LIFFT <hello@mail.lifft-dev.co.uk>",
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
  //New-role based caching 
  session: {
    additionalFields: {
      role : {
        type: "string",
        defaultValue: "learner",
      },
    },
    cookieCache: {
      enabled: true, 
      maxAge: 5 * 60, //seconds - how long getSession() trusts the cookie before re-hitting Postgres. 
    }
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          try {
            //Re-use existing pg database pool to check for mentor profiles
            const result = await database.query(
              'SELECT user_id FROM mentor_profiles WHERE user_id = $1 LIMIT 1',
              [session.userId]
            ); 

            // Assign role on the session object directly
            session.role = result.rows.length > 0 ? "mentor" : "learner";
          } catch (error) {
            console.error("Failed to map role to session", error);
            session.role = "learner";
          }
          return { data: session };
        },
      },
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP( { email, otp, type }) {
        if (type === "email-verification") {
          const html = await render(React.createElement(VerificationEmail, { code: otp }));
          await resend.emails.send({
            from: "LIFFT <hello@mail.lifft-dev.co.uk>",
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
          from: "LIFFT <hello@mail.lifft-dev.co.uk>",
          to: data.email,
          subject: "Your mentor application has been approved",
          html
        });
      },
    })
  ],
});