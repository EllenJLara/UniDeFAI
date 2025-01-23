// app/api/chat/groups/[groupId]/invites/route.ts
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const { walletAddresses } = await request.json();

    if (!Array.isArray(walletAddresses) || walletAddresses.length === 0) {
      return NextResponse.json(
        { error: "Wallet addresses array is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const membership = await prisma.chatMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        role: { in: ["OWNER", "ADMIN", "MODERATOR"] },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const existingUsers = await prisma.user.findMany({
      where: {
        walletAddress: { in: walletAddresses },
      },
    });

    const newMembers = [];
    for (const invitedUser of existingUsers) {
      const existingMember = await prisma.chatMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: invitedUser.id,
          },
        },
      });

      if (!existingMember) {
        const member = await prisma.chatMember.create({
          data: {
            groupId,
            userId: invitedUser.id,
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
        newMembers.push(member);
      }
    }

    if (newMembers.length > 0) {
      const systemMessage = await prisma.chatMessage.create({
        data: {
          groupId,
          senderId: user.id,
          isSystem: true,
          contents: {
            create: [
              {
                type: "SYSTEM",
                order: 0,
                content: `${user.name} added ${newMembers.length} new member${
                  newMembers.length === 1 ? "" : "s"
                }`,
                metadata: {
                  action: "members_added",
                  addedMembers: newMembers.map((m) => ({
                    id: m.user.id,
                    name: m.user.name,
                    walletAddress: m.user.walletAddress,
                  })),
                },
              },
            ],
          },
        },
      });

      await pusherServer.trigger(`chat-${groupId}`, "members-added", {
        newMembers,
        systemMessage,
      });
    }

    return NextResponse.json({
      addedMembers: newMembers,
      notFoundAddresses: walletAddresses.filter(
        (addr) => !existingUsers.some((u) => u.walletAddress === addr)
      ),
    });
  } catch (error) {
    console.error("[INVITES_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
