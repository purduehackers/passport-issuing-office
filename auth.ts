import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const scopes = ["identify", "email", "guilds"];

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
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
    async session({ session, token }) {
      return { ...session, token };
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;

        // TODO: fetch https://discord.com/api/users/@me/guilds and ensure user is in the Purdue Hackers server
      }
      return token;
    },
  },
});
