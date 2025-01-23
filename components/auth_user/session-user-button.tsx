"use client"
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { EllipsisWrapper } from "../elements/ellipsis-wrapper";
import { BsThreeDots } from "react-icons/bs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useUser } from "../profile/hooks/use-user";
import UniDeFAILogo from "@/components/sidebar/assets/unidefai-logo.png";
import { usePrivy } from "@privy-io/react-auth";

interface SessionUserButtonProps {
  isDemo?: boolean;
}

const SessionUserButton = ({ isDemo }: SessionUserButtonProps) => {
  const { data: session, update: updateSession } = useSession();
  const { data: user } = useUser({ id: session?.user?.id });
  const { logout: privyLogout } = usePrivy();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const notLoggedIn = !session?.user?.walletAddress;

  const handleLogout = async () => {
    if (isLoggingOut) return;

    async function fetchCsrfToken() {
      const response = await fetch('/api/auth/csrf');
      const data = await response.json();
      return data.csrfToken;
    }

    async function manualSignOut() {
      const csrfToken = await fetchCsrfToken();

      const formData = new URLSearchParams();
      formData.append('csrfToken', csrfToken);
      formData.append('json', 'true');

      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        console.log('Signed out successfully');
        await privyLogout();
        await updateSession({ user: null });
        await signOut({ redirect: false });
        router.push('/');
        router.refresh()
      } else {
        console.error('Failed to sign out');
      }
    }

    try {
      setIsLoggingOut(true);
      await manualSignOut();
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout properly");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-min mb-3 w-full">
      <Popover>
        <PopoverTrigger>
          <div className="px-4 py-2 grid cursor-pointer place-items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 fill-secondary-100   disabled-button   hover:bg-gray-500/20     border-none focus-visible:bg-neutral-800/50 focus-visible:outline-secondary-100   xxl:flex xxl:w-full xxl:gap-3">
            <div className="xxl:flex xxl:w-full xxl:gap-3 ">
              <Avatar className="relative aspect-square overflow-hidden rounded-full">
                <AvatarImage
                  className="block size-full object-cover"
                  src={notLoggedIn ? "/favicon.ico" : (user?.imageuser?.image || "/images/user_placeholder.png")}
                />
                <AvatarFallback>
                  {user?.username ? user.username[0] : ""}
                </AvatarFallback>
              </Avatar>

              <div className="hidden flex-col justify-start items-start xxl:flex">
                <div
                  className={`grid grid-flow-col text-milli font-semibold text-secondary-100
              hover:underline`}
                >
                  {notLoggedIn ? "UniDeFAI" : (user?.name && <span className="truncate">{user?.name}</span>)}
                </div>

                <EllipsisWrapper>
                  <span className="text-light-gray text-sm">
                    @{notLoggedIn ? "tryunidefai" : user?.username}
                  </span>
                </EllipsisWrapper>
              </div>
            </div>

            <div className="hidden items-end fill-secondary-100 xxl:inline">
              <BsThreeDots size={18} />
            </div>
          </div>
        </PopoverTrigger>
        {session && !notLoggedIn &&         <PopoverContent className="z-[9999999999]">
          <div
            className="cursor-pointer w-full transition"
            onClick={handleLogout}
          >
            <span className="text-sm">
              {isLoggingOut ? "Logging out..." : `Log out ${user?.username ? `@${user?.username}` : user?.name}`}
            </span>
          </div>
        </PopoverContent>
  }
    </Popover>
    </div>
  );
};


export default SessionUserButton;
