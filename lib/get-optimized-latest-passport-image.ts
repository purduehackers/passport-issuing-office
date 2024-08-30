import { getPlaiceholder } from "plaiceholder";

export async function getOptimizedLatestPassportImage(
  latestPassportId: number,
) {
  const latestPassportImageUrl = `${process.env.R2_PUBLIC_URL}/${latestPassportId}.png`;
  const buffer = await fetch(latestPassportImageUrl).then(async (res) =>
    Buffer.from(await res.arrayBuffer()),
  );
  const { metadata, base64 } = await getPlaiceholder(buffer);
  return { latestPassportImageUrl, metadata, base64 };
}
