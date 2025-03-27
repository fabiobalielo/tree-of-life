"use client";

import React from "react";
import { Toaster } from "sonner";

export default function KabbalahLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden bg-[var(--background)]">
        {children}
      </div>
      <Toaster richColors />
    </>
  );
}
