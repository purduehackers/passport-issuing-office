import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";

// Function to convert P3 to sRGB
export async function convertP3ToSRGB(sourceImage: File): Promise<Blob> {
  // Create an OffscreenCanvas
  const offscreenCanvas = new OffscreenCanvas(1, 1);
  const offscreenContext = offscreenCanvas.getContext("2d", {
    colorSpace: "srgb",
  });
  if (!offscreenContext) {
    return Promise.reject();
  }

  // Load the P3 image into an HTMLImageElement
  const p3Image = new Image();
  p3Image.src = URL.createObjectURL(sourceImage);

  // Wait for the image to load
  await new Promise((resolve) => {
    p3Image.onload = resolve;
  });

  // Set canvas dimensions to match the image
  offscreenCanvas.width = p3Image.width;
  offscreenCanvas.height = p3Image.height;

  // Draw the P3 image onto the OffscreenCanvas
  offscreenContext.drawImage(p3Image, 0, 0);

  // Get the OffscreenCanvas as a data URL (sRGB)
  // const sRGBDataURL = offscreenCanvas.toDataURL('image/png');

  const blob = await offscreenCanvas.convertToBlob();

  if (!blob) {
    return Promise.reject();
  }

  return blob;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function processImage(inputFile: File): Promise<Blob> {
  const width = 148 * IMAGE_GENERATION_SCALE_FACTOR;
  const height = 185 * IMAGE_GENERATION_SCALE_FACTOR;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject();
  }

  const bgImage = await loadImage("/passport/portrait-bg.png");
  ctx.drawImage(bgImage, 0, 0, width, height);

  ctx.lineWidth = 16 * IMAGE_GENERATION_SCALE_FACTOR;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, [8 * IMAGE_GENERATION_SCALE_FACTOR]);
  ctx.stroke();

  ctx.globalCompositeOperation = "color-burn";

  const imageBlob = await convertP3ToSRGB(inputFile);
  if (!imageBlob) {
    return Promise.reject();
  }

  const userImage = new Image();
  userImage.src = URL.createObjectURL(imageBlob);
  await userImage.decode();

  ctx.drawImage(userImage, 0, 0, width, height);

  const finalImageData = await canvas.convertToBlob();

  if (!finalImageData) {
    return Promise.reject();
  }

  return finalImageData;
}
