import React, { useState } from "react";

interface LibraryCardProps {
  title: string;
  description?: string;
  resultUrl: string;          // main result image
  cast1Url?: string;          // optional small cast avatar
  cast2Url?: string;          // optional small cast avatar
  onDownload?: () => void;
  onDelete?: () => void;
}

export function LibraryCard({
  title,
  description,
  resultUrl,
  cast1Url,
  cast2Url,
  onDownload,
  onDelete,
}: LibraryCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
      {/* Result thumbnail */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {imgLoading && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
        )}

        {!imgError ? (
          <img
            src={resultUrl}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imgLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgError(true);
              setImgLoading(false);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
            <span className="text-3xl mb-2">📷</span>
            <span className="text-sm">Image unavailable</span>
            <button
              onClick={() => {
                setImgError(false);
                setImgLoading(true);
              }}
              className="mt-3 text-xs px-3 py-1 rounded-full bg-white border border-gray-300 hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {description}
            </p>
          )}
        </div>

        {/* Tiny cast avatars */}
        {(cast1Url || cast2Url) && (
          <div className="flex -space-x-2">
            {cast1Url && (
              <img
                src={cast1Url}
                alt="cast"
                className="w-7 h-7 rounded-full object-cover border-2 border-white"
              />
            )}
            {cast2Url && (
              <img
                src={cast2Url}
                alt="cast"
                className="w-7 h-7 rounded-full object-cover border-2 border-white"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={onDownload}
            className="flex-1 bg-[#7a2e3a] hover:bg-[#6a2530] text-white text-sm font-medium py-2.5 rounded-full transition"
          >
            Download
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="More options"
            >
              ⋯
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 bottom-12 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
