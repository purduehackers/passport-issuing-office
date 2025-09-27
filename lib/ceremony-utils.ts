"use server";

import prisma from "@/lib/prisma";
import { Ceremony } from "@/types/types";

export async function addNewCeremony(ceremonyData: Ceremony) {
	try {
		await prisma.ceremonies.create({
			data: {
				ceremony_time: new Date(ceremonyData.ceremony_time.getTime()),
				total_slots: ceremonyData.total_slots,
				open_registration: ceremonyData.open_registration,
			},
		});
		return true;
	} catch (_err) {
		console.log(_err);
		return false;
	}
}

export async function modifyCeremony(ceremonyData: Ceremony) {
	try {
		await prisma.ceremonies.update({
			where: {
				ceremony_time: ceremonyData.old_ceremony_time,
			},
			data: {
				ceremony_time: ceremonyData.ceremony_time,
				total_slots: ceremonyData.total_slots,
				open_registration: ceremonyData.open_registration,
			},
		});
		return true;
	} catch (_err) {
		return false;
	}
}

export async function deleteCeremony(ceremonyDate: Date) {
	try {
		await prisma.ceremonies.delete({
			where: {
				ceremony_time: ceremonyDate,
			},
		});
		return true;
	} catch (_err) {
		return false;
	}
}
