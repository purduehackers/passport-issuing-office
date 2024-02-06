import { Metadata } from "next";

export const runtime = "edge";

type Props = {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = params.username;

  return {
    metadataBase: new URL(
      "https://passport-data-pages-git-nextjs-tickets-purdue-hackers.vercel.app"
    ),
    title: `Make a passport with ${username}!`,
    openGraph: {
      images: [
        `https://passport-data-pages-git-nextjs-tickets-purdue-hackers.vercel.app/api/og?discordId=${username}`,
      ],
    },
  };
}

export default async function PassportPreview({ params }: Props) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900">
      <h1>hi {params.username}</h1>
    </div>
  );
}
