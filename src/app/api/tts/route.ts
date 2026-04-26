import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

const CHUNK_SIZE = 1000;
const MIN_SPEED = 0.5;
const MAX_SPEED = 2.0;

function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function clampSpeed(speed: number): number {
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, speed } = body as {
      text?: string;
      voice?: string;
      speed?: number;
    };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const clampedSpeed = clampSpeed(
      typeof speed === "number" && !isNaN(speed) ? speed : 1.0
    );
    const selectedVoice = voice && typeof voice === "string" ? voice : "alloy";

    const zai = await ZAI.create();

    const chunks = splitTextIntoChunks(text.trim(), CHUNK_SIZE);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const result = await zai.audio.tts.create({
        input: chunk,
        voice: selectedVoice,
        speed: clampedSpeed,
        response_format: "wav",
      });

      // Handle various response formats from the SDK
      if (Buffer.isBuffer(result)) {
        audioBuffers.push(result);
      } else if (result instanceof Uint8Array) {
        audioBuffers.push(Buffer.from(result));
      } else if (typeof result === "string") {
        // Could be base64 encoded
        audioBuffers.push(Buffer.from(result, "base64"));
      } else if (result?.data) {
        // Some SDKs return {data: Buffer}
        const data = Buffer.isBuffer(result.data)
          ? result.data
          : Buffer.from(result.data);
        audioBuffers.push(data);
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate audio" },
        { status: 500 }
      );
    }

    // Save TTS request to database
    await db.tTSRequest.create({
      data: {
        text: text.trim(),
        voice: selectedVoice,
        speed: clampedSpeed,
      },
    });

    // Concatenate audio buffers and return as wav
    const combinedBuffer = Buffer.concat(audioBuffers);

    return new NextResponse(combinedBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": combinedBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[TTS API Error]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
