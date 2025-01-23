// app/components/useGroup.ts
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { pusherClient, ChatEvents, getGroupChannel } from '@/lib/pusher';
import axios from 'axios';

interface GroupMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  user: {
    id: string;
    name: string;
    image: string;
    walletAddress: string;
  };
}

interface Group {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  type: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  createdAt: Date;
  allowMedia: boolean;
  maxFileSize: number;
  isEncrypted: boolean;
  creatorId: string;
}

export const useGroup = (groupId: string) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const channel = pusherClient.subscribe(`private-${getGroupChannel(groupId)}`);

    channel.bind(ChatEvents.MEMBERS_ADDED, ({ newMembers }: { newMembers: GroupMember[] }) => {
      setMembers(prev => [...prev, ...newMembers]);
    });

    channel.bind(ChatEvents.MEMBER_REMOVED, ({ removedMemberId }: { removedMemberId: string }) => {
      setMembers(prev => prev.filter(member => member.userId !== removedMemberId));
    });

    channel.bind(ChatEvents.MEMBER_UPDATED, ({ updatedMember }: { updatedMember: GroupMember }) => {
      setMembers(prev => prev.map(member => 
        member.userId === updatedMember.userId ? updatedMember : member
      ));
    });

    loadGroup();

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-${getGroupChannel(groupId)}`);
    };
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const config = walletAddress ? {
        headers: {
          'X-Wallet-Address': walletAddress
        }
      } : {};

      const response = await axios.get(`/api/chat/groups/${groupId}`, config);
      
      setGroup(response.data);
      setMembers(response.data.members);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load group');
      console.error('Error loading group:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (data: Partial<Group>) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const config = walletAddress ? {
        headers: {
          'X-Wallet-Address': walletAddress
        }
      } : {};

      const response = await axios.patch(
        `/api/chat/groups/${groupId}`,
        data,
        config
      );
      
      setGroup(response.data);
      return response.data;
    } catch (err) {
      console.error('Error updating group:', err);
      throw err;
    }
  };

  const addMembers = async (memberIds: string[]) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const config = walletAddress ? {
        headers: {
          'X-Wallet-Address': walletAddress
        }
      } : {};

      const response = await axios.post(
        `/api/chat/groups/${groupId}/members`,
        { userIds: memberIds },
        config
      );
      
      setMembers(prev => [...prev, ...response.data]);
      return response.data;
    } catch (err) {
      console.error('Error adding members:', err);
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const config = walletAddress ? {
        headers: {
          'X-Wallet-Address': walletAddress
        }
      } : {};

      await axios.delete(
        `/api/chat/groups/${groupId}/members/${memberId}`,
        config
      );
      
      setMembers(prev => prev.filter(member => member.userId !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  };

  return {
    group,
    members,
    loading,
    error,
    updateGroup,
    addMembers,
    removeMember,
    loadGroup
  };
};
