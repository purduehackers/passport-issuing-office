import { PixelCrop } from "react-image-crop";

const TO_RADIANS = Math.PI / 180;

export async function generateNewCroppedImageFile(
	image: HTMLImageElement,
	crop: PixelCrop,
	scale = 1,
	rotate = 0,
) {
	const canvas = new OffscreenCanvas(crop.width, crop.height);
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("No 2d context");
	}

	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;

	canvas.width = Math.floor(crop.width * scaleX);
	canvas.height = Math.floor(crop.height * scaleY);

	ctx.imageSmoothingQuality = "high";

	const cropX = crop.x * scaleX;
	const cropY = crop.y * scaleY;

	const rotateRads = rotate * TO_RADIANS;
	const centerX = image.naturalWidth / 2;
	const centerY = image.naturalHeight / 2;

	ctx.save();

	// 5) Move the crop origin to the canvas origin (0,0)
	ctx.translate(-cropX, -cropY);
	// 4) Move the origin to the center of the original position
	ctx.translate(centerX, centerY);
	// 3) Rotate around the origin
	ctx.rotate(rotateRads);
	// 2) Scale the image
	ctx.scale(scale, scale);
	// 1) Move the center of the image to the origin (0,0)
	ctx.translate(-centerX, -centerY);
	ctx.drawImage(
		image,
		0,
		0,
		image.naturalWidth,
		image.naturalHeight,
		0,
		0,
		image.naturalWidth,
		image.naturalHeight,
	);

	ctx.restore();

	const canvasBlob = await canvas.convertToBlob();
	return new File([canvasBlob], "cropped_data_page_portrait.png", {
		type: "image/png",
	});
}
