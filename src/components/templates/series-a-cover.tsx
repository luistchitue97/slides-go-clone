"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Animated cover for the Series A Data Room card.
 * Recreates the soft blurred gradient blobs from template-01.PNG on a dark
 * background: a large purple cloud upper-centre and a vivid blue cloud
 * upper-right, drifting slowly via GSAP so the composition breathes without
 * competing with the page background animation.
 */

type Orb = { x: number; y: number; r: number; rgb: string; a: number };

const BASE: Orb[] = [
  { x: 0.38, y: 0.18, r: 0.90, rgb: "140, 70, 245",  a: 0.88 }, // purple — upper centre
  { x: 0.82, y: 0.12, r: 0.72, rgb: "55, 115, 255",  a: 0.82 }, // blue   — upper right
  { x: 0.18, y: 0.35, r: 0.52, rgb: "200, 80, 255",  a: 0.65 }, // violet — left accent
];

// Drift targets — small movements so the blobs gently float
const TARGETS: [number, number][] = [
  [0.42, 0.22],
  [0.78, 0.16],
  [0.22, 0.30],
];

const DURATIONS = [5, 6, 4];

export function SeriesACover() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el: HTMLCanvasElement = canvas;
    const cx: CanvasRenderingContext2D = ctx;

    const orbs: Orb[] = BASE.map((o) => ({ ...o }));
    const tweens: gsap.core.Tween[] = [];

    const resize = () => {
      const dpr = devicePixelRatio || 1;
      el.width  = Math.round(el.clientWidth  * dpr);
      el.height = Math.round(el.clientHeight * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    if (!reduced) {
      orbs.forEach((orb, i) => {
        tweens.push(
          gsap.to(orb, {
            x: TARGETS[i][0],
            y: TARGETS[i][1],
            duration: DURATIONS[i],
            ease: "power2.out",
            delay: i * 0.4,
          }),
        );
      });
    }

    let rafId = 0;

    function draw() {
      rafId = requestAnimationFrame(draw);

      const dpr = devicePixelRatio || 1;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;

      cx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Very dark background — almost black with a hint of indigo
      cx.fillStyle = "#05040f";
      cx.fillRect(0, 0, w, h);

      cx.globalCompositeOperation = "screen";
      const scale = Math.max(w, h);

      for (const o of orbs) {
        const ox = o.x * w;
        const oy = o.y * h;
        const r  = o.r * scale;

        const g = cx.createRadialGradient(ox, oy, 0, ox, oy, r);
        g.addColorStop(0,    `rgba(${o.rgb}, ${o.a.toFixed(2)})`);
        g.addColorStop(0.45, `rgba(${o.rgb}, ${(o.a * 0.30).toFixed(2)})`);
        g.addColorStop(1,    `rgba(${o.rgb}, 0)`);

        cx.fillStyle = g;
        cx.fillRect(0, 0, w, h);
      }

      cx.globalCompositeOperation = "source-over";
    }

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      tweens.forEach((tw) => tw.kill());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
