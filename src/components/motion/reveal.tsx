"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  as?: "div" | "section" | "ul" | "ol" | "header";
  className?: string;
  /** Stagger reveal of direct children with [data-reveal] attribute. */
  stagger?: boolean;
  /** Y offset (px) the element starts from. Default 16. */
  y?: number;
  /** Duration in seconds. Default 0.7. */
  duration?: number;
  /** Trigger immediately on mount instead of on scroll-into-view. */
  immediate?: boolean;
  children: React.ReactNode;
};

/**
 * Tasteful reveal: elements render visible (CSS default). When JS + GSAP load
 * and prefers-reduced-motion is "no-preference", we set them to a slight
 * off-state and animate in. If JS fails or motion is reduced, the visible
 * default remains — content is never blocked.
 *
 * useGSAP({ scope }) cleans up tweens and ScrollTriggers when the component
 * unmounts, so navigation never leaks animations.
 */
export function Reveal({
  as: Tag = "div",
  className,
  stagger = false,
  y = 16,
  duration = 0.7,
  immediate = false,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger
          ? Array.from(ref.current!.querySelectorAll<HTMLElement>("[data-reveal]"))
          : [ref.current!];
        if (targets.length === 0) return;

        gsap.set(targets, { opacity: 0, y });

        const anim = {
          opacity: 1,
          y: 0,
          duration,
          ease: "power3.out",
          ...(stagger ? { stagger: 0.08 } : {}),
        };

        if (immediate) {
          gsap.to(targets, anim);
        } else {
          gsap.to(targets, {
            ...anim,
            scrollTrigger: {
              trigger: ref.current!,
              start: "top 85%",
              once: true,
            },
          });
        }
      });

      // After web fonts finish loading the text may reflow, which moves any
      // already-registered scroll triggers off their measured positions.
      // A single refresh once fonts settle keeps them accurate.
      if (typeof document !== "undefined" && "fonts" in document) {
        document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
      }

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
