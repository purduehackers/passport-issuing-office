import NextAuth, { NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

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
  callbacks: {
    async session({ session }) {
      return session;
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
