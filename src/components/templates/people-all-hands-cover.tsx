"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Animated full-bleed card cover for the People All-Hands template.
 *
 * 55 thin bezier curves fan from the card's top edge to its bottom edge,
 * sweeping edge-to-edge in an S-curve so the ribbon fills the entire 16:9
 * frame with no large black voids. The lines are densely packed and their
 * control points breathe slowly via GSAP, making the whole mass flow.
 */

const N      = 55;   // number of ribbon lines
const SPREAD = 1.30; // total fan width — 1.0 fills exactly card height

// Centerline cubic bezier, normalized 0-1.
// Sweeps from left edge (lower-centre) to right edge (upper-centre) via
// an S-curve that carries the ribbon across the full frame.
const BASE = {
  p0x: -0.02, p0y: 0.65,
  c1x:  0.22, c1y: -0.12,
  c2x:  0.78, c2y:  1.12,
  p3x:  1.02, p3y:  0.35,
};

export function PeopleAllHandsCover() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el: HTMLCanvasElement = canvas;
    const cx: CanvasRenderingContext2D = ctx;

    const ctrl = { ...BASE };
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
      tweens.push(
        gsap.to(ctrl, { c1y: -0.06, duration: 9.0,  repeat: -1, yoyo: true, ease: "sine.inOut" }),
        gsap.to(ctrl, { c2y:  1.06, duration: 10.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5 }),
        gsap.to(ctrl, { c1x:  0.26, duration: 11.0, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 3.0 }),
        gsap.to(ctrl, { c2x:  0.74, duration: 9.5,  repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.0 }),
        gsap.to(ctrl, { p0y:  0.62, duration: 12.0, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 4.0 }),
        gsap.to(ctrl, { p3y:  0.38, duration: 10.0, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.0 }),
      );
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

      for (let i = 0; i < N; i++) {
        const t   = i / (N - 1);          // 0 … 1
        const off = (t - 0.5) * SPREAD;   // −0.65 … +0.65

        // Endpoints spread at 65 % of SPREAD so the ribbon reaches nearly
        // top/bottom at the card edges. Control points spread at 105 % so
        // the ribbon bows out wide in the body of the curve.
        const p0x = (ctrl.p0x             ) * w;
        const p0y = (ctrl.p0y + off * 0.65) * h;
        const c1x = (ctrl.c1x             ) * w;
        const c1y = (ctrl.c1y + off * 1.05) * h;
        const c2x = (ctrl.c2x             ) * w;
        const c2y = (ctrl.c2y + off * 1.05) * h;
        const p3x = (ctrl.p3x             ) * w;
        const p3y = (ctrl.p3y + off * 0.65) * h;

        // Colour: top lines cyan, bottom lines blue; centre brighter.
        const mid = 1 - Math.abs(t - 0.5) * 2; // 0 at edges, 1 at centre
        const r = Math.round(lerp(  0,  40, t));
        const g = Math.round(lerp(210,  90, t));
        const b = Math.round(lerp(255, 245, t));
        const a = 0.25 + mid * 0.60;

        cx.beginPath();
        cx.moveTo(p0x, p0y);
        cx.bezierCurveTo(c1x, c1y, c2x, c2y, p3x, p3y);
        cx.strokeStyle = `rgba(${r},${g},${b},${a.toFixed(2)})`;
        cx.lineWidth   = 1.8 + mid * 1.4;
        cx.stroke();
      }
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
