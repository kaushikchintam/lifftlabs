//define the Zod schemas there, and then import and use them in the page. 
import { z } from "zod";

export const emailSchema = z.object({
    email: z.email("Please enter a valid email"),
});

export const loginSchema = z.object({
    email: z.email("Please enter a valid email"),
    password: z.string()
    .min(8, "Password must be atleast 8 characters")
    .refine(val => /[A-Z]/.test(val), "Must contain at least one uppercase letter")
    .refine(val => /[0-9]/.test(val), "Must contain at least one number")
    .refine(val => /[^A-Za-z0-9]/.test(val), "Must contain at least one speacial character"),
});

export const signupSchema = z.object({
    fullName: z.string().min(2, "Please enter your full name").trim(),
    email: z.email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});