"use client";

import Signature from "@uiw/react-signature";

export function SecretModalDescription({
	setSecretSignatureSigned,
}: {
	setSecretSignatureSigned: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	return (
		<>
			<div>
				<img
					src="/cover.svg"
					width={64}
					alt="Purdue Hackers passport cover"
					className="float-left mr-4 mt-1"
				/>
				<p>
					Under penalty of perjury within the jurisdiction of the Republic of
					Hackerland, you hereby solemnly swear the following:
				</p>
			</div>
			<p>
				1. You were given explicit instructions by a Purdue Hackers organizer to
				enable the secret options and skip the passport ceremony.
			</p>
			<p>
				2. Your passport will actually be made, either by you at a private
				ceremony or by an organizer as a gift.
			</p>
			<p>3. You are a good person who does not wish for the world to burn.</p>
			<p>Sign below:</p>
			<Signature onPointerUp={() => setSecretSignatureSigned(true)} />
		</>
	);
}
