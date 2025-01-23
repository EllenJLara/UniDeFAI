"use client";
import React from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useSession } from "next-auth/react";
import { useUser } from "../profile/hooks/use-user";
import { useRouter } from "next/navigation";

const ProfileButton = () => {
  const { data: session }: any = useSession();
  const router = useRouter();

  const { data: user } = useUser({ id: session?.user?.id });

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="sm:hidden">
      <Avatar
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/profile/${user?.id}`);
        }}
        className="h-8 w-8 my-[2px] cursor-pointer"
      >
        <AvatarImage
          src={user?.image || `/images/user_placeholder.png`}
        />
      </Avatar>
    </div>
  );
};

export default ProfileButton;