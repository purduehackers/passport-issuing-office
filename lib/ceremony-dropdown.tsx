import { Ceremony } from "@/types/types";
import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getCeremonyList } from "./get-passport-data";

export default function CeremonyDropdown() {
	const [ceremonyList, setCeremonyList] = useState<Ceremony[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCeremonies = async () => {
			try {
				let ceremonies = await getCeremonyList();
				setCeremonyList(ceremonies || []);
			} catch (error) {
				console.error("Error fetching ceremonies:", error);
				setCeremonyList([]);
			} finally {
				setLoading(false);
			}
		};

		fetchCeremonies();
	}, []);

	if (loading) {
		return <div>Loading...</div>; // Display a loading state
	}

	return (
		<>
			{ceremonyList.map((ceremony, index) => (
				<DropdownMenuRadioItem
					key={index}
					value={`ceremony-${ceremony.ceremony_time}`}
					className="flex justify-between items-center"
				>
					{new Date(ceremony.ceremony_time).toLocaleDateString("en-US", {
						timeZone: "UTC",
						day: "numeric",
						month: "numeric",
					})}{" "}
					-{" "}
					{new Date(ceremony.ceremony_time).toLocaleTimeString("en-US", {
						timeZone: "UTC",
						hour: "numeric",
						minute: "numeric",
						hour12: true,
					})}
					<Badge variant="outline">10/{ceremony.total_slots} Slots</Badge>
				</DropdownMenuRadioItem>
			))}
		</>
	);
}