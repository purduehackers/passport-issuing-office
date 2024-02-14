import { User } from "next-auth";

export interface MySession {
  user: User;
  expires: string;
  token: Token;
  passport: Passport | null;
}

export interface Token {
  name: string;
  email: string;
  picture: string;
  sub: string;
  accessToken: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface Passport {
  id: number;
  owner_id: number;
  version: number;
  surname: string;
  name: string;
  date_of_birth: string;
  date_of_issue: string;
  place_of_origin: string;
  secret: string;
  activated: boolean;
}

export type GenerationStatus = "pending" | "completed" | "failed";
export type GenerationStepId =
  | "processing_portrait"
  | "generating_data_page"
  | "generating_frame"
  | "assigning_passport_number"
  | "uploading"
  | "summoning_elves";

export interface GenerationStep {
  id: GenerationStepId;
  name: string;
  status: GenerationStatus;
}

export interface GenerationSteps {
  base: GenerationStep[];
  register: GenerationStep[];
}

export interface PassportGenData {
  passportNumber: number;
  surname: string;
  firstName: string;
  dateOfBirth: Date;
  dateOfIssue: Date;
  placeOfOrigin: string;
  sendToDb: boolean;
  portrait?: File;
}
