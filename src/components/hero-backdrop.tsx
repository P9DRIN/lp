"use client";

import dynamic from "next/dynamic";
import { HeroVideo } from "@/components/hero-video";

// three.js is ~600 KB — keep it out of the initial bundle and off the server.
const TileGrid = dynamic(
  () => import("@/components/tile-grid").then((m) => m.TileGrid),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-full w-full"
        style={{
          background:
            "radial-gradient(120% 100% at 72% 45%, #dbeafe 0%, #eef2f8 45%, #f8fafc 100%)",
        }}
      />
    ),
  }
);

/**
 * Client half of the hero: the backdrop is the only part that needs the
 * browser, so the copy above it can stay a server component and paint without
 * waiting for hydration.
 */
export function HeroBackdrop({
  visual,
  poster,
}: {
  visual: "video" | "webgl";
  poster: string;
}) {
  // object-position keeps the blue tile in frame once the card gets narrower
  // than the clip's 16:9.
  return visual === "video" ? (
    <HeroVideo
      poster={poster}
      className="h-full w-full object-cover object-[68%_50%] lg:object-center"
    />
  ) : (
    <TileGrid className="h-full w-full" />
  );
}
