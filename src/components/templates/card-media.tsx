"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const FALLBACK_THUMBNAIL = "/templates/placeholder-fallback.svg";

type Props = {
  thumbnailUrl: string;
  previewVideoUrl?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
};

/**
 * Card media with the §9 fallback chain:
 *   video (if present, lazy-loaded, autoplay on hover/focus/tap) →
 *   static thumbnail →
 *   branded placeholder.
 *
 * Video is suppressed entirely when the device can't hover comfortably,
 * when prefers-reduced-motion is reduce, or when navigator.connection.saveData
 * is true. On mobile the user taps the card once to play a short preview.
 */
export function CardMedia({ thumbnailUrl, previewVideoUrl, alt, sizes, priority }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const errorId = useId();

  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [allowVideo, setAllowVideo] = useState(false);
  const [inView, setInView] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  // Decide once on mount whether this device should even consider playing
  // video previews. We don't auto-flip later — opinionated and predictable.
  useEffect(() => {
    if (!previewVideoUrl) return;
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const saveData =
      typeof navigator !== "undefined" &&
      // @ts-expect-error -- not in lib.dom yet on all targets
      Boolean(navigator.connection?.saveData);

    // Touch devices: still allow tap-to-play, but skip on reduced-motion / data-saver.
    if (reduceMotion || saveData) return;
    setAllowVideo(canHover || "ontouchstart" in window);
  }, [previewVideoUrl]);

  // Observe the card so video only loads when it nears the viewport.
  useEffect(() => {
    if (!allowVideo) return;
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [allowVideo]);

  // Hover/focus on desktop; tap toggles on touch devices.
  const onPointerEnter = useCallback(() => setShouldPlay(true), []);
  const onPointerLeave = useCallback(() => setShouldPlay(false), []);
  const onTouchStart = useCallback(() => setShouldPlay((p) => !p), []);

  // Drive playback off state changes rather than imperatively in handlers.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay && inView && !videoFailed) {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => setVideoFailed(true));
    } else {
      video.pause();
    }
  }, [shouldPlay, inView, videoFailed]);

  const showVideo = Boolean(previewVideoUrl) && allowVideo && inView && !videoFailed;
  const imgSrc = thumbnailFailed ? FALLBACK_THUMBNAIL : thumbnailUrl;

  return (
    <div
      ref={wrapperRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onPointerEnter}
      onBlur={onPointerLeave}
      onTouchStart={onTouchStart}
      className="relative size-full"
    >
      {/* Static fallback layer — always rendered for layout stability and as the
          poster when video plays. */}
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setThumbnailFailed(true)}
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
      />

      {showVideo ? (
        <video
          ref={videoRef}
          src={previewVideoUrl}
          poster={imgSrc}
          muted
          loop
          playsInline
          preload="metadata"
          aria-describedby={errorId}
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}

      {/* Empty live region; we keep an id so the video element can describedby
          point here even when there's nothing to announce. */}
      <span id={errorId} className="sr-only" />
    </div>
  );
}
