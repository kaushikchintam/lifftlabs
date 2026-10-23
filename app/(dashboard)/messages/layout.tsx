import { ConversationList } from "@/features/chat/components/conversation-list";
import { MessagesFooter } from "@/features/chat/components/messages-footer";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[560px] overflow-hidden rounded-2xl border border-lf-line bg-white">
      <div className="hidden w-[480px] flex-none flex-col border-r border-lf-line md:flex">
        <ConversationList />
        <MessagesFooter />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
