import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartWallet Agent",
  description: "OWS-powered AI micro-payment agent for the creator economy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  );
}
