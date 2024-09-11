import prisma from "@/lib/prisma";

export async function getLatestPassport(discordId: string) {
	try {
		const bigIntUserId = BigInt(`${discordId}`);
		const user = await prisma.user.findFirst({
			where: {
				discord_id: bigIntUserId,
			},
		});
		if (user) {
			const latestPassport = await prisma.passport.findFirst({
				where: {
					owner_id: user.id,
				},
				orderBy: {
					id: "desc",
				},
			});
			if (latestPassport) {
				return latestPassport;
			}
		}
	} catch (_err) {
		return undefined;
	}
}

export async function getLatestOverallPassportId(): Promise<number> {
	const latestPassport = await prisma.passport.findFirst({
		orderBy: {
			id: "desc",
		},
	});
	if (latestPassport) {
		return latestPassport.id;
	} else {
		return 0;
	}
}
