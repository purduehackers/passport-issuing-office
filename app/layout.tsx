import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Agent, setGlobalDispatcher } from "undici";
import { Toaster } from "@/components/ui/toaster";

setGlobalDispatcher(new Agent({ connect: { timeout: 60_000 } }));

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
	title: "Passport Data Pages",
	description: "Customize your passport data page!",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={spaceGrotesk.variable}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
