import React, { useState, useEffect } from "react";
import { useAppStore } from "@/shared/stores/useAppStore";
import { TrendingFeed } from "@/features/trending/components/TrendingFeed";
import { WardrobeTab } from "@/features/wardrobe/components/WardrobeTab";
import { TryOnTab } from "@/features/tryon/components/TryOnTab";
import { ProfileTab } from "@/features/profile/components/ProfileTab";
import { SkillsTab } from "@/features/skills/components/SkillsTab";
import { AuthOnboardingFlow } from "@/features/auth/components/AuthOnboardingFlow";
import { AuraExtractAndChat } from "@/features/aura/components/AuraExtractAndChat";
import { NavItem, Toast } from "@/shared/components/ui";
import { loadAuthFromStorage } from "@/api/services/auth.service";

/* ─── Main App Shell ─── */
const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAuthenticated,
    setIsAuthenticated,
    viewingProfileId,
    setViewingProfileId,
    wardrobeNoticeCount,
  } = useAppStore();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showAura, setShowAura] = useState(false);

  /* Check auth on mount */
  useEffect(() => {
    const saved = loadAuthFromStorage();
    if (saved) setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  /* If not authenticated, show onboarding */
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full bg-white overflow-hidden">
        <AuthOnboardingFlow />
      </div>
    );
  }

  const TABS = [
    { key: "trending" as const, label: "Discover", icon: CompassIcon },
    { key: "wardrobe" as const, label: "Wardrobe", icon: ShirtIcon },
    { key: "tryon" as const, label: "Try On", icon: SparklesIcon },
    { key: "skills" as const, label: "Skills", icon: ZapIcon },
    { key: "profile" as const, label: "Profile", icon: UserIcon },
  ] as const;

  /* Render active tab content */
  const renderTab = () => {
    switch (activeTab) {
      case "trending":
        return <TrendingFeed />;
      case "wardrobe":
        return <WardrobeTab />;
      case "tryon":
        return <TryOnTab />;
      case "skills":
        return <SkillsTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <TrendingFeed />;
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {renderTab()}

        {/* Floating AI button */}
        <button
          onClick={() => setShowAura(true)}
          className="absolute bottom-4 right-4 w-12 h-12 bg-neutral-900 text-white rounded-full shadow-lg flex items-center justify-center z-10"
        >
          <SparklesIcon size={20} />
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 border-t border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-around py-1">
          {TABS.map((tab) => (
            <NavItem
              key={tab.key}
              icon={<tab.icon size={20} />}
              label={tab.label}
              active={activeTab === tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "profile" && viewingProfileId) {
                  setViewingProfileId(null); // Reset to own profile
                }
              }}
              badge={tab.key === "wardrobe" ? wardrobeNoticeCount : undefined}
            />
          ))}
        </div>
      </nav>

      {/* Aura Chat Modal */}
      {showAura && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-right">
          <AuraExtractAndChat />
          <button
            onClick={() => setShowAura(false)}
            className="absolute top-4 right-4 p-2 bg-neutral-100 rounded-full"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

/* ─── Icon Components ─── */
const CompassIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const ShirtIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
  </svg>
);

const ZapIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const UserIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CloseIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export default App;
