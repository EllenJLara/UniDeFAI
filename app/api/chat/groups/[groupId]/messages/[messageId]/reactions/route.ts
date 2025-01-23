//app/api/chat/groups/%5BgroupId%5D/messages/%5BmessageId%5D/reactions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  request: Request,
  { params }: { params: { groupId: string; messageId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, messageId } = await params;
    const { emoji } = await request.json();

    if (!emoji?.trim()) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = await prisma.chatMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a group member" },
        { status: 403 }
      );
    }

    const existingReaction = await prisma.chatReaction.findFirst({
      where: {
        messageId,
        userId: user.id,
        emoji,
      },
    });

    let reaction;
    let action: "added" | "removed";

    if (existingReaction) {
      await prisma.chatReaction.delete({
        where: { id: existingReaction.id },
      });
      reaction = existingReaction;
      action = "removed";
    } else {
      reaction = await prisma.chatReaction.create({
        data: {
          messageId,
          userId: user.id,
          emoji,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      action = "added";
    }

    const reactionCount = await prisma.chatReaction.count({
      where: { messageId },
    });

    await pusherServer.trigger(`chat-${groupId}`, "reaction-updated", {
      messageId,
      reaction,
      reactionCount,
      action,
    });

    return NextResponse.json({ reaction, reactionCount });
  } catch (error) {
    console.error("[REACTION_POST]", error);
    return NextResponse.json(
      {
        error: "Internal error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
