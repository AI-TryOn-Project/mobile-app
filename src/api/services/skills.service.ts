/* ───────────────────────────────────────────
   Skills Service — mirrors /api/skills routes
   ─────────────────────────────────────────── */

import { mockDelay } from "@/api/client";
import type { Skill } from "@/api/types";
import { MOCK_SKILLS } from "@/api/mocks/skills.mock";

const userSkills = new Set<string>();

export async function getSkills(): Promise<Skill[]> {
  await mockDelay(300);
  return MOCK_SKILLS;
}

export async function getSkillById(skillId: string): Promise<Skill | null> {
  await mockDelay(200);
  return MOCK_SKILLS.find((s) => s.id === skillId) || null;
}

export async function getUserSkills(): Promise<Skill[]> {
  await mockDelay(300);
  return MOCK_SKILLS.filter((s) => userSkills.has(s.id));
}

export async function addSkill(skillId: string): Promise<void> {
  await mockDelay(400);
  userSkills.add(skillId);
}

export async function removeSkill(skillId: string): Promise<void> {
  await mockDelay(300);
  userSkills.delete(skillId);
}

export async function useSkill(skillId: string, prompt: string): Promise<{ result: string }> {
  await mockDelay(1000);
  const skill = MOCK_SKILLS.find((s) => s.id === skillId);
  return {
    result: `Using ${skill?.name || "skill"}: ${prompt}`,
  };
}
