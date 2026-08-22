import type { Metadata } from "next";

/** Drop into layout.tsx: export const metadata = torMetadata */
export const torMetadata: Metadata = {
  title: {
    default: "The Other Room",
    template: "%s · The Other Room",
  },
  description: "A private studio for the two of you.",
  applicationName: "The Other Room",
  icons: {
    icon: [{ url: "/brand/icons/04-monogram-TOR-favicon.jpg", type: "image/jpeg" }],
    apple: [{ url: "/brand/icons/03-app-icon-ios.jpg" }],
  },
  openGraph: {
    title: "The Other Room",
    description: "A private studio for the two of you.",
    images: [{ url: "/brand/logos/03-wordmark-og-card-with-tagline.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Other Room",
    description: "A private studio for the two of you.",
    images: ["/brand/logos/03-wordmark-og-card-with-tagline.jpg"],
  },
};
