//app/api/chat/groups/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groups = await prisma.chatGroup.findMany({
      where: {
        OR: [
          {
            members: {
              some: { userId: user.id },
            },
          },
          { type: "PUBLIC" },
        ],
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        lastMessageAt: "desc",
      },
      include: {
        members: {
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
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    const nextCursor =
      groups.length === limit ? groups[groups.length - 1].id : null;

    return NextResponse.json({
      groups,
      nextCursor,
    });
  } catch (error) {
    console.error("[GROUPS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type = "PRIVATE",
      memberIds = [],
      isEncrypted = false,
      allowMedia = true,
      maxFileSize = 5242880,
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const group = await prisma.chatGroup.create({
      data: {
        name,
        description,
        type,
        isEncrypted,
        allowMedia,
        maxFileSize,
        creatorId: user.id,
        members: {
          create: [
            {
              userId: user.id,
              role: "OWNER",
            },
            ...memberIds.map((id: string) => ({
              userId: id,
              role: "MEMBER",
            })),
          ],
        },
      },
      include: {
        members: {
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
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("[GROUPS_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
