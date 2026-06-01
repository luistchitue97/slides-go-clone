"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Animated cover for the Quarterly Business Review card.
 * Closely matches template-03.PNG:
 *   - Pure black fills most of the card
 *   - Compact purple-magenta bloom tucked in the bottom-left corner
 *   - Right-side arc: hot-pink and cyan overlap into a bright white-ish
 *     hot-spot (~80 % across, ~20 % down), then a blue arc sweeps down to
 *     lower-right, finishing with a teal tail
 *
 * Steep gradient falloff (full → 8 % at 0.22 → 0) keeps the glow tight so
 * the large black void reads correctly. Animation is a very slow, tiny
 * yoyo breathe — barely perceptible, just enough to feel alive.
 */

type Orb = { x: number; y: number; r: number; rgb: string; a: number };

const ORBS: Orb[] = [
  // ── Bottom-left corner ──────────────────────────────────────────────────
  { x: -0.04, y: 0.96, r: 0.38, rgb: "155, 25, 255",  a: 0.95 }, // violet core
  { x:  0.06, y: 0.80, r: 0.24, rgb: "230, 50, 255",  a: 0.85 }, // magenta accent

  // ── Right-side arc ───────────────────────────────────────────────────────
  { x:  0.92, y: 0.20, r: 0.40, rgb: "65, 215, 255",  a: 0.90 }, // cyan — large soft backing
  { x:  0.84, y: 0.22, r: 0.22, rgb: "255, 80, 200",  a: 0.92 }, // hot-pink — bright hot-spot
  { x:  1.04, y: 0.50, r: 0.36, rgb: "55, 115, 255",  a: 0.88 }, // blue — arc body (off-edge)
  { x:  0.88, y: 0.76, r: 0.28, rgb: "0, 220, 200",   a: 0.82 }, // teal — lower tail
];

// Tiny drift targets — each orb shifts ≤ 2.5 % of canvas
const TARGETS: [number, number][] = [
  [-0.02, 0.94],
  [ 0.08, 0.78],
  [ 0.90, 0.22],
  [ 0.82, 0.20],
  [ 1.02, 0.52],
  [ 0.90, 0.74],
];

const DURATIONS = [12, 10, 14, 11, 13, 10];

export function QbrCover() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el: HTMLCanvasElement = canvas;
    const cx: CanvasRenderingContext2D = ctx;

    const orbs: Orb[] = ORBS.map((o) => ({ ...o }));
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
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.8,
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
      cx.fillStyle = "#000000";
      cx.fillRect(0, 0, w, h);

      cx.globalCompositeOperation = "screen";
      const scale = Math.max(w, h);

      for (const o of orbs) {
        const ox = o.x * w;
        const oy = o.y * h;
        const r  = o.r * scale;

        const g = cx.createRadialGradient(ox, oy, 0, ox, oy, r);
        g.addColorStop(0,    `rgba(${o.rgb}, ${o.a.toFixed(2)})`);
        g.addColorStop(0.22, `rgba(${o.rgb}, ${(o.a * 0.08).toFixed(2)})`);
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
