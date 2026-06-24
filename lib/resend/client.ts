//initialises Resend with your API key. One line essentially.
import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY)