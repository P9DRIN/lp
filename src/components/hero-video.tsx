"use client";

import { useEffect, useRef } from "react";

/**
 * Pre-rendered version of the tile animation.
 *
 * The source clip does not loop — it ends on a lit tile and cuts back to a
 * dark one — so the served files are a ping-pong of it (forward then reverse),
 * which closes the seam. See the encode notes in `docs/hero-video.md`.
 *
 * VP9 10-bit comes first: the extra precision is what keeps the wide grey
 * gradient free of banding, and it encodes this content roughly six times
 * smaller than the H.264 fallback.
 *
 * The poster is the page's LCP element, so the clip itself stays off the
 * critical path: nothing is fetched until the page has finished loading, and
 * only then does playback start. Until that point the poster is the frame.
 */
export function HeroVideo({
  className,
  poster,
}: {
  className?: string;
  poster: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // An autoplaying background loop is motion like any other — hold the
    // poster frame instead when the user asked for less of it.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ready = false;
    let onScreen = true;

    const apply = () => {
      if (!ready || motionQuery.matches || !onScreen) video.pause();
      else void video.play().catch(() => {});
    };
    motionQuery.addEventListener("change", apply);

    // Decoding 1080p off-screen is wasted battery.
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        apply();
      },
      { threshold: 0 }
    );
    observer.observe(video);

    const start = () => {
      ready = true;
      apply();
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
      motionQuery.removeEventListener("change", apply);
      observer.disconnect();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      preload="none"
      loop
      muted
      playsInline
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/video/hero-loop.webm" type="video/webm" />
      <source src="/video/hero-loop.mp4" type="video/mp4" />
    </video>
  );
}
