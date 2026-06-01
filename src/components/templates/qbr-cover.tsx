"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

/**
 * Animated cover for the Quarterly Business Review card.
 * Displays template-03.png with a slow, gentle float: the image drifts and
 * breathes via desynchronised GSAP tweens so it reads as a subtle wave
 * without fighting the page background animation.
 */
export function QbrCover() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Start slightly zoomed so edges never peek during translate
        gsap.set(ref.current, { scale: 1.08 });

        gsap.to(ref.current, {
          x: 8, y: -6,
          duration: 7,
          repeat: -1, yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(ref.current, {
          scale: 1.04,
          duration: 9,
          repeat: -1, yoyo: true,
          ease: "sine.inOut",
          delay: 1.5,
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="absolute inset-0 will-change-transform">
      <Image
        src="/templates/template-03.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
