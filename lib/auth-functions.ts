"use server";
import { signIn, signOut } from "@/auth";

export async function signOutAuth() {
	await signOut();
}

export async function signInAuth() {
	await signIn("discord");
}
