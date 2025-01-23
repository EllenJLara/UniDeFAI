//app/api/chat/groups/%5BgroupId%5D/messages/%5BmessageId%5D/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { pusherServer } from "@/lib/pusher";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string; messageId: string }> }
) {
  try {
    const session = await getServerSession();
    const { groupId, messageId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        contents: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
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

    const canDelete =
      message.senderId === user.id ||
      ["OWNER", "ADMIN"].includes(membership.role);

    if (!canDelete) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Delete message
    await prisma.chatMessage.delete({
      where: { id: messageId },
    });

    // Notify clients about deletion
    await pusherServer.trigger(`chat-${groupId}`, "message-deleted", {
      messageId,
      deletedAt: new Date(),
    });

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("[MESSAGE_DELETE]", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
