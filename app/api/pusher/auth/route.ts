import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { pusherServer } from "@/lib/pusher";
import prisma from "@/lib/prismadb";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const socket_id = formData.get('socket_id') as string;
    const channel_name = formData.get('channel_name') as string;
    const wallet_address = formData.get('wallet_address') as string;

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    let user;

    const session = await getServerSession();
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
    }

    if (!user && wallet_address) {
      user = await prisma.user.findUnique({
        where: { walletAddress: wallet_address }
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = channel_name.replace('private-chat-', '');

    if (channel_name.startsWith('private-')) {
      const membership = await prisma.chatMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: user.id
          }
        },
        include: {
          group: true
        }
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Not a member of this group" },
          { status: 403 }
        );
      }
    }

    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
      user_id: user.id,
      user_info: {
        name: user.name,
        email: user.email,
        image: user.image,
        walletAddress: user.walletAddress,
        username: user.username
      }
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("[PUSHER_AUTH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}