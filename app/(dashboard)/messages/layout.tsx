import { ConversationList } from "@/features/chat/components/conversation-list";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full p-4">
      <div className="flex flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[#2596BE]/25 via-[#DDEBF3] to-[#DDEBF3]/60">
        {/* Left panel — glass sidebar */}
        <div className="w-72 flex-none flex flex-col border-r border-white/40 bg-white/50 backdrop-blur-xl">
          <div className="px-5 pt-6 pb-4 border-b border-white/30">
            <h1 className="font-archivo-black text-lg text-[#18150F] tracking-widest uppercase">Messages</h1>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <ConversationList />
          </div>
        </div>
        {/* Right panel — glass chat panel, white-tinted */}
        <div className="flex-1 min-w-0 flex flex-col bg-white/75 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
