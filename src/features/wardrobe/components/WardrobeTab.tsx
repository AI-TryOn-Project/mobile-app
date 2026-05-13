import React, { useState, useEffect } from "react";
import { SubView } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/useAppStore";
import { getWardrobe, getWishlist, addToWardrobe, removeFromWardrobe, uploadWardrobeImage } from "@/api/services/wardrobe.service";
import { INITIAL_WARDROBE } from "@/api/mocks/wardrobe.mock";
import { MOCK_WISHLIST } from "@/api/mocks/wishlist.mock";
import type { WardrobeItem } from "@/api/types";

export const WardrobeTab: React.FC = () => {
  const {
    wardrobeMainTab,
    setWardrobeMainTab,
    wardrobeFilter,
    setWardrobeFilter,
    wardrobeWishlistFilter,
    setWardrobeWishlistFilter,
    wardrobeUpload,
    setWardrobeUpload,
    setWardrobeNoticeCount,
  } = useAppStore();

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadItems();
  }, [wardrobeMainTab]);

  const loadItems = async () => {
    if (wardrobeMainTab === "Owned") {
      const data = await getWardrobe();
      setItems(data);
    } else {
      const data = await getWishlist();
      setItems(data);
    }
  };

  const categories = ["All", "Tops", "Bottoms", "Dresses", "Shoes", "Bags", "Jewelry"];
  const activeFilter = wardrobeMainTab === "Owned" ? wardrobeFilter : wardrobeWishlistFilter;
  const setActiveFilter = wardrobeMainTab === "Owned" ? setWardrobeFilter : setWardrobeWishlistFilter;

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeFilter === "All" || item.category === activeFilter;
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadWardrobeImage(file);
      const newItem = await addToWardrobe({
        brand: "Uploaded",
        name: file.name.replace(/\.[^/.]+$/, ""),
        image: url,
        category: "Tops",
      });
      setItems((prev) => [...prev, newItem]);
      setWardrobeUpload(newItem);
      setWardrobeNoticeCount((prev) => prev + 1);
      setShowUpload(false);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (id: number | string) => {
    await removeFromWardrobe(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItem(null);
  };

  if (selectedItem) {
    return (
      <SubView
        title={selectedItem.name}
        onBack={() => setSelectedItem(null)}
        rightAction={
          <button
            onClick={() => handleRemove(selectedItem.id)}
            className="text-red-500 text-xs font-medium"
          >
            Remove
          </button>
        }
      >
        <div className="p-4 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100">
            <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{selectedItem.brand}</p>
            <p className="text-sm text-neutral-600">{selectedItem.name}</p>
            <p className="text-xs text-neutral-400 mt-1">{selectedItem.category}</p>
            {selectedItem.price && (
              <p className="text-sm font-semibold text-neutral-900 mt-2">{selectedItem.price}</p>
            )}
          </div>
        </div>
      </SubView>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="flex px-4 pt-4 pb-2 gap-2">
        {["Owned", "Wishlist"].map((tab) => (
          <button
            key={tab}
            onClick={() => setWardrobeMainTab(tab as "Owned" | "Wishlist")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${
              wardrobeMainTab === tab
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search + Upload */}
      <div className="px-4 pb-2 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="flex-1 bg-neutral-100 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          onClick={() => setShowUpload(true)}
          className="p-2 bg-neutral-900 text-white rounded-full"
        >
          <PlusIcon size={18} />
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              activeFilter === cat
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="flex flex-col gap-1"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-medium text-neutral-700 truncate px-0.5">{item.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add to Wardrobe</h3>
              <button onClick={() => setShowUpload(false)} className="p-1">
                <XIcon size={20} />
              </button>
            </div>
            <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-neutral-200 rounded-2xl cursor-pointer">
              <UploadIcon size={32} className="text-neutral-400" />
              <span className="text-sm text-neutral-600">Tap to upload photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            {uploading && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-200 border-t-neutral-900" />
                <span className="text-sm text-neutral-600">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PlusIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const XIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const UploadIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
