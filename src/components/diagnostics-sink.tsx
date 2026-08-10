"use client";

import { useEffect } from "react";
import { initDiagnostics } from "@/lib/diagnostics";

export default function DiagnosticsSink() {
  useEffect(() => {
    initDiagnostics();
  }, []);
  return null;
}