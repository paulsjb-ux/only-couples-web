/**
 * Merge these into your root layout.tsx metadata + head.
 *
 * import type { Metadata } from "next";
 *
 * export const metadata: Metadata = {
 *   title: {
 *     default: "The Other Room",
 *     template: "%s · The Other Room",
 *   },
 *   description:
 *     "A private studio for the two of you. Your faces. Your terms. Nothing leaves your studio.",
 *   icons: {
 *     icon: "/favicon-32.png",
 *     apple: "/apple-touch-icon.png",
 *   },
 *   openGraph: {
 *     title: "The Other Room",
 *     description: "A private studio for the two of you.",
 *     images: [{ url: "/brand/social/og-card.jpg", width: 1168, height: 784 }],
 *   },
 *   twitter: {
 *     card: "summary_large_image",
 *     images: ["/brand/social/og-card.jpg"],
 *   },
 * };
 *
 * And in globals.css:
 *   @import "./globals-brand.css";
 */

export const brandMetadata = {
  title: {
    default: "The Other Room",
    template: "%s · The Other Room",
  },
  description:
    "A private studio for the two of you. Your faces. Your terms. Nothing leaves your studio.",
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "The Other Room",
    description: "A private studio for the two of you.",
    images: [{ url: "/brand/social/og-card.jpg", width: 1168, height: 784 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    images: ["/brand/social/og-card.jpg"],
  },
};
