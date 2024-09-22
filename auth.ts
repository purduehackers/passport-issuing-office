import NextAuth, { NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import prisma from "@/lib/prisma";
import { Passport, Token } from "./types/types";

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
		// next-auth thinks `token` doesn't exist. This is an issue on 5.0.0@beta.5.
		// Later beta versions fixed this, but introduced new problems that broke auth entirely.
		// I will check in periodically & fix this once new beta versions of next-auth
		// are released.
		//@ts-expect-error
		async session({ session, token: jwtToken }) {
			const token = jwtToken as Token;
			let passport: Passport | null = null;
			const bigIntUserId = BigInt(`${token.sub}`);
			let guildMember;
			let role;

			if (process.env.DISCORD_GUILD) {
				await fetch(
					"https://discordapp.com/api/users/@me/guilds",
					{
						headers: {
							"Authorization": "Bearer " + token.accessToken,
							"Content-Type": "application/json",
						},
					},
				)
					.then((guilds) => {
						return guilds.json();
					})
					.then(async (data) => {
						if (data) {
							guildMember = data.find(
								(o: { id: string }) => o.id === process.env.DISCORD_GUILD ?? "",
							);
						}
					});
			} else {
				guildMember = null;
			}

			let user = await prisma.user.findFirst({
				where: {
					discord_id: bigIntUserId,
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
							discord_id: bigIntUserId,
							role: "hacker",
						},
					});
				}
			}

			return { ...session, token, passport, guildMember, role };
		},
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token;
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
