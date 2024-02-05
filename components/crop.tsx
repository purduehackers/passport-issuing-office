"use client";

import React, { useState, useRef, Dispatch, SetStateAction } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  PixelCrop,
  // for some reason the eslint plugin thinks Crop is unused
  // eslint-disable-next-line unused-imports/no-unused-imports
  type Crop,
} from "react-image-crop";
import { generateNewCroppedImageFile } from "@/utils/generate-new-cropped-image-file";
import "react-image-crop/dist/ReactCrop.css";
import { CROP_ASPECT } from "@/config";
import { Dialog, DialogContent } from "./ui/dialog";
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

export function Crop({
  field,
  croppedImageFile,
  setCroppedImageFile,
}: {
  field: any;
  croppedImageFile: File | undefined;
  setCroppedImageFile: Dispatch<SetStateAction<File | undefined>>;
}) {
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cropping, setCropping] = useState(false);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      field.onChange(e.target.files ? e.target.files[0] : null);
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
            <div className="flex justify-center">
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
              disabled={cropping}
              onClick={async () => {
                setCropping(true);
                if (
                  imgRef.current &&
                  completedCrop?.width &&
                  completedCrop.height
                ) {
                  const newFile = await generateNewCroppedImageFile(
                    imgRef.current,
                    completedCrop
                  );
                  setCroppedImageFile(newFile);
                  setDialogOpen(false);
                  setCropping(false);
                }
              }}
            >
              {cropping ? "Cropping..." : "Crop Image"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
