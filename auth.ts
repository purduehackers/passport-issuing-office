import NextAuth, { NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import prisma from "@/lib/prisma";
import { Passport } from "./types/types";

export const authConfig = {
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID ?? "",
			clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
			token: "https://discord.com/api/oauth2/token",
			userinfo: "https://discord.com/api/users/@me",
			authorization:
				"https://discord.com/api/oauth2/authorize?scope=identify+guilds+email",
		}),
	],
	session: {
		strategy: "jwt",
	},
	secret: process.env.AUTH_SECRET,
	callbacks: {
		async session({ session, token }) {
			let passport: Passport | null = null;
			// This broke! Why? Who knows!
			//const bigIntUserId = BigInt(`${token.sub}`);

			// Jank workaround to grab the Discord ID
			const url = new URL(token.picture ?? "");
			const discordUserId = BigInt(url.pathname.split("/")[2]);

			let guildMember;
			let role;

			if (process.env.DISCORD_GUILD) {
				await fetch("https://discordapp.com/api/users/@me/guilds", {
					headers: {
						"Authorization": "Bearer " + token.access_token,
						"Content-Type": "application/json",
					},
				})
					.then((guilds) => {
						return guilds.json();
					})
					.then(async (data) => {
						if (data) {
							guildMember = data.find(
								(o: { id: string }) => o.id === process.env.DISCORD_GUILD,
							);
						}
					});
			} else {
				guildMember = true;
			}

			let user = await prisma.user.findFirst({
				where: {
					discord_id: discordUserId,
				},
			});
			if (user) {
				role = user.role;
				const latestPassport = await prisma.passport.findFirst({
					where: {
						owner_id: user.id,
					},
					orderBy: {
						id: "desc",
					},
				});
				if (latestPassport) {
					const updatedPassport = {
						...latestPassport,
						date_of_birth: latestPassport.date_of_birth.toISOString(),
						date_of_issue: latestPassport.date_of_issue.toISOString(),
						ceremony_time: latestPassport.ceremony_time.toISOString(),
					};
					passport = updatedPassport;
				}
			} else {
				if (guildMember) {
					user = await prisma.user.create({
						data: {
							discord_id: discordUserId,
							role: "hacker",
						},
					});
				}
			}

			return { ...session, token, passport, guildMember, role };
		},
		async jwt({ token, account }) {
			if (account) {
				return {
					...token,
					access_token: account.access_token,
				};
			}
			return token;
		},
	},
} satisfies NextAuthConfig;

export const {
	handlers: { GET, POST },
	signIn,
	signOut,
	auth,
} = NextAuth(authConfig);

// Extend JWT types
declare module "next-auth" {
	interface JWT {
		access_token: string;
	}
}
