import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Wallet, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import EarningsDashboard from "./earnings-dashboard";

const ProfileMenu = ({
  isCurrentUser,
  userId,
  onEditProfile,
}: {
  isCurrentUser: boolean;
  userId: string;
  onEditProfile?: () => void;
}) => {
  const [isEarningsDashboardOpen, setIsEarningsDashboardOpen] = useState(false);

  if (!isCurrentUser) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            onClick={onEditProfile}
            variant="outline"
            className="h-9 px-4 bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit profile
          </Button>

          <Button
            onClick={() => setIsEarningsDashboardOpen(true)}
            className="h-9 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-0"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Earnings
          </Button>

          <Button
            onClick={() => signOut()}
            variant="ghost"
            className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Layout */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            onClick={onEditProfile}
            variant="outline"
            size="icon"
            className="w-9 h-9 bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => setIsEarningsDashboardOpen(true)}
            size="icon"
            className="w-9 h-9 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-0"
          >
            <Wallet className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => signOut()}
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EarningsDashboard
        isOpen={isEarningsDashboardOpen}
        onClose={() => setIsEarningsDashboardOpen(false)}
        userId={userId}
      />
    </>
  );
};

export default ProfileMenu;
