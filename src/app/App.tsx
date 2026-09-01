import { useState } from "react";
import { SceneCard } from "../SceneCard";
import { LibraryCard } from "../LibraryCard";
import { SoftPage } from "../SoftPage";

// Placeholder images – replace with your real cast / result URLs
const PLACEHOLDER_WOMAN =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop";
const PLACEHOLDER_MAN =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop";
const PLACEHOLDER_RESULT =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";

type Tab = "soft" | "templates" | "library";

export default function App() {
  const [tab, setTab] = useState<Tab>("soft");

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Simple header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-[#7a2e3a] flex items-center justify-center text-white text-lg">
          ≡
        </div>
        <h1 className="text-lg font-medium text-gray-800">The Other Room</h1>
        <div className="w-10" />
      </header>

      {/* Tabs */}
      <div className="flex gap-6 px-6 pt-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setTab("soft")}
          className={`pb-3 text-sm font-medium transition whitespace-nowrap ${
            tab === "soft"
              ? "text-[#7a2e3a] border-b-2 border-[#7a2e3a]"
              : "text-gray-500"
          }`}
        >
          Soft
        </button>
        <button
          onClick={() => setTab("templates")}
          className={`pb-3 text-sm font-medium transition whitespace-nowrap ${
            tab === "templates"
              ? "text-[#7a2e3a] border-b-2 border-[#7a2e3a]"
              : "text-gray-500"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setTab("library")}
          className={`pb-3 text-sm font-medium transition whitespace-nowrap ${
            tab === "library"
              ? "text-[#7a2e3a] border-b-2 border-[#7a2e3a]"
              : "text-gray-500"
          }`}
        >
          Library
        </button>
      </div>

      <main className="p-6">
        {tab === "soft" && <SoftPage />}

        {tab === "templates" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-2xl font-serif text-gray-900">Templates</h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose a scene and try it with your cast.
              </p>
            </div>

            <SceneCard
              title="Anal Bathroom POV"
              description="Bathroom, anal POV"
              input1={PLACEHOLDER_WOMAN}
              input2={PLACEHOLDER_MAN}
              result={PLACEHOLDER_RESULT}
              onTryScene={() => alert("Try Anal Bathroom POV")}
            />

            <SceneCard
              title="Anal"
              description="Anal sex, junction visible"
              input1={PLACEHOLDER_WOMAN}
              input2={PLACEHOLDER_MAN}
              result={PLACEHOLDER_RESULT}
              onTryScene={() => alert("Try Anal")}
            />
          </div>
        )}

        {tab === "library" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-serif text-gray-900">Library</h2>
              <p className="text-sm text-gray-500 mt-1">
                Private album. Nothing is public. We don’t train on your photos.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <LibraryCard
                title="who-wore-it-best | Who wore it best (wife)"
                description="Who wore it best"
                resultUrl={PLACEHOLDER_RESULT}
                cast1Url={PLACEHOLDER_WOMAN}
                cast2Url={PLACEHOLDER_MAN}
                onDownload={() => alert("Downloading…")}
                onDelete={() => alert("Deleted")}
              />

              <LibraryCard
                title="romance-kiss | In bed (wife, husband)"
                description="Romance kiss in bed"
                resultUrl={PLACEHOLDER_RESULT}
                cast1Url={PLACEHOLDER_WOMAN}
                cast2Url={PLACEHOLDER_MAN}
                onDownload={() => alert("Downloading…")}
                onDelete={() => alert("Deleted")}
              />

              <LibraryCard
                title="Anal Bathroom POV"
                description="Bathroom scene"
                resultUrl={PLACEHOLDER_RESULT}
                cast1Url={PLACEHOLDER_WOMAN}
                cast2Url={PLACEHOLDER_MAN}
                onDownload={() => alert("Downloading…")}
                onDelete={() => alert("Deleted")}
              />

              <LibraryCard
                title="Anal"
                description="Junction visible"
                resultUrl={PLACEHOLDER_RESULT}
                cast1Url={PLACEHOLDER_WOMAN}
                cast2Url={PLACEHOLDER_MAN}
                onDownload={() => alert("Downloading…")}
                onDelete={() => alert("Deleted")}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
