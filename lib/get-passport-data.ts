"use server";

import prisma from "@/lib/prisma";
import { Ceremony, Passport, Users } from "@/types/types";

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
					gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
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

export async function getPassport(id: string): Promise<Passport | null> {
	try {
		const passport = await prisma.passport.findFirst({
			where: {
				id: Number(id),
			},
		});

		if (passport) {
			return passport;
		}
	} catch (_err) {
		return null;
	}
  return null;
}

export async function getAllPassports() {
	try {
		const passportList = await prisma.passport.findMany();
		return passportList;
	} catch (_err) {
		console.log(_err);
		return undefined;
	}
}

export async function getAllUsers() {
	try {
		const users = await prisma.user.findMany();

		let validUsers: Users[] = [];

		for (const user of users) {
			try {
				validUsers.push(user);
			} catch {}
		}
		
		return validUsers;
	} catch (_err) {
		return undefined;
	}
}