import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scrum-x.vercel.app"),
  title: "ScrumX",
  description: "Daily scrum report updates",
  // icons: {
  //   icon: "/scrumx-icon.svg",
  // },
  openGraph: {
    title: "ScrumX",
    description: "Daily scrum report updates",
    url: "/",
    siteName: "ScrumX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrumX",
    description: "Daily scrum report updates",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
