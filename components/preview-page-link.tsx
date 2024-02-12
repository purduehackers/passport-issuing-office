"use client";

import Link from "next/link";

export function PreviewPageLink({ children }: { children: React.ReactNode }) {
  return <Link href="/">{children}</Link>;
}
