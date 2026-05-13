import React, { useState, useEffect } from "react";
import { SubView } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/useAppStore";
import { getProfile } from "@/api/services/profile.service";
import { MOCK_USERS, PROFILE_VISIBILITY } from "@/api/mocks/users.mock";
import { getUserSkills } from "@/api/services/skills.service";
import type { UserProfile } from "@/api/types";

export const ProfileTab: React.FC = () => {
  const {
    profileTab,
    setProfileTab,
    viewingProfileId,
    privacy,
    setPrivacy,
    followedUsers,
    toggleFollowUser,
    outfits,
    mixes,
  } = useAppStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadProfile();
  }, [viewingProfileId]);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getProfile(viewingProfileId || undefined);
    setProfile(data);
    const skills = await getUserSkills();
    setUserSkills(skills);
    setLoading(false);
  };

  const isOwnProfile = !viewingProfileId;
  const mockUser = MOCK_USERS.find((u) => u.id === (viewingProfileId || MOCK_USERS[0].id)) || MOCK_USERS[0];
  const isFollowed = viewingProfileId ? followedUsers.includes(viewingProfileId) : false;

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  // Settings SubView
  if (profileTab === "settings" && isOwnProfile) {
    return (
      <SubView title="Settings" onBack={() => setProfileTab("closet")}>
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">Account</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-neutral-700">Name</span>
                <span className="text-sm text-neutral-500">{profile.name}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-neutral-700">Email</span>
                <span className="text-sm text-neutral-500">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-neutral-700">Handle</span>
                <span className="text-sm text-neutral-500">@{profile.handle}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">Measurements</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Height", value: `${profile.profile?.height}cm` },
                { label: "Weight", value: `${profile.profile?.weight}kg` },
                { label: "Bust", value: `${profile.profile?.bust}cm` },
                { label: "Waist", value: `${profile.profile?.waist}cm` },
                { label: "Hips", value: `${profile.profile?.hips}cm` },
              ].map((m) => (
                <div key={m.label} className="bg-neutral-50 rounded-xl p-3">
                  <p className="text-xs text-neutral-400">{m.label}</p>
                  <p className="text-sm font-semibold text-neutral-900">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SubView>
    );
  }

  // Privacy SubView
  if (profileTab === "privacy" && isOwnProfile) {
    return (
      <SubView title="Privacy" onBack={() => setProfileTab("closet")}>
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">Wardrobe Visibility</h3>
            <div className="space-y-2">
              {Object.entries(PROFILE_VISIBILITY).map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => setPrivacy({ ...privacy, wardrobe: value })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl ${
                    privacy.wardrobe === value ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <span className="text-sm font-medium">{key}</span>
                  {privacy.wardrobe === value && <CheckIcon size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">Wishlist Visibility</h3>
            <div className="space-y-2">
              {Object.entries(PROFILE_VISIBILITY).map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => setPrivacy({ ...privacy, wishlist: value })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl ${
                    privacy.wishlist === value ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <span className="text-sm font-medium">{key}</span>
                  {privacy.wishlist === value && <CheckIcon size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SubView>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Profile Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100">
            <img src={mockUser.avatar} alt={mockUser.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-neutral-900">{mockUser.name}</h2>
            <p className="text-sm text-neutral-500">@{mockUser.handle}</p>
          </div>
          {isOwnProfile ? (
            <button
              onClick={() => setProfileTab("settings")}
              className="p-2 bg-neutral-100 rounded-full"
            >
              <SettingsIcon size={18} />
            </button>
          ) : (
            <button
              onClick={() => viewingProfileId && toggleFollowUser(viewingProfileId)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isFollowed ? "bg-neutral-200 text-neutral-600" : "bg-neutral-900 text-white"
              }`}
            >
              {isFollowed ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <p className="text-sm text-neutral-600 mt-2">{mockUser.bio}</p>

        <div className="flex gap-4 mt-3">
          <div className="text-center">
            <p className="text-sm font-bold text-neutral-900">{mockUser.followers.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-neutral-900">{mockUser.following}</p>
            <p className="text-xs text-neutral-500">Following</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-neutral-900">{mockUser.skills?.length || 0}</p>
            <p className="text-xs text-neutral-500">Skills</p>
          </div>
        </div>

        {/* Skills tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {mockUser.skills?.map((skill) => (
            <span key={skill} className="px-2.5 py-1 bg-neutral-100 rounded-full text-xs text-neutral-600">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex px-4 gap-2 border-b border-neutral-100">
        {["closet", "mixes", "stats"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (tab === "stats") setProfileTab("stats");
              else if (tab === "mixes") setProfileTab("closet");
              else setProfileTab("closet");
            }}
            className={`px-3 py-2.5 text-sm font-medium capitalize border-b-2 ${
              (tab === "closet" && profileTab === "closet") || (tab === "stats" && profileTab === "stats")
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400"
            }`}
          >
            {tab}
          </button>
        ))}
        {isOwnProfile && (
          <button
            onClick={() => setProfileTab("privacy")}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 ${
              profileTab === "privacy" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"
            }`}
          >
            Privacy
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {profileTab === "closet" && (
          <div className="space-y-4">
            {/* Wardrobe preview */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">Wardrobe</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {mockUser.wardrobeIds?.slice(0, 8).map((id) => {
                  const item = INITIAL_WARDROBE.find((i) => i.id === id);
                  return item ? (
                    <div key={id} className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Wishlist preview */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">Wishlist</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {mockUser.wishlistIds?.slice(0, 4).map((id) => {
                  const item = MOCK_WISHLIST.find((i) => i.id === id);
                  return item ? (
                    <div key={id} className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        {profileTab === "stats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-neutral-900">{outfits.length}</p>
                <p className="text-xs text-neutral-500">Outfits Created</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-neutral-900">{mixes.length}</p>
                <p className="text-xs text-neutral-500">Mixes Saved</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-neutral-900">{followedUsers.length}</p>
                <p className="text-xs text-neutral-500">Following</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-neutral-900">{userSkills.length}</p>
                <p className="text-xs text-neutral-500">Skills</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
