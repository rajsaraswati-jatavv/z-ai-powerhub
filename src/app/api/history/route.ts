import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      conversations,
      images,
      searches,
      ttsHistory,
      visionHistory,
    ] = await Promise.all([
      db.conversation.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      db.generatedImage.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          prompt: true,
          size: true,
          createdAt: true,
        },
      }),
      db.searchQuery.findMany({
        orderBy: { createdAt: "desc" },
      }),
      db.tTSRequest.findMany({
        orderBy: { createdAt: "desc" },
      }),
      db.visionAnalysis.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Build stats object
    const totalMessages = conversations.reduce(
      (acc, conv) => acc + conv.messages.length,
      0
    );

    const stats = {
      totalConversations: conversations.length,
      totalMessages,
      totalImages: images.length,
      totalSearches: searches.length,
      totalTTS: ttsHistory.length,
      totalVisionAnalyses: visionHistory.length,
    };

    return NextResponse.json({
      conversations,
      images,
      searches,
      ttsHistory,
      visionHistory,
      stats,
    });
  } catch (error) {
    console.error("[History GET API Error]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body as { type?: string; id?: string };

    if (!type) {
      return NextResponse.json(
        { error: "type is required" },
        { status: 400 }
      );
    }

    const validTypes = [
      "conversation",
      "image",
      "search",
      "tts",
      "vision",
      "all",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (type === "all") {
      // Delete all records from all tables
      await Promise.all([
        db.message.deleteMany(),
        db.conversation.deleteMany(),
        db.generatedImage.deleteMany(),
        db.searchQuery.deleteMany(),
        db.tTSRequest.deleteMany(),
        db.visionAnalysis.deleteMany(),
      ]);

      return NextResponse.json({
        success: true,
        message: "All history cleared",
      });
    }

    if (!id) {
      return NextResponse.json(
        { error: "id is required when type is not 'all'" },
        { status: 400 }
      );
    }

    // Delete specific record by type and id
    switch (type) {
      case "conversation":
        // Cascade delete will handle messages
        await db.conversation.delete({ where: { id } });
        break;
      case "image":
        await db.generatedImage.delete({ where: { id } });
        break;
      case "search":
        await db.searchQuery.delete({ where: { id } });
        break;
      case "tts":
        await db.tTSRequest.delete({ where: { id } });
        break;
      case "vision":
        await db.visionAnalysis.delete({ where: { id } });
        break;
    }

    return NextResponse.json({
      success: true,
      message: `${type} with id ${id} deleted`,
    });
  } catch (error) {
    console.error("[History DELETE API Error]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
