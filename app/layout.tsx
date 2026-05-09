import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redress — AI-Powered Complaint Resolution",
  description:
    "Draft formal complaint letters, find the right channel, and escalate to regulators — in minutes, for any country, any sector.",
  keywords: ["complaint", "resolution", "AI", "consumer rights", "escalation", "letter drafting"],
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise-overlay">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
