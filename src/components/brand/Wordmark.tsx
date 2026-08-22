import Image from "next/image";

type Props = {
  variant?: "dark" | "light" | "lockup";
  className?: string;
};

const SRC = {
  dark: "/brand/logos/01-wordmark-cream-on-black.jpg",
  light: "/brand/logos/02-wordmark-charcoal-on-cream.jpg",
  lockup: "/brand/logos/03-wordmark-og-card-with-tagline.jpg",
} as const;

export function Wordmark({ variant = "dark", className = "" }: Props) {
  return (
    <Image
      src={SRC[variant]}
      alt="The Other Room"
      width={variant === "lockup" ? 800 : 480}
      height={variant === "lockup" ? 450 : 120}
      className={`tor-wordmark-dark ${className}`}
      priority
    />
  );
}
