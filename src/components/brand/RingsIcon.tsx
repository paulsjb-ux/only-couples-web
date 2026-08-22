import Image from "next/image";

export function RingsIcon({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/icons/01-rings-icon-black.jpg"
      alt=""
      width={128}
      height={128}
      className={`tor-rings ${className}`}
    />
  );
}
