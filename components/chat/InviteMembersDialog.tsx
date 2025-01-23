// app/components/chat/InviteMembersDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface InviteMembersDialogProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMembersDialog({ groupId, isOpen, onClose }: InviteMembersDialogProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async (addresses: string[]) => {
      const response = await axios.post(`/api/chat/groups/${groupId}/invites`, {
        walletAddresses: addresses
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-groups']);
      onClose();
      setWalletAddress('');
    }
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;

    const addresses = walletAddress
      .split(',')
      .map(addr => addr.trim())
      .filter(Boolean);

    await inviteMutation.mutateAsync(addresses);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <Input
              placeholder="Enter wallet addresses (comma-separated)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            disabled={inviteMutation.isLoading || !walletAddress.trim()}
            className="w-full"
          >
            {inviteMutation.isLoading ? 'Inviting...' : 'Invite Members'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}