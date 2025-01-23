// app/components/chat/ChatNavigator.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquarePlus,
  Plus,
  Lock,
  Globe,
  Hash,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ChatNavigatorSkeleton } from "./skeletons/ChatSkeletons";
import { useMediaQuery } from "../tweets/hooks/use-media-query";

// Lazy load the settings dialog
const GroupSettingsDialog = React.lazy(() => import("./GroupSettingsDialog"));

interface Group {
  id: string;
  name: string;
  type: "PUBLIC" | "PRIVATE";
  description?: string;
  iconUrl?: string;
  members?: Array<any>;
  _count?: {
    members: number;
  };
}

const CreateGroupDialog = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      type: string;
    }) => {
      const response = await axios.post("/api/chat/groups", data);
      return response.data;
    },
    onSuccess: (newGroup) => {
      queryClient.setQueryData<Group[]>(["chat-groups"], (oldData = []) => [
        ...oldData,
        newGroup,
      ]);
      onClose();
      setName("");
      setDescription("");
      setType("PRIVATE");
      toast.success("Group created successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      type,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg focus:border-white/90 border-white/60"
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg focus:border-white/90 border-white/60"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "PRIVATE" ? "default" : "outline"}
              onClick={() => setType("PRIVATE")}
              className={cn(
                "flex-1 rounded-lg h-10",
                type === "PRIVATE" && "bg-white hover:bg-white/90 text-black"
              )}
            >
              <Lock className="h-4 w-4 mr-2" />
              Private
            </Button>

            <Button
              type="button"
              variant={type === "PUBLIC" ? "default" : "outline"}
              onClick={() => setType("PUBLIC")}
              className={cn(
                "flex-1 rounded-lg h-10",
                type === "PUBLIC" && "bg-white hover:bg-white/90 text-black"
              )}
            >
              <Globe className="h-4 w-4 mr-2" />
              Public
            </Button>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!name.trim() || createMutation.isLoading}
              className="rounded-lg h-10 bg-white text-black hover:bg-white/90"
            >
              {createMutation.isLoading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const GroupItem = ({
  group,
  isActive,
  onSelect,
  isMember,
  onJoin,
  onOpenSettings,
}: {
  group: Group;
  isActive: boolean;
  onSelect: (groupId: string) => void;
  isMember: boolean;
  onJoin?: () => void;
  onOpenSettings?: () => void;
}) => {
  const getGroupIcon = () => {
    switch (group.type) {
      case "PUBLIC":
        return <Globe className="h-4 w-4" />;
      case "PRIVATE":
        return <Lock className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
        "transition-all duration-200 ease-in-out",
        "hover:bg-white/10 dark:hover:bg-white/10 cursor-pointer",
        "group relative",
        isActive && "bg-white/15 dark:bg-white/15"
      )}
      onClick={() => onSelect(group.id)}
    >
      <div className="flex-1 flex items-center gap-3">
        <Avatar
          className={cn(
            "h-10 w-10 rounded-lg border-2 transition-colors",
            isActive
              ? "border-white"
              : "border-transparent group-hover:border-white/50"
          )}
        >
          {group.iconUrl ? (
            <AvatarImage
              src={group.iconUrl}
              alt={group.name}
              className="rounded-lg"
            />
          ) : (
            <AvatarFallback
              className={cn(
                "rounded-lg text-white",
                "bg-white/10 dark:bg-white/10"
              )}
            >
              {getGroupIcon()}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              "text-foreground",
              "transition-colors",
              isActive && "text-white"
            )}
          >
            {group.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {group._count?.members || group.members?.length || 0} members
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isMember && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.();
            }}
            className="h-8 px-3 text-xs bg-white/10 hover:bg-white/20 border-none"
          >
            Join
          </Button>
        )}

        {isMember && onOpenSettings && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="h-8 w-8 hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-white rounded-full" />
      )}
    </div>
  );
};

export default function ChatNavigator() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroupForSettings, setSelectedGroupForSettings] =
    useState<Group | null>(null);

    const { data: allGroups, isLoading } = useQuery({
      queryKey: ["chat-groups"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/chat/groups");
          return response.data.groups;
        } catch (error) {
          console.error("An error occurred:", error);
          return [];
        }
      },
      onError: (error) => {
        console.error("An error occurred:", error);
      },
      enabled: !!session,
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    });
    
  const joinMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await axios.post(`/api/chat/groups/${groupId}/members`, {
        userIds: [session?.user?.id],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
      toast.success("Joined group successfully!");
    },
  });

  const myGroups = allGroups?.filter((group) =>
    group.members?.some((member) => member.userId === session?.user?.id)
  ) || [];

  const publicGroups = allGroups?.filter(
    (group) =>
      group.type === "PUBLIC" &&
      !group.members?.some((member) => member.userId === session?.user?.id)
  ) || [];

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    router.push(`/chat/${groupId}`);
  };

  const handleJoinGroup = async (groupId: string) => {
    await joinMutation.mutateAsync(groupId);
    handleGroupSelect(groupId);
  };

  if (!session) return null;

  if (isLoading) {
    return <ChatNavigatorSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <MessageSquarePlus className="h-5 w-5 text-white" />
          <h2 className="text-base font-semibold">Chat Groups</h2>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowCreateDialog(true)}
          className="h-8 w-8 rounded-lg hover:bg-white/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="my-groups" className="flex-1">
        <TabsList className="flex w-full border-b border-border/50 px-4 bg-background">
          <TabsTrigger
            value="my-groups"
            className="flex-1 gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            My Groups
          </TabsTrigger>
          <TabsTrigger
            value="discover"
            className="flex-1 gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-2 py-3 h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 text-sm text-muted-foreground gap-2">
                  <p>No groups yet</p>
                  <Button
                    variant="link"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    Create your first group
                  </Button>
                </div>
              ) : (
                myGroups.map((group: Group) => (
                  <GroupItem
                    key={group.id}
                    group={group}
                    isActive={group.id === selectedGroupId}
                    onSelect={handleGroupSelect}
                    isMember={true}
                    onOpenSettings={() => setSelectedGroupForSettings(group)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="discover" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-2 py-3 h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {publicGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 text-sm text-muted-foreground">
                  <p>No public groups available</p>
                </div>
              ) : (
                publicGroups.map((group: Group) => (
                  <GroupItem
                    key={group.id}
                    group={group}
                    isActive={group.id === selectedGroupId}
                    onSelect={handleGroupSelect}
                    isMember={false}
                    onJoin={() => handleJoinGroup(group.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <CreateGroupDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      <Suspense fallback={null}>
        {selectedGroupForSettings && (
          <GroupSettingsDialog
            group={selectedGroupForSettings}
            onClose={() => setSelectedGroupForSettings(null)}
          />
        )}
      </Suspense>
    </div>
  );
}