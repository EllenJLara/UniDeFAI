import { cn } from "@/lib/utils";

export const ChatHeaderSkeleton = () => {
  return (
    <div className="border-b px-4 py-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export const MessageSkeletonItem = ({ isOwn = false }: { isOwn?: boolean }) => {
  return (
    <div className={cn(
      "flex gap-2 py-2",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      <div className="w-8 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className={cn(
        "flex flex-col gap-1",
        isOwn ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className={cn(
          "h-16 w-64 rounded-lg",
          "bg-gray-200 dark:bg-gray-700"
        )} />
      </div>
    </div>
  );
};

export const MessageListSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <MessageSkeletonItem key={i} isOwn={i % 2 === 0} />
      ))}
    </div>
  );
};

export const ChatNavigatorSkeleton = () => {
  return (
    <div className="flex flex-col h-full bg-background animate-pulse">
      <div className="h-16 px-4 border-b border-border/50">
        <div className="flex items-center justify-between h-full">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <div className="flex-1 px-4 py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};