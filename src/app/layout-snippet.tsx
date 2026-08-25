/**
 * MERGE into your root layout.tsx
 * 1. Import the fonts
 * 2. Put the CSS variables on <html>
 * 3. Remove any manual <link> tags for the old woff2 files
 */

import { display, body } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased">
        {children}
      </body>
    </html>
  );
}
