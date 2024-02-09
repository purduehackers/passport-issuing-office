import { GenerationSteps } from "./types/types";

export const IMAGE_GENERATION_SCALE_FACTOR = 3;

export const CURRENT_PASSPORT_VERSION = 0;

export const CROP_ASPECT = 0.8;

export const GENERATION_STEPS: GenerationSteps = {
  base: [
    {
      id: "processing_portrait",
      name: "Processing portrait",
      status: "pending",
    },
    {
      id: "generating_data_page",
      name: "Generating data page",
      status: "pending",
    },
    {
      id: "summoning_elves",
      name: "Summoning elves",
      status: "pending",
    },
  ],
  register: [
    {
      id: "processing_portrait",
      name: "Processing portrait",
      status: "pending",
    },
    {
      id: "assigning_passport_number",
      name: "Assigning passport number",
      status: "pending",
    },
    {
      id: "generating_data_page",
      name: "Generating data page",
      status: "pending",
    },
    {
      id: "generating_frame",
      name: "Generating full passport page",
      status: "pending",
    },
    {
      id: "uploading",
      name: "Uploading image",
      status: "pending",
    },
  ],
};
