import Link from "next/link";
import Image from "next/image";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label="CapituLando — início"
      className="inline-flex items-center gap-3 text-[#4b1d3f] dark:text-pink-100"
    >
      <Image
        src="/brand/capitulando-logo.png"
        alt=""
        width={64}
        height={64}
        className="h-14 w-14 shrink-0 object-contain"
      />
      <span className="font-serif text-2xl font-bold tracking-tight">
        CapituLando<span className="text-[#90627f] dark:text-pink-300">.</span>
      </span>
    </Link>
  );
}
