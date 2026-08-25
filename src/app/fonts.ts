import { Cormorant_Garamond, Inter } from "next/font/google";

/**
 * SPEED: only load the weights you use.
 * display: "swap" → text is visible immediately.
 * Adjust family names to match your design.
 */

export const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-display",
  preload: true,
});

export const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-body",
  preload: true,
});
