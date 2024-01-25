// Function to convert P3 to sRGB
export async function convertP3ToSRGB(p3DataURL: string) {
  // Create an OffscreenCanvas
  const offscreenCanvas = new OffscreenCanvas(1, 1);
  const offscreenContext = offscreenCanvas.getContext("2d", {
    colorSpace: "srgb",
  });
  if (!offscreenContext) {
    return;
  }

  // Load the P3 image into an HTMLImageElement
  const p3Image = new Image();
  p3Image.src = p3DataURL;

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

  console.log("blob", blob);

  return blob;
}

export async function processImage(portraitImageFile: File) {
  const scaling = 3;
  const width = 148 * scaling;
  const height = 185 * scaling;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const bgImage = new Image();
  bgImage.src = "/passport/portrait-bg.png";
  bgImage.onload = function () {
    ctx.drawImage(bgImage, 0, 0, width, height);
  };

  ctx.globalCompositeOperation = "color-burn";

  ctx.lineWidth = 16 * scaling;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, [8 * scaling]);
  ctx.stroke();

  const userImageUrl = URL.createObjectURL(portraitImageFile);
  const userImage = new Image();
  userImage.src = userImageUrl;
  userImage.onload = function () {
    ctx.drawImage(userImage, 0, 0, width, height);
  };
}
