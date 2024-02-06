import NextAuth, { NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import prisma from "@/lib/prisma";
import { Passport, Token } from "./types/types";

const scopes = ["identify", "guilds"];

export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      token: "https://discord.com/api/oauth2/token",
      userinfo: "https://discord.com/api/users/@me",
      authorization: { params: { scope: scopes.join(" ") } },
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
      const token = jwtToken as Token
      let passport: Passport | null = null;
      const bigIntUserId = BigInt(`${token.sub}`);

      let user = await prisma.user.findFirst({
        where: {
          discord_id: bigIntUserId,
        },
      });
      if (user) {
        const latestPassport = await prisma.passport.findFirst({
          where: {
            owner_id: user.id
          },
          orderBy: {
            id: 'desc'
          }
        })
        if (latestPassport) {
          //@ts-expect-error it thinks it's a Date but it's actually an ISO string — TODO FIX TYPE
          passport = latestPassport
        }
      } else {
        user = await prisma.user.create({
          data: {
            discord_id: bigIntUserId,
            role: "hacker",
          },
        });
      }

      return { ...session, token, passport };
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;

        // TODO: fetch https://discord.com/api/users/@me/guilds and ensure user is in the Purdue Hackers server
      }
      return token;
    },
  },
} satisfies NextAuthConfig

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth(authConfig);
