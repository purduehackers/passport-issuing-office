"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getLatestPassport } from "@/lib/get-latest-passport";

const IndividualPassportAdmin = ({ id }: { id: string }) => {
	const [passportData, setPassportData] = useState(null);

	useEffect(() => {
		(async () => {
			const latestPassport = await getLatestPassport(id);
			setPassportData(latestPassport);
		})();
	});

	const writeNFCTag = async () => {
		try {
			const ndef = new NDEFReader();
			await ndef.write({
				records: [
					{
						recordType: "url",
						data: "https://www.google.com",
					},
				],
			});
		} catch (error) {
			alert("Error writing tag: " + error);
		}
	};

	console.log(passportData);

	return (
		<div className="w-full">
			<Card className="mx-auto">
				<CardHeader>
					<CardTitle>Activate this passport</CardTitle>
					<CardDescription>
						Hold up to a new passport to activate. Your device must support
						WebNFC to use this feature.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						className="rounded-[0.25rem] border-2 border-slate-800 bg-amber-500 px-4 py-2 text-sm font-bold text-slate-800 shadow-[4px_4px_0_0_#0f172a] transition-colors hover:bg-amber-500/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0"
						onClick={writeNFCTag}
					>
						Activate
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default IndividualPassportAdmin;
