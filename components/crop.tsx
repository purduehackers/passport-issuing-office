'use client'

import { useState } from 'react'
import ReactCrop, { type Crop } from 'react-image-crop'

export function CropDemo({ src }: { src: string }) {
  const [crop, setCrop] = useState<Crop>()
  return (
    <ReactCrop aspect={0.682} crop={crop} onChange={(c) => setCrop(c)}>
      <img alt="crop test" src={src} />
    </ReactCrop>
  )
}