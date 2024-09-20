import { Badge } from "@/components/ui/badge";
import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { getCeremonyList } from "./get-passport-data";
import { Ceremony } from "@/types/types";

export function getCeremonyTimeDate(ceremony: string) {
    if (ceremony != "noPassportCeremony") {
        return new Date(ceremony.replace("ceremony-", ""));
    } else {
        return new Date(-1);
    }
}

export function getCeremonyTimestamp(ceremony: string) {
    return ceremony.replace("ceremony-", "");
}

export function getCeremonyTimeString(ceremony: string) {
    let ceremonyDate = new Date();

    if (ceremony != "noPassportCeremony") {
        ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
    } else {
        ceremonyDate = new Date(-1);
    }

    //let cDateString = cMonth + "/" + cDay
    let cDateString = ceremonyDate.toLocaleString('en-US', { day: 'numeric', month: 'numeric' });

    let cTimeString = ceremonyDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    let cCurrentParticipants = 0 // Current Registered Participants
    let cTotalParticipants = 10 // Total Possible Participants

    // Return the concatanated string
    return cDateString + " - " + cTimeString + ": " + (cTotalParticipants - cCurrentParticipants) + "/" + cTotalParticipants + " Slots Available";
}

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
                    {new Date(ceremony.ceremony_time).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'numeric',
                    })} - {new Date(ceremony.ceremony_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    })}
                    <Badge variant="outline">
                        10/{ceremony.total_slots} Slots
                    </Badge>
                </DropdownMenuRadioItem>
            ))}
        </>
    );
}