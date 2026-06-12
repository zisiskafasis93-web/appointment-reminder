import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RemindMeUp",
  description: "Reminder app for professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}
