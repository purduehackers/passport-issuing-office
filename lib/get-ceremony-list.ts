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