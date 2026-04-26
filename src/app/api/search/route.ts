import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const numParam = searchParams.get("num");

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const num = numParam ? parseInt(numParam, 10) : 10;

    if (isNaN(num) || num < 1 || num > 50) {
      return NextResponse.json(
        { error: "Parameter 'num' must be a number between 1 and 50" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const results = await zai.functions.invoke("web_search", {
      query: q.trim(),
      num,
    });

    const totalResults = Array.isArray(results) ? results.length : 0;

    // Save search query to database
    await db.searchQuery.create({
      data: {
        query: q.trim(),
        resultsCount: totalResults,
      },
    });

    return NextResponse.json({
      success: true,
      query: q.trim(),
      totalResults,
      results: Array.isArray(results) ? results : [],
    });
  } catch (error) {
    console.error("[Search API Error]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
