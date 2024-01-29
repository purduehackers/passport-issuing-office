"use client";

import React, { useState, useRef } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import { cropPreview } from "../utils/cropPreview";
import { useDebounceEffect } from "../hooks/useDebounceEffect";
import "react-image-crop/dist/ReactCrop.css";
import { CROP_ASPECT } from "@/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function CropDemo({ control }: { control: any }) {
  //todo fix type
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [dialogOpen, setDialogOpen] = useState(false);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
      setDialogOpen(true);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, CROP_ASPECT));
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use cropPreview as it's much faster than imgPreview.
        cropPreview(imgRef.current, previewCanvasRef.current, completedCrop);
      }
    },
    100,
    [completedCrop]
  );

  return (
    <>
      <Input
        accept=".jpg, .jpeg, .png, .svg"
        type="file"
        onChange={onSelectFile}
      />
      <Dialog open={dialogOpen}>
        <DialogContent>
          <div className="flex flex-col gap-4">
            <div>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={CROP_ASPECT}
                ruleOfThirds
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
            <Button
              type="button"
              onClick={async (e) => {
                if (!completedCrop) return;
                const canvas = previewCanvasRef.current;
                if (!canvas) return;
                canvas.toBlob((blob) => {
                  if (!blob) return;
                  const croppedImageFile = new File(
                    [blob],
                    "cropped_data_page_portrait.png",
                    {
                      type: "image/png",
                    }
                  );
                });
              }}
            >
              Crop image
            </Button>
          </div>
          {/* {!!completedCrop && (
              <div>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    border: "1px solid black",
                    objectFit: "contain",
                    width: completedCrop.width,
                    height: completedCrop.height,
                  }}
                />
              </div>
            )} */}
        </DialogContent>
      </Dialog>
    </>
  );
}
