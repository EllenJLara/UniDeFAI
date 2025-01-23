import React from "react";
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import ChatContainer from '@/components/chat/ChatContainer';

interface PageProps {
  params: Promise<{
    groupId: string;
  }>
}

async function Page({ params }: PageProps) {
  const [session, resolvedParams] = await Promise.all([
    getServerSession(),
    params
  ]);
  
  const groupId = resolvedParams.groupId;

  if (!session) {
    redirect('/');
  }

  if (!groupId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatContainer groupId={groupId} />
    </div>
  );
}

export default Page;