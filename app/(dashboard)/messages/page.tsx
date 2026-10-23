import { ConversationList } from "@/features/chat/components/conversation-list";

export default function MessagesPage() {
  return (
    <>
      {/* On phones the list lives here; on desktop it's the left column. */}
      <div className="flex flex-1 flex-col md:hidden">
        <ConversationList />
      </div>
      <div className="hidden flex-1 items-center justify-center px-8 text-center text-[17px] text-lf-muted md:flex">
        Pick a conversation to start messaging.
      </div>
    </>
  );
}
