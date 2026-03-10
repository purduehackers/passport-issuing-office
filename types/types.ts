import { getOptimizedLatestPassportImage } from "@/lib/get-optimized-latest-passport-image";
import { JWT, User } from "next-auth";
import { z } from "zod";

export interface MySession {
	user: User;
	expires: string;
	token: JWT;
	passport: Passport | null;
	guildMember: object | null | undefined;
	role: string | undefined;
}

export interface Passport {
	id: number;
	owner_id: number;
	version: number;
	surname: string;
	name: string;
	date_of_birth: Date;
	date_of_issue: Date;
	ceremony_time: Date;
	place_of_origin: string;
	secret: string;
	activated: boolean;
}

export interface Ceremony {
	old_ceremony_time?: Date; // Specifically for modifying ceremonies
	ceremony_time: Date;
	total_slots: number;
	open_registration: boolean;
}

export interface Users {
	id: number;
	discord_id: bigint;
	role: string;
}

export type GenerationStatus = "pending" | "completed" | "failed";
export type GenerationStepId =
	| "processing_portrait"
	| "assigning_passport_number"
	| "generating_passport"
	| "downloading_passport"
	| "summoning_elves";

export interface GenerationStep {
	id: GenerationStepId;
	name: string;
	status: GenerationStatus;
	/**
	 * If true, the step is only visible when registering for a ceremony.
	 */
	registerOnly?: true;
}

export interface PassportGenData {
	passportNumber: number;
	surname: string;
	firstName: string;
	dateOfBirth: Date;
	dateOfIssue: Date;
	ceremonyTime: Date;
	placeOfOrigin: string;
	sendToDb: boolean;
	portrait?: File;
	stylizedPortrait?: File;
}

export type OptimizedLatestPassportImage = Awaited<
	ReturnType<typeof getOptimizedLatestPassportImage>
>;

export const GeneratePassportSchema = z.object({
	surname: z.string().default("HACKER"),
	firstName: z.string().default("WACK"),
	placeOfOrigin: z.string().default("THE WOODS"),
	dateOfBirth: z.coerce.date<string>(),
	dateOfIssue: z.coerce.date<string>().default(() => new Date()),
	ceremonyTime: z.coerce.date<string>().default(() => new Date()),
	passportNumber: z.number().int().default(0),
	portraitKey: z.string(),
	stylizedPortraitKey: z.string(),
	userId: z.string().optional(),
	sendToDb: z.boolean(),
});

export type GeneratePassportRequest = z.infer<typeof GeneratePassportSchema>;
export type GeneratePassportInput = z.input<typeof GeneratePassportSchema>;
