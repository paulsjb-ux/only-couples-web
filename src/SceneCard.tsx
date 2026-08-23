import React from "react";

interface SceneCardProps {
  title: string;
  description: string;
  input1: string;   // URL of first cast photo
  input2: string;   // URL of second cast photo
  result: string;   // URL of the large result image
  onTryScene?: () => void;
}

export function SceneCard({
  title,
  description,
  input1,
  input2,
  result,
  onTryScene,
}: SceneCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full max-w-2xl">
      {/* Header row */}
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-xl font-serif text-gray-900">{title}</h2>
        <button
          onClick={onTryScene}
          className="bg-[#7a2e3a] hover:bg-[#6a2530] text-white text-sm font-medium px-5 py-2 rounded-full transition"
        >
          Try scene
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      {/* Single row: small cast images (left) + large result (right) */}
      <div className="flex gap-3 items-stretch">
        {/* Left half – two small input images */}
        <div className="flex gap-2 w-[38%]">
          <div className="relative flex-1 aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
            <img
              src={input1}
              alt="input"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">
              input
            </span>
          </div>

          <div className="relative flex-1 aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
            <img
              src={input2}
              alt="input"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">
              input
            </span>
          </div>
        </div>

        {/* Right half – large result image */}
        <div className="relative flex-1 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={result}
            alt="result"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">
            result
          </span>
        </div>
      </div>
    </div>
  );
}
