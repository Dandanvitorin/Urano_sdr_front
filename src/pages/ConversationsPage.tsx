import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLeadsStore } from "@/stores/leadsStore";
import { useChatStore } from "@/stores/chatStore";
import { LeadList } from "@/components/leads/LeadList";
import { StatsBadges } from "@/components/leads/StatsBadges";
import { ChatArea } from "@/components/chat/ChatArea";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ConversationsPage() {
  const { phone } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showDetail, setShowDetail] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const { leads, selectedPhone, selectLead, stats } = useLeadsStore();
  const { refreshChat, refreshPending, clearChat } = useChatStore();

  useEffect(() => {
    if (phone && phone !== selectedPhone) {
      selectLead(phone);
      refreshChat(phone);
      refreshPending(phone);
      if (isMobile) setMobileListOpen(false);
    } else if (!phone && selectedPhone) {
      selectLead(null);
      clearChat();
    }
  }, [phone]);

  const handleSelectLead = (leadPhone: string) => {
    navigate(`/app/conversations/${leadPhone}`);
  };

  const leadListContent = (
    <div className="flex flex-col h-full">
      <LeadList leads={leads} selectedPhone={selectedPhone} onSelectLead={handleSelectLead} />
      {stats && <StatsBadges stats={stats} />}
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop lead list */}
      {!isMobile && (
        <div className="w-[300px] min-w-[300px] border-r border-border bg-card flex flex-col">
          {leadListContent}
        </div>
      )}

      {/* Mobile lead list as sheet */}
      {isMobile && (
        <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
          <SheetContent side="left" className="w-[300px] p-0 bg-card">
            {leadListContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea
          onToggleDetail={() => setShowDetail((v) => !v)}
          onOpenSidebar={() => setMobileListOpen(true)}
          isMobile={isMobile}
        />
      </div>

      {/* Desktop detail panel */}
      {showDetail && selectedPhone && !isMobile && (
        <div className="w-[300px] min-w-[300px] border-l border-border bg-card flex flex-col overflow-y-auto">
          <LeadDetail onClose={() => setShowDetail(false)} />
        </div>
      )}

      {/* Mobile detail sheet */}
      {isMobile && showDetail && selectedPhone && (
        <Sheet open={showDetail} onOpenChange={setShowDetail}>
          <SheetContent side="right" className="w-[320px] p-0 bg-card">
            <LeadDetail onClose={() => setShowDetail(false)} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
