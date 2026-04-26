import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "3.0",
    features: [
      "chat",
      "image-generation",
      "web-search",
      "text-to-speech",
      "vision-analysis",
      "history",
    ],
  });
}
