// app/components/chat/TypingIndicator.tsx
interface TypingIndicatorProps {
  users: Array<{ id: string; name: string }>;
}

const TypingIndicator = ({ users }: TypingIndicatorProps) => {
  if (users.length === 0) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-500">
      <span className="inline-flex items-center">
        <span className="mr-2">
          {users.length === 1
            ? `${users[0].name} is typing`
            : users.length === 2
            ? `${users[0].name} and ${users[1].name} are typing`
            : `${users.length} people are typing`}
        </span>
        <span className="flex space-x-1">
          <span className="animate-bounce delay-0">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </span>
      </span>
    </div>
  );
};

export default TypingIndicator;
