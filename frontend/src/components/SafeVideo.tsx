"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";

/**
 * SafeVideo — a drop-in replacement for <video autoPlay …>.
 *
 * The browser fires a Runtime AbortError when:
 *   1. autoPlay (or a JS .play() call) starts an async play() promise, AND
 *   2. the element is removed from the DOM before the promise resolves
 *      (e.g. during a React re-render, navigation, or hydration).
 *
 * This component catches that specific error silently and pauses + nulls
 * the source on unmount to prevent memory leaks and stale play attempts.
 */
type SafeVideoProps = ComponentPropsWithoutRef<"video">;

export default function SafeVideo({ autoPlay, ...props }: SafeVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    // Kick off play and silently swallow AbortError / NotAllowedError.
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err: Error) => {
        // AbortError  — element removed before play resolved (expected, safe to ignore)
        // NotAllowedError — browser blocked autoplay (no user gesture yet, also safe to ignore)
        if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
          console.warn("[SafeVideo] Unexpected play() error:", err);
        }
      });
    }

    return () => {
      // On unmount: pause and clear src so the browser stops buffering/decoding.
      try {
        video.pause();
        video.removeAttribute("src");
        video.load(); // Resets internal state to prevent leaked media resource
      } catch {
        // Already detached from DOM — nothing to do.
      }
    };
  }, [autoPlay]);

  return <video ref={videoRef} {...props} />;
}
