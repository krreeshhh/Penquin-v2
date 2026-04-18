"use client";

import { useEffect } from "react";

export function ConsoleSuppressor() {
  // This needs to run as early as possible
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    const orig = console.error;
    console.error = (...args: any[]) => {
      if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
        return;
      }
      orig.apply(console, args);
    };
  }

  return null;
}
