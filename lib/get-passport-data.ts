'use server'

import prisma from "@/lib/prisma";

export async function getCeremonyList() {
	try {
		const ceremonies = await prisma.ceremonies.findMany({
			where: {
				ceremony_time: {
					gte: new Date(),
				},
			},
		});
		return ceremonies;
	} catch (_err) {
		return undefined;
	}
}

export async function getAllPassports() {
	try {
		const passportList = await prisma.passport.findMany();

		return passportList.map(passport => ({
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