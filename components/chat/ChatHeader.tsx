// app/components/chat/ChatHeader.tsx
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGroup } from "@/components/useGroup";
import { Globe, Lock, Settings, Users, ArrowLeft, LogOut } from "lucide-react";
import GroupSettingsDialog  from "./GroupSettingsDialog";
import { GroupDetailsDialog } from "./GroupDetailsDialog";
import { useSession } from "next-auth/react";

interface ChatHeaderProps {
  groupId: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  onLeaveGroup?: () => void;
  isMember?: boolean;
}

export const ChatHeader = ({
  groupId,
  showBackButton = false,
  onBackClick,
  onLeaveGroup,
  isMember = false,
}: ChatHeaderProps) => {
  const { data: session } = useSession();
  const { group, members } = useGroup(groupId);
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!group) return null;

  const currentUserRole = group.members?.find(
    (member) => member.userId === session?.user?.id
  )?.role;

  const canAccessSettings =
    currentUserRole &&
    ["OWNER", "ADMIN", "MODERATOR"].includes(currentUserRole);

  const handleHeaderClick = () => {
    if (!canAccessSettings) {
      setShowDetails(true);
    }
  };

  return (
    <>
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="mr-2 -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleHeaderClick}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={group.iconUrl} />
                <AvatarFallback>
                  {group.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg">{group.name}</h2>
                  {group.type === "PUBLIC" ? (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMember && onLeaveGroup && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLeaveGroup}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}

            {canAccessSettings && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="hover:bg-white/10"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {showSettings && group && (
        <GroupSettingsDialog
          group={group}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showDetails && group && (
        <GroupDetailsDialog
          group={group}
          members={members}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default ChatHeader;
