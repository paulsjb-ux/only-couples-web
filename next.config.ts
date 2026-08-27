import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

type OutfitCategory = "soft" | "playful" | "after-dark";

type OutfitManifestItem = {
  id: string;
  name: string;
  category: OutfitCategory;
  src: string;
};

function normaliseCategory(parts: string[]): OutfitCategory | null {
  const joined = parts.join("/").toLowerCase().replace(/[ _]+/g, "-");
  if (joined.includes("after-dark") || joined.includes("afterdark")) return "after-dark";
  if (joined.includes("playful")) return "playful";
  if (joined.includes("soft")) return "soft";
  return null;
}

function prettyName(filename: string) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function buildOutfitManifest() {
  const root = path.join(process.cwd(), "public", "outfits");
  const output = path.join(root, "manifest.json");
  if (!fs.existsSync(root)) return;

  const images: OutfitManifestItem[] = [];
  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "manifest.json") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!allowed.has(path.extname(entry.name).toLowerCase())) continue;

      const rel = path.relative(root, full);
      const relParts = rel.split(path.sep);
      const category = normaliseCategory(relParts.slice(0, -1));
      if (!category) continue;

      const publicPath = `/outfits/${relParts.map(encodeURIComponent).join("/")}`;
      const id = rel
        .replace(/\\/g, "/")
        .toLowerCase()
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      images.push({ id, name: prettyName(entry.name), category, src: publicPath });
    }
  }

  walk(root);
  const order: Record<OutfitCategory, number> = { soft: 0, playful: 1, "after-dark": 2 };
  images.sort((a, b) => order[a.category] - order[b.category] || a.name.localeCompare(b.name));
  fs.writeFileSync(output, JSON.stringify(images, null, 2) + "\n");
  console.log(`[The Other Room] Outfit manifest: ${images.length} images`);
}

buildOutfitManifest();

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
