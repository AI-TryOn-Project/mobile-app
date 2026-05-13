import React, { useState, useEffect } from "react";
import { SubView } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/useAppStore";
import { getSkills, getSkillById, addSkill, removeSkill } from "@/api/services/skills.service";
import type { Skill } from "@/api/types";

export const SkillsTab: React.FC = () => {
  const { followedUsers, toggleFollowUser } = useAppStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [userSkillIds, setUserSkillIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    const data = await getSkills();
    setSkills(data);
    setLoading(false);
  };

  const handleAddSkill = async (skillId: string) => {
    await addSkill(skillId);
    setUserSkillIds((prev) => new Set(prev).add(skillId));
  };

  const handleRemoveSkill = async (skillId: string) => {
    await removeSkill(skillId);
    setUserSkillIds((prev) => {
      const next = new Set(prev);
      next.delete(skillId);
      return next;
    });
  };

  if (selectedSkill) {
    const isAdded = userSkillIds.has(selectedSkill.id);
    const isFollowed = followedUsers.includes(selectedSkill.userId);

    return (
      <SubView
        title={selectedSkill.name}
        onBack={() => setSelectedSkill(null)}
        rightAction={
          <button
            onClick={() =>
              isAdded ? handleRemoveSkill(selectedSkill.id) : handleAddSkill(selectedSkill.id)
            }
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              isAdded
                ? "bg-neutral-200 text-neutral-600"
                : "bg-neutral-900 text-white"
            }`}
          >
            {isAdded ? "Added" : selectedSkill.ctaLabel}
          </button>
        }
      >
        <div className="flex flex-col h-full">
          {/* Cover */}
          <div className="aspect-[4/3] relative">
            <img
              src={selectedSkill.cover}
              alt={selectedSkill.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={selectedSkill.avatar}
                  alt={selectedSkill.author}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <div>
                  <p className="text-white text-sm font-semibold">{selectedSkill.author}</p>
                  <p className="text-white/70 text-xs">{selectedSkill.followers.toLocaleString()} followers</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-amber-300 text-sm">★</span>
                <span className="text-white text-sm font-semibold">{selectedSkill.rating}</span>
                <span className="text-white/60 text-xs">({selectedSkill.usedCount} uses)</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-sm text-neutral-600">{selectedSkill.tagline}</p>

            {/* Rules */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900">Style Rules</h3>
              <div className="space-y-1.5">
                {selectedSkill.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-neutral-700">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Moodboard */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900">Moodboard</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedSkill.moodboard.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900">Portfolio</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedSkill.portfolio.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                /* Start using skill */
              }}
              className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold"
            >
              {selectedSkill.startLabel}
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
        <h1 className="text-xl font-bold text-neutral-900">Skills</h1>
        <p className="text-sm text-neutral-500 mt-1">Discover style skills from top creators</p>
      </div>

      {/* Skills Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-neutral-100"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={skill.cover}
                    alt={skill.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {userSkillIds.has(skill.id) && (
                    <div className="absolute top-2 right-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6c5ce7]">
                      Added
                    </div>
                  )}
                  {skill.pricingLabel && !userSkillIds.has(skill.id) && (
                    <div className="absolute bottom-2 left-2 rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-800">
                      {skill.pricingLabel}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    <span className="text-amber-300">★</span>
                    <span>{skill.rating}</span>
                  </div>
                </div>
                <div className="px-3 py-2 text-left">
                  <h3 className="truncate text-[13px] font-semibold text-neutral-900">{skill.name}</h3>
                  <p className="text-[11px] text-neutral-500">{skill.author}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
