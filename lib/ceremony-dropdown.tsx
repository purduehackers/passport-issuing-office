import { Ceremony } from "@/types/types";
import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getCeremonyList, getCeremonyPassports, getFullCeremonyList } from "./get-passport-data";


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
            {!(ceremonyList[0] == null) ? (
                <>
                    {ceremonyList.map((ceremony, index) => (
                        <DropdownMenuRadioItem
                            key={index}
                            value={`ceremony-${ceremony.ceremony_time}`}
                            className="flex justify-between items-center"
                            disabled={!ceremony.open_registration}
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
                            <PassportBadge ceremony={ceremony} />
                        </DropdownMenuRadioItem>
                    ))
                    }
                </>
            ) : (
                <>
                    <DropdownMenuRadioItem
                        key={"noCeremony1"}
                        value={`noPassportCeremony`}
                        className="flex justify-between items-center"
                        disabled={true}
                    >
                        No upcoming ceremonies
                    </DropdownMenuRadioItem>
                </>
            )}
        </>
    );
}

export function FullCeremonyDropdown() {
    const [ceremonyList, setCeremonyList] = useState<Ceremony[]>([]);
    const [cLoading, setCLoading] = useState(true);

    useEffect(() => {
        const fetchCeremonies = async () => {
            setCLoading(true);
            try {
                const ceremonies = await getFullCeremonyList();
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
            {!(ceremonyList[0] == null) ? (
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
                            <PassportBadge ceremony={ceremony} />
                        </DropdownMenuRadioItem>
                    ))
                    }
                </>
            ) : (
                <>
                    <DropdownMenuRadioItem
                        key={"noCeremony1"}
                        value={`noPassportCeremony`}
                        className="flex justify-between items-center"
                        disabled={true}
                    >
                        No upcoming ceremonies
                    </DropdownMenuRadioItem>
                </>
            )}
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