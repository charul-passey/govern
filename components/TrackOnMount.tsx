"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

// Fires a custom analytics event once when the page mounts, so direct visits
// (not just in-app link clicks) are counted.
export function TrackOnMount({ event }: { event: string }) {
  useEffect(() => {
    track(event);
  }, [event]);
  return null;
}
