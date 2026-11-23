"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return <Button variant="ghost" size="sm" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}>{copied ? "Copied" : label}</Button>;
}
