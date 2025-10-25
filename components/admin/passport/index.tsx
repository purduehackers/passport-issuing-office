"use client";

import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getPassport } from "@/lib/get-passport-data";
import { Passport } from "@/types/types";

const IndividualPassportAdmin = ({ id }: { id: string }) => {
	const [passport, setPassport] = useState<Passport | null>(null);

	useEffect(() => {
		(async () => {
			const passport = await getPassport(id);
			setPassport(passport);
		})();
	}, [id]);

	const supportsWebNFC = "NDEF" in window;

	const writeNFCTag = useCallback(async () => {
		try {
			const ndef = new NDEFReader();
			await ndef.write({
				records: [
					{
						recordType: "url",
						data: `https://id.purduehackers.com/scan?id=${passport!.id}&secret=${passport!.secret}`,
					},
					{
						recordType: "text",
						data: String(passport!.id),
					},
					{
						recordType: "text",
						data: passport!.secret,
					},
				],
			});
		} catch (error) {
			alert("Error writing tag: " + error);
		}
	}, [passport]);

	console.log(passport);

	return (
		<div className="w-full">
			{passport && (
				<h1>
					{passport.name}&apos;s passport (ID: {passport.id})
				</h1>
			)}
			<Card className="mx-auto">
				<CardHeader>
					<CardTitle>Activate this passport</CardTitle>
					<CardDescription>
						Hold up to a new passport to activate. Your device must support
						WebNFC to use this feature.
						{!supportsWebNFC && " Your device does not support WebNFC."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						className="rounded-[0.25rem] border-2 border-slate-800 bg-amber-500 px-4 py-2 text-sm font-bold text-slate-800 shadow-[4px_4px_0_0_#0f172a] transition-colors hover:bg-amber-500/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0"
						onClick={writeNFCTag}
						disabled={!supportsWebNFC}
					>
						Activate
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default IndividualPassportAdmin;
