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

	// Return the concatanated string
	return (
		<span>
			{new Date(ceremonyDate).toLocaleDateString("en-US", {
				timeZone: "UTC",
				day: "numeric",
				month: "numeric",
			})}{" "}
			-{" "}
			{new Date(ceremonyDate).toLocaleTimeString("en-US", {
				timeZone: "UTC",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
			})}
		</span>
	);
}

export function getCeremonyTimeStringDate(ceremony: string) {
	let ceremonyDate = new Date();

	if (ceremony != "noPassportCeremony") {
		ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
	} else {
		ceremonyDate = new Date(-1);
	}

	// Return the concatanated string
	return (
		<span>
			{new Date(ceremonyDate).toLocaleDateString("en-US", {
				timeZone: "UTC",
				day: "numeric",
				month: "numeric",
			})}{" "}
		</span>
	);
}

export function getCeremonyTimeStringTime(ceremony: string, utc: boolean) {
	let ceremonyDate = new Date();

	if (ceremony != "noPassportCeremony") {
		ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
	} else {
		ceremonyDate = new Date(-1);
	}

	// Return the concatanated string
	return (
		<span>
			{" "}
			{new Date(ceremonyDate).toLocaleTimeString("en-US", {
				timeZone: "UTC",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
			})}
		</span>
	);
}