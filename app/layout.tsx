import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointment Reminder",
  description: "Appointment reminder app for professionals",
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