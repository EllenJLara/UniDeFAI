// app/components/chat/GroupSettingsDialog.tsx
import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import {
  Globe,
  Lock,
  Upload,
  X,
  Crown,
  Shield,
  User,
  Users,
  Ban,
} from "lucide-react";
import { uploadMedia } from "@/lib/uploadMedia";
import axios from "axios";
import { cn } from "@/lib/utils";
import { InviteMembersDialog } from "./InviteMembersDialog";

interface GroupSettingsDialogProps {
  group: {
    id: string;
    name: string;
    description?: string;
    type: "PUBLIC" | "PRIVATE";
    iconUrl?: string;
    members?: Array<{
      userId: string;
      role: "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";
      user: {
        id: string;
        name: string;
        image: string;
      };
    }>;
  };
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

 function GroupSettingsDialog({
  group,
  onClose,
}: GroupSettingsDialogProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [type, setType] = useState(group.type);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const currentUserRole =
    group.members?.find((member) => member.userId === session?.user?.id)
      ?.role || "MEMBER";

  const canEditSettings = ["OWNER", "ADMIN"].includes(currentUserRole);
  const canManageMembers = ["OWNER", "ADMIN", "MODERATOR"].includes(
    currentUserRole
  );

  const updateGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      let iconUrl = group.iconUrl;

      if (iconFile) {
        iconUrl = await uploadMedia({
          file: iconFile,
          type: "group-icon",
          groupId: group.id,
        });
      }

      await axios.patch(`/api/chat/groups/${group.id}`, {
        ...data,
        iconUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      await axios.patch(`/api/chat/groups/${group.id}/members/${memberId}`, {
        role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await axios.delete(`/api/chat/groups/${group.id}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
    },
  });

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    if (!canEditSettings) return;

    try {
      let iconUrl = group.iconUrl;

      if (iconFile) {
        try {
          iconUrl = await uploadMedia({
            file: iconFile,
            type: "group-icon",
            groupId: group.id,
          });
        } catch (error) {
          console.error("Failed to upload icon:", error);
          return;
        }
      }

      await updateGroupMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        type,
        iconUrl,
      });

      setIconFile(null);
      setPreviewIcon(null);
    } catch (error) {
      console.error("Failed to update group:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Group Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden">
          <TabsList className="px-6 border-b h-12">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={previewIcon || group.iconUrl}
                    alt={group.name}
                  />
                  <AvatarFallback>
                    {group.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("icon-upload")?.click()
                    }
                    disabled={!canEditSettings}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Icon
                  </Button>
                  <input
                    id="icon-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleIconChange}
                    disabled={!canEditSettings}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Group name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!canEditSettings}
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!canEditSettings}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={type === "PRIVATE" ? "default" : "outline"}
                    onClick={() => setType("PRIVATE")}
                    className="flex-1"
                    disabled={!canEditSettings}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Private
                  </Button>

                  <Button
                    type="button"
                    variant={type === "PUBLIC" ? "default" : "outline"}
                    onClick={() => setType("PUBLIC")}
                    className="flex-1"
                    disabled={!canEditSettings}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Public
                  </Button>
                </div>
              </div>

              {canEditSettings && (
                <Button
                  onClick={handleSaveSettings}
                  disabled={updateGroupMutation.isLoading}
                  className="w-full"
                >
                  {updateGroupMutation.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Members</h3>
                {canManageMembers && (
                  <Button
                    onClick={() => setShowInviteDialog(true)}
                    variant="outline"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {group.members?.map((member) => {
                  const badge = getRoleBadge(member.role);
                  const isCurrentUser = member.userId === session?.user?.id;
                  const canManageThisMember =
                    canManageMembers &&
                    !isCurrentUser &&
                    member.role !== "OWNER" &&
                    (currentUserRole === "OWNER" ||
                      (currentUserRole === "ADMIN" && member.role !== "ADMIN"));

                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user.image} />
                          <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-medium">
                            {member.user.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (You)
                              </span>
                            )}
                          </div>
                          <div
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
                              badge.class
                            )}
                          >
                            {badge.icon}
                            {member.role}
                          </div>
                        </div>
                      </div>

                      {canManageThisMember && (
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(e) => {
                              updateMemberRoleMutation.mutate({
                                memberId: member.userId,
                                role: e.target.value,
                              });
                            }}
                            className="bg-transparent border rounded px-2 py-1 text-sm"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="MODERATOR">Moderator</option>
                            {currentUserRole === "OWNER" && (
                              <option value="ADMIN">Admin</option>
                            )}
                          </select>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (
                                confirm("Remove this member from the group?")
                              ) {
                                removeMemberMutation.mutate(member.userId);
                              }
                            }}
                          >
                            <Ban className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <InviteMembersDialog
              groupId={group.id}
              isOpen={showInviteDialog}
              onClose={() => setShowInviteDialog(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


export default GroupSettingsDialog