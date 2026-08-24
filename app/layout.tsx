import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tradingwig — Trading Terminal",
  description: "Four-chart TradingView workspace with Pine and webhook tooling.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
