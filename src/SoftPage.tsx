import React, { useState } from "react";
import { SceneCard } from "./SceneCard";

// Placeholder images
const PLACEHOLDER_WOMAN =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop";
const PLACEHOLDER_MAN =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop";
const PLACEHOLDER_RESULT =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";

const SOFT_SCENES = [
  {
    id: "1",
    title: "Soft Eye Contact",
    description: "Quiet gaze, soft light, unhurried",
    intensity: "soft",
  },
  {
    id: "2",
    title: "Morning Warmth",
    description: "Bed, soft light, gentle touch",
    intensity: "soft",
  },
  {
    id: "3",
    title: "Playful Tease",
    description: "Light smiles, playful energy",
    intensity: "playful",
  },
];

const INTENSE_SCENES = [
  {
    id: "4",
    title: "Intense Desire",
    description: "Strong eye contact, rising heat",
    intensity: "intense",
  },
];

export function SoftPage() {
  const [showIntense, setShowIntense] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeTag, setActiveTag] = useState<"soft" | "playful" | "all">("soft");

  const scenes = showAll
    ? [...SOFT_SCENES, ...INTENSE_SCENES]
    : showIntense
    ? [...SOFT_SCENES, ...INTENSE_SCENES]
    : SOFT_SCENES.filter((s) =>
        activeTag === "all" ? true : s.intensity === activeTag
      );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Title + description */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">Soft</h1>
        <p className="text-gray-500 text-[15px] leading-relaxed">
          Quiet intimacy — eye contact, warmth, unhurried desire.
        </p>
      </div>

      {/* Filters – properly spaced toggles */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-5">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showIntense}
            onChange={(e) => setShowIntense(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#7a2e3a] focus:ring-[#7a2e3a]"
          />
          <span className="text-sm text-gray-700">Show intense scenes</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#7a2e3a] focus:ring-[#7a2e3a]"
          />
          <span className="text-sm text-gray-700">Show all templates</span>
        </label>
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["soft", "playful", "all"] as const).map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              activeTag === tag
                ? "bg-[#7a2e3a] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {/* Launch set card – clearer hierarchy */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Launch set
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              A short shelf first. One scene at a time. Tick{" "}
              <span className="font-medium text-gray-700">Show all templates</span>{" "}
              only if you want the old full list.
            </p>
          </div>
          <button className="shrink-0 bg-[#7a2e3a] hover:bg-[#6a2530] text-white text-sm font-medium px-5 py-2.5 rounded-full transition">
            Start
          </button>
        </div>
      </div>

      {/* Scene list */}
      <div className="space-y-5">
        {scenes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No scenes match the current filters.
          </div>
        ) : (
          scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              title={scene.title}
              description={scene.description}
              input1={PLACEHOLDER_WOMAN}
              input2={PLACEHOLDER_MAN}
              result={PLACEHOLDER_RESULT}
              onTryScene={() => alert(`Try: ${scene.title}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
