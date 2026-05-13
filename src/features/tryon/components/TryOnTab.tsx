import React, { useState } from "react";
import { useAppStore } from "@/shared/stores/useAppStore";
import { createTryOnTask, getTaskStatus } from "@/api/services/tryon.service";
import { SubView, LoadingSpinner } from "@/shared/components/ui";
import { INITIAL_WARDROBE } from "@/api/mocks/wardrobe.mock";
import type { TaskStatusResponse } from "@/api/types";

export const TryOnTab: React.FC = () => {
  const { tryOnDraft, setTryOnDraft, tryOnStatus, setTryOnStatus, wardrobe } = useAppStore();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [showItemPicker, setShowItemPicker] = useState(false);

  const wardrobeItems = wardrobe.length > 0 ? wardrobe : INITIAL_WARDROBE;

  const handleGenerate = async () => {
    if (selectedItems.length === 0) return;
    setTryOnStatus({
      phase: "uploading",
      loadingText: "Uploading images...",
      profileNotificationCount: 0,
      runId: null,
    });

    const garmentUrls = selectedItems.map(
      (id) => wardrobeItems.find((i) => i.id === id)?.image || ""
    );

    try {
      const { taskId } = await createTryOnTask({
        title: tryOnDraft.title || "My Try-On",
        scenario: tryOnDraft.scenario || "casual",
        garmentImageUrls: garmentUrls,
      });

      setTryOnStatus((prev) => ({ ...prev, phase: "generating", runId: taskId }));

      // Poll for status
      const pollInterval = setInterval(async () => {
        const status = await getTaskStatus(taskId);
        setTryOnStatus({
          phase: status.status === "COMPLETED" ? "complete" : "generating",
          loadingText: status.status === "COMPLETED" ? "Done!" : `Generating... ${status.progress}%`,
          profileNotificationCount: 0,
          runId: taskId,
        });

        if (status.status === "COMPLETED") {
          clearInterval(pollInterval);
          setResultUrl(status.resultUrl || null);
          setShowResult(true);
        }
      }, 1500);
    } catch {
      setTryOnStatus({
        phase: "error",
        loadingText: "Something went wrong. Try again.",
        profileNotificationCount: 0,
        runId: null,
      });
    }
  };

  const toggleItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (showResult && resultUrl) {
    return (
      <SubView title="Try-On Result" onBack={() => { setShowResult(false); setResultUrl(null); }}>
        <div className="p-4 space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100">
            <img src={resultUrl} alt="Try-on result" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowResult(false); setResultUrl(null); }}
              className="flex-1 py-3 bg-neutral-900 text-white rounded-xl text-sm font-semibold"
            >
              Try Another
            </button>
            <button
              onClick={() => { /* Save to gallery */ }}
              className="flex-1 py-3 bg-neutral-100 text-neutral-900 rounded-xl text-sm font-semibold"
            >
              Save to Gallery
            </button>
          </div>
        </div>
      </SubView>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-neutral-900">Try On</h1>
        <p className="text-sm text-neutral-500 mt-1">Select items to create your look</p>
      </div>

      {/* Selected items preview */}
      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {selectedItems.length === 0 ? (
            <button
              onClick={() => setShowItemPicker(true)}
              className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center"
            >
              <PlusIcon size={20} className="text-neutral-400" />
            </button>
          ) : (
            <>
              {selectedItems.map((id) => {
                const item = wardrobeItems.find((i) => i.id === id);
                return (
                  <div key={id} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 relative">
                    <img src={item?.image} alt={item?.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => toggleItem(id)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <XIcon size={10} className="text-white" />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => setShowItemPicker(true)}
                className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center"
              >
                <PlusIcon size={20} className="text-neutral-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scenario input */}
      <div className="px-4 py-2 space-y-2">
        <input
          type="text"
          value={tryOnDraft.title}
          onChange={(e) => setTryOnDraft({ ...tryOnDraft, title: e.target.value })}
          placeholder="Give your look a name..."
          className="w-full bg-neutral-100 rounded-xl px-4 py-2.5 text-sm outline-none"
        />
        <input
          type="text"
          value={tryOnDraft.scenario}
          onChange={(e) => setTryOnDraft({ ...tryOnDraft, scenario: e.target.value })}
          placeholder="Occasion (e.g., summer wedding, date night)..."
          className="w-full bg-neutral-100 rounded-xl px-4 py-2.5 text-sm outline-none"
        />
      </div>

      {/* Generate button */}
      <div className="px-4 py-2">
        <button
          onClick={handleGenerate}
          disabled={selectedItems.length === 0 || tryOnStatus.phase === "generating"}
          className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {tryOnStatus.phase === "generating" ? (
            <>
              <LoadingSpinner size={16} />
              {tryOnStatus.loadingText}
            </>
          ) : (
            <>Generate Look</>
          )}
        </button>
      </div>

      {/* Status */}
      {tryOnStatus.phase === "error" && (
        <div className="px-4 py-2">
          <p className="text-sm text-red-500">{tryOnStatus.loadingText}</p>
        </div>
      )}

      {/* Item Picker Modal */}
      {showItemPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom h-[70vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Items</h3>
              <button onClick={() => setShowItemPicker(false)}>
                <XIcon size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1">
              {wardrobeItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id as number)}
                  className={`relative aspect-square rounded-xl overflow-hidden ${
                    selectedItems.includes(item.id as number) ? "ring-2 ring-neutral-900" : ""
                  }`}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  {selectedItems.includes(item.id as number) && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <CheckIcon size={20} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowItemPicker(false)}
              className="w-full py-3 bg-neutral-900 text-white rounded-xl text-sm font-semibold"
            >
              Done ({selectedItems.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PlusIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const XIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
