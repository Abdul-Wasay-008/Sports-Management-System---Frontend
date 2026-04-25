import Image from "next/image";

/**
 * Stock photo: runners on track (Unsplash) — decorative band between sections.
 */
export function VisualBreak() {
  return (
    <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80">
      <Image
        src="/images/athletes-track.jpg"
        alt="Athletes on a running track at sunset"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-linear-to-r from-brand-950/90 via-brand-900/50 to-brand-900/30"
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <p className="max-w-2xl text-center font-heading text-2xl font-bold tracking-wide text-white drop-shadow sm:text-3xl">
          One campus. One schedule. One place to compete fairly.
        </p>
      </div>
    </div>
  );
}
