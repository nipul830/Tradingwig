import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tradingwig — Trading Terminal",
  description: "Four-chart TradingView workspace with Pine and webhook tooling.",
};

const chartSpacingFix = `
  .chart-controls { margin-top: 0; }
  .chart-controls .tool-row { position: absolute; left: 0; top: -48px; width: 58px; height: 48px; padding: 0 8px; border: 0; background: transparent; z-index: 8; }
  .chart-controls .tool-button { width: 42px; height: 42px; background: transparent; }
  .chart-controls .layout-row { height: 42px; }
  .chart-controls .theme-controls { height: 42px; }
  .chart-stage.layout-1 .chart-card-wrap:first-child .chart-timeframe { padding-left: 58px; }
  .chart-stage.layout-2 .chart-card-wrap:first-child .chart-timeframe { padding-left: 58px; }
  @media (max-width:420px) {
    .chart-controls .tool-row { width: 54px; padding: 0 6px; }
    .chart-stage.layout-1 .chart-card-wrap:first-child .chart-timeframe,
    .chart-stage.layout-2 .chart-card-wrap:first-child .chart-timeframe { padding-left: 54px; }
  }
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <style dangerouslySetInnerHTML={{ __html: chartSpacingFix }} />
        {children}
      </body>
    </html>
  );
}
