import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";
import { Description } from "./description";

const monthCodes = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export function DataSection({
  version,
  passportNumber,
  id,
  surname,
  firstName,
  dateOfBirth,
  placeOfOrigin,
  dateOfIssue,
}: {
  version: number;
  passportNumber: number;
  id: number;
  surname: string;
  firstName: string;
  dateOfBirth: Date;
  placeOfOrigin: string;
  dateOfIssue: Date;
}) {
  return (
    <div
      style={{
        fontSize: 13.333 * IMAGE_GENERATION_SCALE_FACTOR,
        display: "flex",
        flexDirection: "column",
        gap: 8 * IMAGE_GENERATION_SCALE_FACTOR,
      }}
    >
      <div
        style={{
          fontSize: 13.333 * IMAGE_GENERATION_SCALE_FACTOR,
          display: "flex",
          flexDirection: "row",
          gap: 12 * IMAGE_GENERATION_SCALE_FACTOR,
        }}
      >
        <Description
          title="TYPE"
          content={"PH"}
          width={64 * IMAGE_GENERATION_SCALE_FACTOR}
        />
        <Description
          title="CODE"
          content={"HAK"}
          width={64 * IMAGE_GENERATION_SCALE_FACTOR}
        />
        <Description title="NO." content={(version + id * 0.0001).toFixed(4)} />
      </div>
      <Description title="SURNAME" content={surname} />
      <Description title="NAME" content={firstName} />
      <Description title="NATIONALITY" content={"REPUBLIC OF HACKERLAND"} />
      <div
        style={{
          fontSize: 13.333 * IMAGE_GENERATION_SCALE_FACTOR,
          display: "flex",
          flexDirection: "row",
          gap: 48 * IMAGE_GENERATION_SCALE_FACTOR,
        }}
      >
        <div
          style={{
            fontSize: 13.333 * IMAGE_GENERATION_SCALE_FACTOR,
            display: "flex",
            flexDirection: "column",
            gap: 8 * IMAGE_GENERATION_SCALE_FACTOR,
            width: 104 * IMAGE_GENERATION_SCALE_FACTOR,
          }}
        >
          <Description
            title="DATE OF BIRTH"
            content={`${String(dateOfBirth.getDate()).padStart(2, "0")} ${
              monthCodes[dateOfBirth.getMonth()]
            } ${String(dateOfBirth.getFullYear()).padStart(4, "0")}`}
          />
          <Description
            title="DATE OF ISSUE"
            content={`${String(dateOfIssue.getDate()).padStart(2, "0")} ${
              monthCodes[dateOfIssue.getMonth()]
            } ${String(dateOfIssue.getFullYear()).padStart(4, "0")}`}
          />
        </div>
        <div
          style={{
            fontSize: 13.333 * IMAGE_GENERATION_SCALE_FACTOR,
            display: "flex",
            flexDirection: "column",
            gap: 8 * IMAGE_GENERATION_SCALE_FACTOR,
          }}
        >
          <Description title="PLACE OF ORIGIN" content={placeOfOrigin} />
          <Description
            title="DATE OF EXPIRATION"
            content={`01 JAN ${String(
              dateOfIssue.getFullYear() + 1000
            ).padStart(4, "0")}`}
          />
        </div>{" "}
      </div>
      <Description title="AUTHORITY" content={"id.purduehackers.com"} />
    </div>
  );
}
