"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";

export function PreviewPageLink({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Link className={cn(className)} href="/">
			{children}
		</Link>
	);
}
