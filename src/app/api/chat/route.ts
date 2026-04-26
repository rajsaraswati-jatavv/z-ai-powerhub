import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

const SYSTEM_PROMPT =
  "You are Z.ai, a powerful AI assistant. Format responses with markdown. Use code blocks with language tags.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, conversationId } = body as {
      messages: { role: string; content: string }[];
      conversationId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Build messages with system prompt
    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await zai.chat.completions.create({
      messages: chatMessages,
    });

    const assistantContent =
      completion?.choices?.[0]?.message?.content ??
      completion?.content ??
      completion ??
      "I couldn't generate a response.";

    // Save or update conversation
    let convId = conversationId;
    if (convId) {
      // Update existing conversation
      const existing = await db.conversation.findUnique({
        where: { id: convId },
      });
      if (existing) {
        await db.conversation.update({
          where: { id: convId },
          data: { updatedAt: new Date() },
        });
      } else {
        convId = undefined;
      }
    }

    if (!convId) {
      // Create new conversation with title from first user message
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 100)
        : "New Conversation";
      const conversation = await db.conversation.create({
        data: { title },
      });
      convId = conversation.id;
    }

    // Save all messages to database
    const messagePromises = messages.map((m) =>
      db.message.create({
        data: {
          role: m.role,
          content: m.content,
          conversationId: convId!,
        },
      })
    );

    // Save assistant response
    messagePromises.push(
      db.message.create({
        data: {
          role: "assistant",
          content: assistantContent,
          conversationId: convId!,
        },
      })
    );

    await Promise.all(messagePromises);

    return NextResponse.json({
      response: assistantContent,
      conversationId: convId,
    });
  } catch (error) {
    console.error("[Chat API Error]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
