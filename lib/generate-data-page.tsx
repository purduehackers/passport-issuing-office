import { Passport } from "@/components/passport";
import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";
import { PassportGenData } from "@/types/types";
import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export async function fetchAssets(data: PassportGenData, url?: string) {
	const [interFontData, interBoldFontData, OCRBProFontData] = await Promise.all(
		[
			fs.readFile(path.join(process.cwd(), "assets/Inter-Regular.ttf")),
			fs.readFile(path.join(process.cwd(), "assets/Inter-Bold.ttf")),
			fs.readFile(path.join(process.cwd(), "assets/OCRB-Regular.ttf")),
		],
	);

	const dataPageBgUrl = `${process.env.R2_PUBLIC_URL}/data-page-bg.png`;

	return {
		dataPageBgUrl,
		interFontData,
		interBoldFontData,
		OCRBProFontData,
	};
}

export async function generateDataPage(
	data: PassportGenData,
	url?: string,
): Promise<File> {
	const { dataPageBgUrl, interFontData, interBoldFontData, OCRBProFontData } =
		await fetchAssets(data, url);

	const imgResp = new ImageResponse(
		(
			<Passport
				data={data}
				dataPageBgUrl={dataPageBgUrl}
			/>
		),
		{
			width: 472 * IMAGE_GENERATION_SCALE_FACTOR,
			height: 322 * IMAGE_GENERATION_SCALE_FACTOR,
			fonts: [
				{
					name: "Inter",
					data: interFontData,
					style: "normal",
					weight: 500,
				},
				{
					name: "Inter Bold",
					data: interBoldFontData,
					style: "normal",
					weight: 800,
				},
				{
					name: "OCR B",
					data: OCRBProFontData,
					style: "normal",
					weight: 500,
				},
			],
		},
	);
	const dataPageBlob = await imgResp.blob();
	return new File([dataPageBlob], "data_page.png", {
		type: "image/png",
	});
}

export async function generateFullFrame(dataPage: Blob) {
	const dataPageUrlB64 =
		"data:image/png;base64," +
		Buffer.from(await dataPage.arrayBuffer()).toString("base64");
	const secondHalfUrl = `${process.env.R2_PUBLIC_URL}/page-1-second-half.png`;

	const imgResp = new ImageResponse(
		(
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "flex-start",
					alignItems: "flex-start",
					backgroundColor: "#ffffff",
				}}
			>
				<div
					style={{
						display: "flex",
						width: 324.63 * IMAGE_GENERATION_SCALE_FACTOR,
						height: 475.86 * IMAGE_GENERATION_SCALE_FACTOR,
					}}
				>
					<img
						src={dataPageUrlB64}
						alt="data page"
						width={475.86 * IMAGE_GENERATION_SCALE_FACTOR}
						height={324.63 * IMAGE_GENERATION_SCALE_FACTOR}
						style={{
							transform: "rotate(90deg) translateY(-100%)",
							transformOrigin: "top left",
						}}
					/>
				</div>
				<img
					src={secondHalfUrl}
					alt="second half"
					width={324.63 * IMAGE_GENERATION_SCALE_FACTOR}
					height={475.86 * IMAGE_GENERATION_SCALE_FACTOR}
					style={{ marginLeft: "-100%" }}
				/>
			</div>
		),
		{
			width: 794.66 * IMAGE_GENERATION_SCALE_FACTOR,
			height: 1028.49 * IMAGE_GENERATION_SCALE_FACTOR,
		},
	);
	const fullFrameBlob = await imgResp.blob();
	return new File([fullFrameBlob], "full_frame.png", {
		type: "image/png",
	});
}
