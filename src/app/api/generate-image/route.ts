import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

const SUPPORTED_SIZES = [
  "1024x1024",
  "768x1344",
  "864x1152",
  "1344x768",
  "1152x864",
  "1440x720",
  "720x1440",
] as const;

type SupportedSize = (typeof SUPPORTED_SIZES)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size } = body as { prompt?: string; size?: string };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const validatedSize: SupportedSize = SUPPORTED_SIZES.includes(
      size as SupportedSize
    )
      ? (size as SupportedSize)
      : "1024x1024";

    const zai = await ZAI.create();

    const result = await zai.images.generations.create({
      prompt: prompt.trim(),
      size: validatedSize,
    });

    const imageBase64 = result?.data?.[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    // Save to database
    const savedImage = await db.generatedImage.create({
      data: {
        prompt: prompt.trim(),
        size: validatedSize,
        imageB64: imageBase64,
      },
    });

    return NextResponse.json({
      image: imageBase64,
      id: savedImage.id,
      prompt: savedImage.prompt,
      size: savedImage.size,
    });
  } catch (error) {
    console.error("[Generate Image API Error]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
