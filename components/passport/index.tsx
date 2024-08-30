import {
	CURRENT_PASSPORT_VERSION,
	IMAGE_GENERATION_SCALE_FACTOR,
} from "@/config";
import { PassportGenData } from "@/types/types";
import { ImageSection } from "./image";
import { DataSection } from "./data";
import { FooterSection } from "./footer";

export function Passport({
	data,
	dataPageBgUrl,
	portraitUrlB64,
}: {
	data: PassportGenData;
	dataPageBgUrl: string;
	portraitUrlB64: string;
}) {
	return (
		<div
			style={{
				fontSize: 13.333 * IMAGE_GENERATION_SCALE_FACTOR,
				fontFamily: '"Inter"',
				color: "black",
				backgroundImage: `url('${dataPageBgUrl}')`,
				backgroundSize: "100% 100%",
				width: "100%",
				height: "100%",
				padding: `${16 * IMAGE_GENERATION_SCALE_FACTOR}px ${
					24 * IMAGE_GENERATION_SCALE_FACTOR
				}px`,
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					display: "flex",
					width: "100%",
					flexDirection: "row",
					position: "absolute",
					top: 24 * IMAGE_GENERATION_SCALE_FACTOR,
					left: 16 * IMAGE_GENERATION_SCALE_FACTOR,
					right: 16 * IMAGE_GENERATION_SCALE_FACTOR,
					gap: 19 * IMAGE_GENERATION_SCALE_FACTOR,
				}}
			>
				<ImageSection imageUrl={portraitUrlB64} />
				<DataSection
					version={data.sendToDb ? CURRENT_PASSPORT_VERSION : 0}
					passportNumber={data.passportNumber}
					id={data.passportNumber}
					surname={data.surname}
					firstName={data.firstName}
					dateOfBirth={data.dateOfBirth}
					dateOfIssue={data.dateOfIssue}
					placeOfOrigin={data.placeOfOrigin}
				/>
			</div>
			<FooterSection
				topLine={`PHHAK${formatName(data.surname)}<<${formatName(
					data.firstName
				)}`.padEnd(44, "<")}
				bottomLine={`${String(CURRENT_PASSPORT_VERSION).padStart(
					3,
					"0"
				)}${String(data.passportNumber).padStart(
					6,
					"0"
				)}${calculateChecksum(
					String(CURRENT_PASSPORT_VERSION).padStart(3, "0") +
						String(data.passportNumber).padStart(6, "0")
				)}HAK${String(data.dateOfBirth.getUTCFullYear()).padStart(
					4,
					"0"
				)}${String(data.dateOfBirth.getUTCMonth() + 1).padStart(
					2,
					"0"
				)}${String(data.dateOfBirth.getUTCDate()).padStart(
					2,
					"0"
				)}${calculateChecksum(
					String(data.dateOfBirth.getUTCFullYear()).padStart(4, "0") +
						String(data.dateOfBirth.getUTCMonth() + 1).padStart(
							2,
							"0"
						) +
						String(data.dateOfBirth.getUTCDate()).padStart(2, "0")
				)}<${String(data.dateOfIssue.getUTCFullYear() + 1000).padStart(
					4,
					"0"
				)}0101${calculateChecksum(
					String(data.dateOfIssue.getUTCFullYear() + 1000).padStart(
						4,
						"0"
					) + "0101"
				)}<<<<<<<<<<<${calculateChecksum(
					calculateChecksum(
						String(CURRENT_PASSPORT_VERSION).padStart(3, "0") +
							String(data.passportNumber).padStart(6, "0")
					) +
						calculateChecksum(
							String(CURRENT_PASSPORT_VERSION).padStart(3, "0") +
								String(data.passportNumber).padStart(6, "0")
						) +
						String(data.dateOfBirth.getUTCFullYear()).padStart(
							4,
							"0"
						) +
						String(data.dateOfBirth.getUTCMonth() + 1).padStart(
							2,
							"0"
						) +
						String(data.dateOfBirth.getUTCDate()).padStart(2, "0") +
						calculateChecksum(
							String(data.dateOfBirth.getUTCFullYear()).padStart(
								4,
								"0"
							) +
								String(
									data.dateOfBirth.getUTCMonth() + 1
								).padStart(2, "0") +
								String(data.dateOfBirth.getUTCDate()).padStart(
									2,
									"0"
								)
						) +
						String(
							data.dateOfIssue.getUTCFullYear() + 1000
						).padStart(4, "0") +
						"0101" +
						calculateChecksum(
							String(
								data.dateOfIssue.getUTCFullYear() + 1000
							).padStart(4, "0") + "0101"
						) +
						"<<<<<<<<<<<"
				)}`}
			/>
		</div>
	);
}

function formatName(nameString: string) {
	return (
		nameString
			// Permit certain diacritics
			.replace(/[\u00E5]/g, "AA")
			.replace(/[\u00E4]/g, "AE")
			.replace(/[\u00F0]/g, "DH")
			.replace(/[\u0132-\u0133]/g, "IJ")
			.replace(/[\u00F6]/g, "OE")
			.replace(/[\u00FC]/g, "UE")
			.replace(/[\u00F1]/g, "N")
			.replace(/[\u00E6]/g, "AE")
			.replace(/[\u0153]/g, "OE")
			.replace(/[\u00DF]/g, "SS")
			.replace(/[\u00FE]/g, "TH")
			// Cleanly remove all other diacritics
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			// Spaces, Hyphens to Bracket
			.replace(/- /g, "<")
			// Remove other non-alphanumerics
			.replace(/[^a-zA-Z0-9]/g, "")
	);
}

function calculateChecksum(checkString: string) {
	let checksum = 0;
	let weight = 0;

	for (let i = 0; i < checkString.length; i++) {
		switch (i % 3) {
			case 0:
				weight = 7;
				break;
			case 1:
				weight = 3;
				break;
			case 2:
				weight = 1;
				break;
		}

		if (checkString[i].match(/[A-Z]/i)) {
			checksum += weight * (checkString.charCodeAt(i) - 55); // Sets A (ASCII 65) to be worth 10
		} else if (checkString[i].match(/\d+/)) {
			checksum += weight * parseInt(checkString[i]);
		} else if (checkString[i].match(/</g)) {
			checksum += weight * 0;
		}
	}

	return (checksum % 10).toString();
}
