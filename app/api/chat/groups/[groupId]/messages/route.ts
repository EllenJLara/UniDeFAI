//app/api/chat/groups/%5BgroupId%5D/messages/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { pusherServer } from "@/lib/pusher";

export async function GET(
  request: Request,
  { params }: Promise<{ params: { groupId: string } }>
) {
  try {
    const session = await getServerSession();
    const { groupId } = await params;

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    let user;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!user) {
      const walletAddress = request.headers.get("X-Wallet-Address");
      if (walletAddress) {
        user = await prisma.user.findUnique({
          where: { walletAddress },
        });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.type !== "PUBLIC" && group.members.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { groupId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            walletAddress: true,
          },
        },
        contents: {
          orderBy: { order: "asc" },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (group.members.length > 0) {
      await prisma.chatMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId: user.id,
          },
        },
        data: { lastReadAt: new Date() },
      });
    }

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : null;

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor,
    });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const body = await request.json();
    const { contents } = body;

    if (!Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json(
        { error: "Message must contain at least one content item" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        image: true,
        walletAddress: true,
      },
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
        { error: "Must be a group member to send messages" },
        { status: 403 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        groupId,
        senderId: user.id,
        contents: {
          create: contents.map((item: any, index: number) => ({
            type: item.type,
            order: index,
            content: item.content,
            mediaUrl: item.mediaUrl,
            metadata: item.metadata || {},
          })),
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            walletAddress: true,
          },
        },
        contents: {
          orderBy: { order: "asc" },
        },
        reactions: true,
      },
    });

    await prisma.chatGroup.update({
      where: { id: groupId },
      data: { lastMessageAt: message.createdAt },
    });

    await pusherServer.trigger(`chat-${groupId}`, "new-message", message);

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return NextResponse.json(
      {
        error: "Internal error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
