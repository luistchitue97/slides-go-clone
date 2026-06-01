"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Full-page fixed canvas background modeled on bento-animation.png.
 *
 * Visual elements:
 *   - Deep navy base (#030d1e)
 *   - Left dot mesh: a curved C/parenthesis grid of dots on the left side.
 *     Rows taper at top and bottom, bow outward in the middle — like looking
 *     at the inner face of a cylinder. Dots grow larger and brighter toward
 *     the inner (viewer-facing) edge.
 *   - Right dot mesh: mirrored.
 *   - Orange diagonal light streaks: multiple glow-layer lines at ~60° angle,
 *     primarily on the right side (matching the source image), one on the left.
 *   - Dot colours: white-to-cyan spectrum, inner dots have a cool cyan tint.
 *
 * Motion (GSAP + RAF, gated by prefers-reduced-motion):
 *   - Dot waves: traveling sine waves phase-offset by grid position, giving
 *     the mesh a living, rippling surface feel.
 *   - Streak drift: GSAP yoyo tweens slowly walk each streak perpendicular
 *     to its own axis — they breathe in and out.
 *
 * Placement: position:fixed, z-index:-1 — sits behind every page section.
 * body must be background:transparent for the canvas to show through
 * (set in globals.css).
 */

const ROWS = 24;
const COLS = 18;

type StreakRef = { perp: number };

export function PageBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el: HTMLCanvasElement = canvas;
    const cx: CanvasRenderingContext2D = ctx;

    // Streak positions — GSAP animates `.perp` (normalized viewport-x center)
    const sr0: StreakRef = { perp: 0.72 }; // main right streak
    const sr1: StreakRef = { perp: 0.78 }; // right accent
    const sr2: StreakRef = { perp: 0.65 }; // right secondary
    const sl0: StreakRef = { perp: 0.18 }; // left streak

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
        gsap.to(sr0, { perp: 0.76, duration: 8,  repeat: -1, yoyo: true, ease: "sine.inOut" }),
        gsap.to(sr1, { perp: 0.74, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 }),
        gsap.to(sr2, { perp: 0.68, duration: 9,  repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.5 }),
        gsap.to(sl0, { perp: 0.14, duration: 13, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.5 }),
      );
    }

    let rafId = 0;

    function drawMesh(side: "left" | "right", t: number, w: number, h: number) {
      const isLeft = side === "left";

      for (let ri = 0; ri < ROWS; ri++) {
        const rv = ri / (ROWS - 1); // 0=top, 1=bottom

        // C-shape bow: sin(rv * PI) peaks at rv=0.5 (middle row)
        const bow = Math.sin(rv * Math.PI);

        for (let ci = 0; ci < COLS; ci++) {
          const cu = ci / (COLS - 1); // 0=outer(spine), 1=inner(front/viewer)

          // x extent for this row — inner edge bows out further in the middle
          const xInner = 0.20 + bow * 0.17; // 0.20 at extremes, 0.37 at middle
          const nx_base = 0.015 + cu * xInner;
          const ny_base = 0.04 + rv * 0.92;

          // Mirror for right side
          const nx = isLeft ? nx_base : 1.0 - nx_base;

          // Traveling wave
          let fx = nx;
          let fy = ny_base;
          if (!reduced) {
            const phase = cu * Math.PI * 4 + rv * Math.PI * 5;
            fx += (isLeft ? 1 : -1) * Math.sin(phase + t * 1.1) * 0.016;
            fy += Math.cos(phase * 0.65 + t * 0.8) * 0.011;
          }

          // Inner dots: large + bright (perspective "closer to viewer")
          const size  = 0.9 + cu * 2.9;
          const alpha = 0.08 + cu * 0.74;

          // White → cyan: inner dots are cooler and brighter
          const rv2 = Math.round(155 + cu * 85);
          const gv  = Math.round(198 + cu * 42);

          cx.beginPath();
          cx.arc(fx * w, fy * h, size, 0, Math.PI * 2);
          cx.fillStyle = `rgba(${rv2},${gv},255,${alpha.toFixed(2)})`;
          cx.fill();
        }
      }
    }

    function drawStreak(
      ref: StreakRef,
      w: number,
      h: number,
      r: number, g: number, b: number,
      intensity: number,
    ) {
      // ~60° diagonal — matches the angle in the source image
      const angle = -Math.PI * 0.33;
      const cosA  = Math.cos(angle);
      const sinA  = Math.sin(angle);
      const len   = Math.hypot(w, h) * 1.4;

      const ox = ref.perp * w;
      const oy = 0.42 * h;

      const x1 = ox - cosA * len * 0.5;
      const y1 = oy - sinA * len * 0.5;
      const x2 = ox + cosA * len * 0.5;
      const y2 = oy + sinA * len * 0.5;

      const grad = cx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0,    `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.22, `rgba(${r},${g},${b},${(0.6 * intensity).toFixed(2)})`);
      grad.addColorStop(0.5,  `rgba(${r},${g},${b},${intensity.toFixed(2)})`);
      grad.addColorStop(0.78, `rgba(${r},${g},${b},${(0.6 * intensity).toFixed(2)})`);
      grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

      // Five glow layers: wide+soft → narrow+crisp
      const layers: [number, number][] = [
        [58, 0.012],
        [26, 0.038],
        [11, 0.088],
        [4,  0.220],
        [1.5, 0.520],
      ];

      layers.forEach(([lw, la]) => {
        cx.save();
        cx.globalAlpha = la * intensity;
        cx.lineWidth   = lw;
        cx.strokeStyle = grad;
        cx.beginPath();
        cx.moveTo(x1, y1);
        cx.lineTo(x2, y2);
        cx.stroke();
        cx.restore();
      });
    }

    function draw() {
      rafId = requestAnimationFrame(draw);

      const dpr = devicePixelRatio || 1;
      const w   = el.clientWidth;
      const h   = el.clientHeight;
      if (!w || !h) return;

      const t = performance.now() / 1000;

      cx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Dark navy base — matches the deep background in bento-animation.png
      cx.fillStyle = "#030d1e";
      cx.fillRect(0, 0, w, h);

      // Streaks rendered behind the dot meshes
      drawStreak(sr0, w, h, 255, 108, 18, 0.90);
      drawStreak(sr1, w, h, 255, 132, 24, 0.52);
      drawStreak(sr2, w, h, 255,  88, 12, 0.42);
      drawStreak(sl0, w, h, 255,  98, 14, 0.48);

      // Dot meshes
      drawMesh("left",  t, w, h);
      drawMesh("right", t, w, h);
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
      className="fixed inset-0 -z-10 h-full w-full opacity-75 hidden lg:block"
      style={{ filter: "blur(2px)" }}
      aria-hidden
    />
  );
}
