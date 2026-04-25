import Image from "next/image";

type CampusBannerStripProps = {
  /** Fixed visual height — keeps layout compact (no full-viewport image column). */
  className?: string;
  /** LCP hint when this strip is the main hero (e.g. register top). */
  priority?: boolean;
};

/**
 * Short campus hero strip for auth pages (uses project Hero.jpg — CUST aerial).
 * `object-[50%_100%]` anchors the crop to the photo bottom (like object-bottom) so
 * a wide, short banner keeps more buildings / campus in frame and trims sky first,
 * without changing the strip height.
 */
export function CampusBannerStrip({
  className = "",
  priority = false,
}: CampusBannerStripProps) {
  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden ${className}`}
    >
      <Image
        src="/images/Hero.jpg"
        alt="CUST campus at sunset"
        fill
        className="object-cover object-[100%_60%]"
        sizes="100vw"
        priority={priority}
      />
      <div
        className="absolute inset-0 bg-linear-to-r from-brand-950/90 via-brand-900/55 to-brand-900/20"
        aria-hidden
      />
    </div>
  );
}
