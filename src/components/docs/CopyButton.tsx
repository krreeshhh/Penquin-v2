"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

async function writeToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  // Fallback for older browsers.
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--vp-c-text-2)] shadow-sm transition-colors hover:text-[var(--vp-c-text-1)]"
      aria-label={copied ? "Copied" : "Copy"}
      onClick={async () => {
        await writeToClipboard(value);
        setCopied(true);
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
