import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center h-full text-center px-8">
      <div className="w-12 h-12 rounded-full border border-[#E8E2D6] bg-[#FBF7EE] flex items-center justify-center mb-4">
        <MessageSquare size={20} className="text-[#6F6B60]" />
      </div>
      <p className="font-dm-sans font-semibold text-[#18150F] mb-1">Your messages</p>
      <p className="font-dm-sans text-sm text-[#6F6B60]">
        Select a conversation from the left to start messaging.
      </p>
    </div>
  );
}