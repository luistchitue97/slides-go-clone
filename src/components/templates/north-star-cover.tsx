"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Animated cover for the North Star Pitch card.
 * Recreates template-02.PNG: deep navy base, a large cyan arc on the left
 * edge and a soft purple bloom on the right. Orbs settle once into their
 * resting positions with power2.out — no looping.
 */

type Orb = { x: number; y: number; r: number; rgb: string; a: number };

const BASE: Orb[] = [
  { x: -0.10, y: 0.70, r: 0.92, rgb: "0, 175, 225",   a: 0.90 }, // cyan arc — left
  { x:  1.05, y: 0.28, r: 0.80, rgb: "130, 50, 210",  a: 0.85 }, // purple bloom — right
  { x:  0.42, y: 0.50, r: 0.65, rgb: "20,  60, 200",  a: 0.70 }, // deep blue — centre depth
];

const TARGETS: [number, number][] = [
  [-0.05, 0.62],
  [ 0.98, 0.32],
  [ 0.45, 0.48],
];

const DURATIONS = [5, 6, 4];

export function NorthStarCover() {
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

      // Deep navy base
      cx.fillStyle = "#020218";
      cx.fillRect(0, 0, w, h);

      cx.globalCompositeOperation = "screen";
      const scale = Math.max(w, h);

      for (const o of orbs) {
        const ox = o.x * w;
        const oy = o.y * h;
        const r  = o.r * scale;

        const g = cx.createRadialGradient(ox, oy, 0, ox, oy, r);
        g.addColorStop(0,    `rgba(${o.rgb}, ${o.a.toFixed(2)})`);
        g.addColorStop(0.45, `rgba(${o.rgb}, ${(o.a * 0.28).toFixed(2)})`);
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
