// app/api/chat/groups/[groupId]/members/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { pusherServer } from "@/lib/pusher";

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

    let userIds: string[];
    try {
      const body = await request.json();
      userIds = body.userIds;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json(
          { error: "User IDs array is required" },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const requestingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        image: true,
        walletAddress: true,
      },
    });

    if (!requestingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = group.members.some(
      (member) =>
        member.userId === requestingUser.id &&
        ["OWNER", "ADMIN"].includes(member.role)
    );

    if (group.type === "PRIVATE" && !isAdmin) {
      return NextResponse.json(
        { error: "Cannot join private group without invitation" },
        { status: 403 }
      );
    }

    const existingMembers = await prisma.chatMember.findMany({
      where: {
        groupId,
        userId: { in: userIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            walletAddress: true,
          },
        },
      },
    });

    const existingUserIds = existingMembers.map((m) => m.userId);
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return NextResponse.json({
        message: "Users are already members",
        members: existingMembers,
      });
    }

    const newMembers = await Promise.all(
      newUserIds.map(async (userId) => {
        return prisma.chatMember.create({
          data: {
            groupId,
            userId,
            role: "MEMBER",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                walletAddress: true,
              },
            },
          },
        });
      })
    );

    const systemMessage = await prisma.chatMessage.create({
      data: {
        groupId,
        senderId: requestingUser.id,
        isSystem: true,
        contents: {
          create: [
            {
              type: "SYSTEM",
              order: 0,
              content:
                newUserIds.length === 1
                  ? `${requestingUser.name} joined the group`
                  : `${requestingUser.name} added ${newUserIds.length} new members`,
              metadata: {
                action: "members_added",
                addedMembers: newMembers.map((member) => ({
                  id: member.user.id,
                  name: member.user.name,
                  image: member.user.image,
                  walletAddress: member.user.walletAddress,
                })),
              },
            },
          ],
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
        contents: true,
      },
    });

    await pusherServer.trigger(`chat-${groupId}`, "member-joined", {
      newMembers,
      systemMessage,
    });

    return NextResponse.json({
      members: [...existingMembers, ...newMembers],
      systemMessage,
    });
  } catch (error) {
    console.error("[MEMBERS_POST] Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
