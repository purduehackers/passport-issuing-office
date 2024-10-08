"use server";

import prisma from "@/lib/prisma";
import { Ceremony } from "@/types/types";

export async function getCeremonyPassports(ceremony: Ceremony) {
	try {
		const passports = await prisma.passport.findMany({
			where: {
				ceremony_time: {
					equals: ceremony.ceremony_time,
				},
			},
		});
		return passports.length;
	} catch (_err) {
		return undefined;
	}
}

export async function getCeremonyData(ceremony_time: string) {
	try {
		const ceremony = await prisma.ceremonies.findFirst({
			where: {
				ceremony_time: {
					equals: ceremony_time,
				},
			},
		});
		if (ceremony) {
			return ceremony;
		}
		return undefined;
	} catch (_err) {
		return undefined;
	}
}

export async function getCeremonyList() {
	try {
		const ceremonies = await prisma.ceremonies.findMany({
			where: {
				ceremony_time: {
					gte: new Date(),
				},
			},
		});

		let passportListLength: number | undefined = 0;
		let validCeremonies: Ceremony[] = [];

		for (const ceremony of ceremonies) {
			try {
				passportListLength = await getCeremonyPassports(ceremony);
				if (passportListLength) {
					if (ceremony.total_slots > passportListLength) {
						validCeremonies.push(ceremony);
					} else {
						ceremony.open_registration = false;
						validCeremonies.push(ceremony);
					}
				} else {
					validCeremonies.push(ceremony);
				}
			} catch {}
		}
		
		return validCeremonies;
	} catch (_err) {
		return undefined;
	}
}

export async function getFullCeremonyList() {
	try {
		const ceremonies = await prisma.ceremonies.findMany({
			where: {
				ceremony_time: {
					gte: new Date(),
				},
			},
		});

		let validCeremonies: Ceremony[] = [];

		for (const ceremony of ceremonies) {
			try {
				validCeremonies.push(ceremony);
			} catch {}
		}
		
		return validCeremonies;
	} catch (_err) {
		return undefined;
	}
}

export async function getAllPassports() {
	try {
		const passportList = await prisma.passport.findMany();

		return passportList.map((passport) => ({
			...passport,
			date_of_issue: passport.date_of_issue.toISOString(),
			date_of_birth: passport.date_of_birth.toISOString(),
			ceremony_time: passport.ceremony_time.toISOString(),
		}));
	} catch (_err) {
		console.log(_err);
		return undefined;
	}
}
