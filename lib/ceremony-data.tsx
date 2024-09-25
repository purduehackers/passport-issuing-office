export function getCeremonyTimeDate(ceremony: string | Date) {
	let ceremonyDate = new Date(-1);

	if (typeof ceremony == "string") {
		if (ceremony != "noPassportCeremony") {
			ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
		}
	} else {
		ceremonyDate = ceremony;
	}

	return ceremonyDate;
}

export function getCeremonyTimestamp(ceremony: string) {
	return ceremony.replace("ceremony-", "");
}

export function getCeremonyTimeString(ceremony: string | Date) {
	let ceremonyDate = new Date(-1);

	if (typeof ceremony == "string") {
		if (ceremony != "noPassportCeremony") {
			ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
		}
	} else {
		ceremonyDate = ceremony;
	}

	// Return the concatanated string
	return (
		<span>
			{ceremonyDate.toLocaleDateString("en-US", {
				timeZone: "UTC",
				day: "numeric",
				month: "numeric",
			})}{" "}
			-{" "}
			{ceremonyDate.toLocaleTimeString("en-US", {
				timeZone: "UTC",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
			})}
		</span>
	);
}

export function getCeremonyTimeStringDate(ceremony: string | Date) {
	let ceremonyDate = new Date(-1);

	if (typeof ceremony == "string") {
		if (ceremony != "noPassportCeremony") {
			ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
		}
	} else {
		ceremonyDate = ceremony;
	}

	// Return the concatanated string
	return (
		<span>
			{ceremonyDate.toLocaleDateString("en-US", {
				timeZone: "UTC",
				day: "numeric",
				month: "numeric",
			})}{" "}
		</span>
	);
}

export function getCeremonyTimeStringFullDate(ceremony: string | Date) {
	let ceremonyDate = new Date(-1);

	if (typeof ceremony == "string") {
		if (ceremony != "noPassportCeremony") {
			ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
		}
	} else {
		ceremonyDate = ceremony;
	}

	// Return the concatanated string
	return (
		<span>
			{ceremonyDate.toLocaleDateString("en-US", {
				timeZone: "UTC",
				day: "numeric",
				month: "long",
				year: "numeric",
			})}{" "}
		</span>
	);
}

export function getCeremonyTimeStringTime(ceremony: string | Date) {
	let ceremonyDate = new Date(-1);

	if (typeof ceremony == "string") {
		if (ceremony != "noPassportCeremony") {
			ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
		}
	} else {
		ceremonyDate = ceremony;
	}

	// Return the concatanated string
	return (
		<span>
			{" "}
			{ceremonyDate.toLocaleTimeString("en-US", {
				timeZone: "UTC",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
			})}
		</span>
	);
}