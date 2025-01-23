//app/api/chat/groups/%5BgroupId%5D/members/%5BmemberId%5D/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { pusherServer } from "@/lib/pusher";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string; memberId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, memberId } = await params;
    const body = await request.json();
    const { role } = body;

    if (!["ADMIN", "MODERATOR", "MEMBER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userMembership = await prisma.chatMember.findFirst({
      where: {
        groupId: groupId,
        userId: user.id,
        role: "OWNER",
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const updatedMember = await prisma.chatMember.update({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: memberId,
        },
      },
      data: { role },
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

    const systemMessage = await prisma.chatMessage.create({
      data: {
        groupId: groupId,
        senderId: user.id,
        isSystem: true,
        contents: {
          create: [
            {
              type: "SYSTEM",
              order: 0,
              content: `${user.name} changed ${updatedMember.user.name}'s role to ${role}`,
              metadata: {
                action: "role_changed",
                memberId: memberId,
                newRole: role,
              },
            },
          ],
        },
      },
    });

    await pusherServer.trigger(`chat-${groupId}`, "member-updated", {
      updatedMember,
      systemMessage,
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("[MEMBER_PATCH]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string; memberId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, memberId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const memberToRemove = await prisma.chatMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: memberId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (user.id === memberId) {
      if (memberToRemove.role === "OWNER") {
        const memberCount = await prisma.chatMember.count({
          where: { groupId },
        });

        if (memberCount > 1) {
          const nextOwner = await prisma.chatMember.findFirst({
            where: {
              groupId,
              userId: { not: user.id },
              role: { in: ["ADMIN", "MODERATOR", "MEMBER"] },
            },
            orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
          });

          if (nextOwner) {
            await prisma.chatMember.update({
              where: {
                groupId_userId: {
                  groupId,
                  userId: nextOwner.userId,
                },
              },
              data: { role: "OWNER" },
            });
          }
        }
      }
    } else {
      const userMembership = await prisma.chatMember.findFirst({
        where: {
          groupId,
          userId: user.id,
          role: { in: ["OWNER", "ADMIN"] },
        },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: "Permission denied" },
          { status: 403 }
        );
      }

      if (memberToRemove.role === "OWNER") {
        return NextResponse.json(
          { error: "Cannot remove group owner" },
          { status: 403 }
        );
      }
    }

    await prisma.chatMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: memberId,
        },
      },
    });

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
              content:
                user.id === memberId
                  ? `${user.name} left the group`
                  : `${user.name} removed ${memberToRemove.user.name} from the group`,
              metadata: {
                action: "member_removed",
                removedMember: {
                  id: memberToRemove.user.id,
                  name: memberToRemove.user.name,
                },
              },
            },
          ],
        },
      },
    });

    await pusherServer.trigger(`chat-${groupId}`, "member-removed", {
      removedMemberId: memberId,
      systemMessage,
    });

    return NextResponse.json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("[MEMBER_DELETE]", error);
    return NextResponse.json(
      {
        error: "Internal error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
