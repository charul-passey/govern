import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const alt =
  "Every company just hired a third workforce. Nobody’s managing its budget.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static OG card: the hero headline on white with a yellow bar accent, in Inter.
export default function Image() {
  const extraBold = fs.readFileSync(
    path.join(process.cwd(), "assets/fonts/Inter-ExtraBold.woff"),
  );
  const medium = fs.readFileSync(
    path.join(process.cwd(), "assets/fonts/Inter-Medium.woff"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: 8,
            color: "#1A1A1A",
          }}
        >
          GOVERN
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 132, height: 16, background: "#E4F222" }} />
          <div
            style={{
              display: "flex",
              marginTop: 40,
              maxWidth: 1000,
              fontFamily: "Inter",
              fontWeight: 800,
              fontSize: 68,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              color: "#1A1A1A",
            }}
          >
            Every company just hired a third workforce. Nobody’s managing its budget.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: extraBold, weight: 800, style: "normal" },
        { name: "Inter", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
