import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, question } = body as {
      imageUrl?: string;
      question?: string;
    };

    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
      return NextResponse.json(
        { error: "imageUrl is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "question is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.createVision({
      model: "vlm",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: question.trim() },
            { type: "image_url", image_url: { url: imageUrl.trim() } },
          ],
        },
      ],
    });

    const analysis =
      completion?.choices?.[0]?.message?.content ??
      completion?.content ??
      completion ??
      "Unable to analyze the image.";

    const analysisText =
      typeof analysis === "string" ? analysis : JSON.stringify(analysis);

    // Save to database
    await db.visionAnalysis.create({
      data: {
        imageUrl: imageUrl.trim(),
        question: question.trim(),
        analysis: analysisText,
      },
    });

    return NextResponse.json({ analysis: analysisText });
  } catch (error) {
    console.error("[VLM API Error]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
