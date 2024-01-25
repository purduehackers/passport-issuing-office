import { ImageResponse } from "next/og";

export const runtime = "edge";

function Description({
  title,
  content,
  width,
}: {
  title: string;
  content?: string;
  width?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: width ?? "auto",
        gap: "6px",
      }}
    >
      <div
        style={{
          color: "#4A2AA6",
          fontFamily: '"Inter"',
          fontSize: "24px",
          fontStyle: "normal",
          fontWeight: 500,
          letterSpacing: "1.92px",
          textTransform: "uppercase",
          height: "30px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "#000000",
          fontFamily: '"OCR B"',
          fontSize: "33px",
          fontStyle: "normal",
          fontWeight: 500,
          letterSpacing: "8px",
          textTransform: "uppercase",
          height: "39px",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function Footer({
  topLine,
  bottomLine,
}: {
  topLine: string;
  bottomLine: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        position: "absolute",
        top: "847px",
        left: "48px",
        gap: "12px",
      }}
    >
      <div
        style={{
          color: "#4A2BA6",
          textAlign: "center",
          fontFamily: '"OCR B"',
          fontSize: "36px",
          fontStyle: "normal",
          fontWeight: 500,
          textTransform: "uppercase",
          height: "42px",
          width: "1320px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {topLine.split("").map((char, i) => (
          <span key={`footer-top-${i}`}>{char}</span>
        ))}
      </div>
      <div
        style={{
          color: "#4A2BA6",
          textAlign: "center",
          fontFamily: '"OCR B"',
          fontSize: "36px",
          fontStyle: "normal",
          fontWeight: 500,
          textTransform: "uppercase",
          height: "42px",
          width: "1320px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {bottomLine.split("").map((char, i) => (
          <span key={`footer-bottom-${i}`}>{char}</span>
        ))}
      </div>
    </div>
  );
}

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

function PrimaryData({
  version,
  no,
  surname,
  givenName,
  dateOfBirth,
  placeOfOrigin,
  dateOfIssue,
}: {
  version: number;
  no: number;
  surname: string;
  givenName: string;
  dateOfBirth: Date;
  placeOfOrigin: string;
  dateOfIssue: Date;
}) {
  return (
    <div
      style={{
        fontSize: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        flexGrow: "4",
      }}
    >
      <div
        style={{
          fontSize: "40px",
          display: "flex",
          flexDirection: "row",
          gap: "36px",
        }}
      >
        <Description title="TYPE" content={"PH"} width={192} />
        <Description title="CODE" content={"HAK"} width={192} />
        <Description title="NO." content={(version + no * 0.0001).toFixed(4)} />
      </div>
      <Description title="SURNAME" content={surname} />
      <Description title="GIVEN NAME" content={givenName} />
      <Description title="NATIONALITY" content={"REPUBLIC OF HACKERLAND"} />
      <div
        style={{
          fontSize: 40,
          display: "flex",
          flexDirection: "row",
          gap: "144px",
        }}
      >
        <div
          style={{
            fontSize: 40,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "312px",
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
            fontSize: 40,
            display: "flex",
            flexDirection: "column",
            gap: 16,
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

export async function GET(
  request: Request,
  { params }: { params: { name: string; origin: string; dob: string } }
) {
  const interFontData = await fetch(
    new URL("../../assets/Inter-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interBoldFontData = await fetch(
    new URL("../../assets/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const OCRBProFontData = await fetch(
    new URL("../../assets/OCRB-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          fontFamily: '"Inter"',
          color: "black",
          backgroundImage: `url('https://doggo.ninja/fVcYpE.png')`,
          backgroundSize: "100% 100%",
          width: "100%",
          height: "100%",
          padding: "48px 72px",
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
            top: "72px",
            left: "48px",
            right: "48px",
            gap: "57px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "66px",
            }}
          >
            <div
              style={{
                color: "#4A2AA6",
                fontFamily: '"Inter Bold"',
                fontSize: "24px",
                fontStyle: "normal",
                fontWeight: 800,
                letterSpacing: "3.48px",
                textTransform: "uppercase",
                height: "36px",
                width: "219px",
              }}
            >
              PASSPORT
            </div>

            <img
              src="https://media.istockphoto.com/id/185285553/photo/bottle-fed-orphaned-kitten.jpg?s=612x612&w=0&k=20&c=yKF0SkhtTTbHL4VRCmtpNvg_8ZM7SWB5SOPNaD5PjXY="
              alt="Your Passport Photo Here!"
              style={{
                width: "444px",
                height: "555px",
                objectFit: "cover",
                borderRadius: "24px",
              }}
            />
          </div>
          <PrimaryData
            version={0}
            no={1}
            surname="Hacker"
            givenName="Wack"
            dateOfBirth={new Date("06 APR 1200")}
            dateOfIssue={new Date(Date.now())}
            placeOfOrigin="The Deep Sea"
          />
        </div>
        <Footer
          topLine="P<HAKHACKER<WACK<<<<<<<<<<<<<<<<<<<<<<<<<<<"
          bottomLine="E042901AA3USA3299FF47983<<<<<<<<<<<<<<<<069"
        />
      </div>
    ),
    {
      width: 1416,
      height: 966,
      fonts: [
        {
          name: "Inter",
          data: interFontData,
          style: "normal",
          weight: 500,
        },
        {
          name: "Inter Bold",
          data: interBoldFontData,
          style: "normal",
          weight: 800,
        },
        {
          name: "OCR B",
          data: OCRBProFontData,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
