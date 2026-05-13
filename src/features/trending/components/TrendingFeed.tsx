import React, { useState, useEffect, useRef } from "react";
import { SubView } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/useAppStore";
import { getFeed, searchFeed, likeFeedItem } from "@/api/services/feed.service";
import { MOCK_USERS, findUserById } from "@/api/mocks/users.mock";
import { HAWAII_SCENES, NEW_YORK_SCENES } from "@/api/mocks/feed.mock";
import { getSkills } from "@/api/services/skills.service";
import type { FeedItem } from "@/api/types";

export const TrendingFeed: React.FC = () => {
  const { setViewingProfileId, setActiveTab, followedUsers, toggleFollowUser } = useAppStore();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FeedItem[] | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sceneFilter, setSceneFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryReply, setDiscoveryReply] = useState("Tell me the occasion and I will help style it.");
  const [discoveryTags, setDiscoveryTags] = useState(["Y2K", "Going Out", "Minimalist", "Coastal"]);
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    loadFeed();
    getSkills().then(setSkills);
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const data = await getFeed({ location: locationFilter, tag: sceneFilter });
    setFeed(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFeed();
  }, [locationFilter, sceneFilter]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const results = await searchFeed(searchQuery);
    setSearchResults(results);
  };

  const handleLike = async (itemId: number) => {
    await likeFeedItem(itemId);
    setFeed((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, likes: item.likes + 1 } : item))
    );
  };

  const scenes = locationFilter === "hawaii" ? HAWAII_SCENES : locationFilter === "newyork" ? NEW_YORK_SCENES : [];

  if (showDiscovery) {
    return (
      <SubView title="Discovery Stylist" onBack={() => setShowDiscovery(false)}>
        <div className="p-4 space-y-4">
          <div className="bg-neutral-50 rounded-2xl p-4">
            <p className="text-sm text-neutral-700">{discoveryReply}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {discoveryTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSceneFilter(tag.toLowerCase())}
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-xs font-medium text-neutral-700"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {skills.slice(0, 2).map((skill) => (
              <button
                key={skill.id}
                onClick={() => setShowDiscovery(false)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden"
              >
                <img src={skill.cover} alt={skill.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-semibold">{skill.name}</p>
                  <p className="text-white/80 text-[10px]">{skill.author}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SubView>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search styles, people..."
              className="w-full bg-neutral-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
            />
          </div>
          <button
            onClick={() => setShowDiscovery(true)}
            className="p-2.5 bg-neutral-900 text-white rounded-full"
          >
            <SparklesIcon size={18} />
          </button>
        </div>

        {/* Location filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["all", "hawaii", "newyork"].map((loc) => (
            <button
              key={loc}
              onClick={() => { setLocationFilter(loc); setSceneFilter("all"); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                locationFilter === loc
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {loc === "all" ? "All" : loc === "hawaii" ? "Hawaii" : "New York"}
            </button>
          ))}
        </div>

        {/* Scene filters */}
        {scenes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSceneFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                sceneFilter === "all" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
              }`}
            >
              All
            </button>
            {scenes.map((scene) => (
              <button
                key={scene.slug}
                onClick={() => setSceneFilter(scene.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  sceneFilter === scene.slug ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {scene.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feed Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(searchResults || feed).map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                onLike={() => handleLike(item.id)}
                onUserClick={() => {
                  if (item.userId) {
                    setViewingProfileId(item.userId);
                    setActiveTab("profile");
                  }
                }}
                isFollowed={item.userId ? followedUsers.includes(item.userId) : false}
                onFollowToggle={() => item.userId && toggleFollowUser(item.userId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FeedCard: React.FC<{
  item: FeedItem;
  onLike: () => void;
  onUserClick: () => void;
  isFollowed: boolean;
  onFollowToggle: () => void;
}> = ({ item, onLike, onUserClick, isFollowed, onFollowToggle }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100">
        <img src={item.image} alt={item.desc} className="w-full h-full object-cover" />
        <button
          onClick={onLike}
          className="absolute top-2 right-2 p-1.5 bg-black/30 backdrop-blur-sm rounded-full"
        >
          <HeartIcon size={14} className="text-white" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onUserClick} className="flex items-center gap-1.5 flex-1 min-w-0">
          <img src={item.avatar} alt={item.user} className="w-5 h-5 rounded-full object-cover" />
          <span className="text-xs font-medium text-neutral-700 truncate">{item.user}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onFollowToggle(); }}
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isFollowed
              ? "bg-neutral-200 text-neutral-600"
              : "bg-neutral-900 text-white"
          }`}
        >
          {isFollowed ? "Following" : "Follow"}
        </button>
      </div>
      <p className="text-[11px] text-neutral-500 line-clamp-2">{item.desc}</p>
      <div className="flex items-center gap-1 text-[10px] text-neutral-400">
        <HeartIcon size={10} />
        <span>{item.likes}</span>
      </div>
    </div>
  );
};

/* Simple icon components */
const SparklesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
  </svg>
);

const HeartIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
