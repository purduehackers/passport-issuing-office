import { Ceremony } from "@/types/types";
import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getCeremonyData, getCeremonyList, getCeremonyPassports } from "./get-passport-data";


export default function CeremonyDropdown() {
    const [ceremonyList, setCeremonyList] = useState<Ceremony[]>([]);
    const [cLoading, setCLoading] = useState(true);

    useEffect(() => {
        const fetchCeremonies = async () => {
            setCLoading(true);
            try {
                const ceremonies = await getCeremonyList();
                setCeremonyList(ceremonies || []);
            } catch (error) {
                setCeremonyList([]);
            } finally {
                setCLoading(false);
            }
        };

        fetchCeremonies();
    }, []);

    if (cLoading) {
        return <div>Loading...</div>;
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
                        day: "numeric",
                        month: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(ceremony.ceremony_time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    })}
                    <PassportBadge ceremony={ceremony} />
                </DropdownMenuRadioItem>
            ))}
        </>
    );
}

interface PassportBadgeProps {
    ceremony: Ceremony;
}

export const PassportBadge: React.FC<PassportBadgeProps> = ({ ceremony }) => {
    const [passportCount, setPassportCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPassportCount = async () => {
            setLoading(true);
            try {
                const count = await getCeremonyPassports(ceremony);
                setPassportCount(count ?? 0);
            } catch (error) {
                console.error("Error fetching passport count:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPassportCount();
    }, [ceremony]);

    if (loading) {
        return <Badge variant="outline">Loading...</Badge>;
    }

    return (
        <Badge variant="outline">
            {ceremony.total_slots - passportCount}/{ceremony.total_slots} Slots
        </Badge>
    );
};