import { Passport } from "@/components/passport";
import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";
import { PassportGenData } from "@/types/types";
import { ImageResponse } from "next/og";

export async function fetchAssets(data: PassportGenData, url?: string) {
	let stylizedPortrait: File;
	if (data.stylizedPortrait) {
		stylizedPortrait = data.stylizedPortrait;
	} else {
		const defaultStylizedPortraitUrl = new URL(
			"/passport/no-image.png",
			url ?? "https://passport-data-pages.vercel.app",
		).href;
		const defaultStylizedPortraitRes = await fetch(defaultStylizedPortraitUrl);
		const defaultStylizedPortraitBlob = await defaultStylizedPortraitRes.blob();
		stylizedPortrait = new File([defaultStylizedPortraitBlob], "default_portrait.png", {
			type: "image/png",
		});
	}

	const stylizedPortraitImageBuffer = Buffer.from(await stylizedPortrait.arrayBuffer());
	const stylizedPortraitUrlB64 =
		`data:${stylizedPortrait.type};base64,` + stylizedPortraitImageBuffer.toString("base64");

	const interFontData = await fetch(
		new URL("../assets/Inter-Regular.ttf", import.meta.url),
	).then((res) => res.arrayBuffer());

	const interBoldFontData = await fetch(
		new URL("../assets/Inter-Bold.ttf", import.meta.url),
	).then((res) => res.arrayBuffer());

	const OCRBProFontData = await fetch(
		new URL("../assets/OCRB-Regular.ttf", import.meta.url),
	).then((res) => res.arrayBuffer());

	const dataPageBgUrl = `${process.env.R2_PUBLIC_URL}/data-page-bg.png`;

	return {
		stylizedPortraitUrlB64,
		dataPageBgUrl,
		interFontData,
		interBoldFontData,
		OCRBProFontData,
	};
}

export async function generateDataPage(
	data: PassportGenData,
	url?: string,
): Promise<ImageResponse> {
	const {
		stylizedPortraitUrlB64,
		dataPageBgUrl,
		interFontData,
		interBoldFontData,
		OCRBProFontData,
	} = await fetchAssets(data, url);

	return new ImageResponse(
		(
			<Passport
				data={data}
				stylizedPortraitUrlB64={stylizedPortraitUrlB64}
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
}

export async function generateFullFrame(data: PassportGenData, url?: string) {
	const { interFontData, interBoldFontData, OCRBProFontData } =
		await fetchAssets(data, url);

	const dataPage = Buffer.from(
		await (await generateDataPage(data, url)).arrayBuffer(),
	);
	const dataPageUrlB64 = "data:image/png;base64," + dataPage.toString("base64");

	const secondHalfUrl = `${process.env.R2_PUBLIC_URL}/page-1-second-half.png`;

	return new ImageResponse(
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
}
