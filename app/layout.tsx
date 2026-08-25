import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo, Archivo_Black, DM_Sans, DM_Serif_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const sligoil = localFont({
  variable: "--font-sligoil",
  src: [
    {
      path: "../public/fonts/sligoil-main/fonts/web/Sligoil-Micro.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/sligoil-main/fonts/web/Sligoil-MicroMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/sligoil-main/fonts/web/Sligoil-MicroBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "LIFFT",
    template: "%s — LIFFT",
  },
  description:
    "One-to-one mentorship for people retraining into medicine and advancing within it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} ${archivo.variable} ${dmSans.variable} ${dmSerifDisplay.variable} ${sligoil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
