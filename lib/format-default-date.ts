export function formatDefaultDate(isoString: string) {
	const date = new Date(isoString);
	const year = date.getFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}
