import { ImageResponse } from "next/og";

export const runtime = "edge";

function Description({ title, content }: { title: string; content?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ color: "blue", letterSpacing: "0.1em" }}>{title}</div>
      <div>{content}</div>
    </div>
  );
}

export async function GET(
  request: Request,
  { params }: { params: { name: string; origin: string; dob: string } }
) {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: "black",
          backgroundImage: `url('${"http://localhost:3000"}/passport/data-page-bg.png')`,
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Description title="Name" content={params.name} />
        <Description
          title="Date of birth"
          content={new Date(params.dob).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        />
        <Description title="Place of origin" content={params.origin} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
