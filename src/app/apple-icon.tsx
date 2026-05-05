import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "#2563eb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "36px",
        color: "white",
        fontSize: "100px",
        fontWeight: "bold",
        fontFamily: "sans-serif",
      }}
    >
      B
    </div>,
    { ...size }
  );
}
