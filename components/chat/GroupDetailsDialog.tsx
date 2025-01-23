// app/components/chat/GroupDetailsDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Shield, User, Globe, Lock } from "lucide-react";

interface GroupMember {
  userId: string;
  role: "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";
  user: {
    id: string;
    name: string;
    image: string;
  };
}

interface Group {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  type: "PUBLIC" | "PRIVATE";
}

interface GroupDetailsDialogProps {
  group: Group;
  members: GroupMember[];
  onClose: () => void;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case "OWNER":
      return {
        icon: <Crown className="h-4 w-4" />,
        class: "bg-yellow-500/20 text-yellow-500",
      };
    case "ADMIN":
      return {
        icon: <Shield className="h-4 w-4" />,
        class: "bg-red-500/20 text-red-500",
      };
    case "MODERATOR":
      return {
        icon: <Shield className="h-4 w-4" />,
        class: "bg-blue-500/20 text-blue-500",
      };
    default:
      return {
        icon: <User className="h-4 w-4" />,
        class: "bg-gray-500/20 text-gray-500",
      };
  }
};

export function GroupDetailsDialog({
  group,
  members,
  onClose,
}: GroupDetailsDialogProps) {
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { OWNER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Group Details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={group.iconUrl} />
              <AvatarFallback>
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                {group.name}
                {group.type === "PUBLIC" ? (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </h3>

              {group.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">
              Members ({members.length})
            </h4>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {sortedMembers.map((member) => {
                  const badge = getRoleBadge(member.role);

                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.image} />
                          <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-medium text-sm">
                            {member.user.name}
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${badge.class}`}
                          >
                            {badge.icon}
                            {member.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
