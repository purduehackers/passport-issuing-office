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
        topLine={`PH<HAK${data.surname.replace(
          " ",
          ""
        )}<<${data.firstName.replace(" ", "")}`.padEnd(44, "<")}
        bottomLine={`${String(CURRENT_PASSPORT_VERSION).padStart(
          3,
          "0"
        )}${String(data.passportNumber).padStart(6, "0")}${
          (CURRENT_PASSPORT_VERSION + data.passportNumber) % 10
        }HAK${String(data.dateOfBirth.getUTCFullYear()).padStart(4, "0")}${String(
          data.dateOfBirth.getUTCMonth() + 1
        ).padStart(2, "0")}${String(data.dateOfBirth.getUTCDate()).padStart(
          2,
          "0"
        )}${
          (data.dateOfBirth.getUTCFullYear() +
            data.dateOfBirth.getUTCMonth() +
            data.dateOfBirth.getUTCDate()) %
          10
        }<${String(data.dateOfIssue.getFullYear()).padStart(4, "0")}0101${
          (data.dateOfIssue.getUTCFullYear() + 2) % 10
        }<<<<<<<<<<0${
          (CURRENT_PASSPORT_VERSION +
            data.passportNumber +
            (data.dateOfBirth.getUTCFullYear() +
              data.dateOfBirth.getUTCMonth() +
              data.dateOfBirth.getUTCDate()) +
            (data.dateOfIssue.getUTCFullYear() + 2)) %
          10
        }`}
      />
    </div>
  );
}
