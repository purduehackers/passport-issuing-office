import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const inter = Inter({
  weight: ["400", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const ocrBPro = localFont({
  src: [
    {
      path: "../assets/OCRBPro.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-ocr",
});

export const metadata: Metadata = {
  title: "Passport Data Pages",
  description: "Customize your passport data page!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} ${inter.variable} ${ocrBPro.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
