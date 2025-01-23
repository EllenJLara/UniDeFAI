"use server";
import prisma from "@/lib/prismadb";

export const getUserMetadata = async ({
  user_id,
  type,
}: {
  user_id: string;
  type?: string;
}) => {
  try {
    if (type === "portfolio") {
      return await prisma.user.findUnique({
        where: { id: user_id },
        select: {
          id: true,
          name: true,
          username: true,
          walletAddress: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });
    }

    return await prisma.user.findUnique({
      where: { id: user_id },
      include: {
        ...(type === "tweets" && {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        }),
        ...(type === "likes" && {
          _count: {
            select: {
              Like: true,
              followers: true,
              following: true,
            },
          },
        }),
        ...(type === "media" && {
          _count: {
            select: {
              posts: {
                where: {
                  media: {
                    some: {},
                  },
                },
              },
            },
          },
        }),
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};
