// Writes public/precache.json: every image under public/img, for the service worker to cache
// and for the app to pre-decode at startup (so transitions never wait on an image decode).
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = "public";
const out = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(webp|jpg|jpeg|png|svg)$/i.test(f)) out.push("/" + relative(root, p).split("\\").join("/"));
  }
};
walk(join(root, "img"));
writeFileSync(join(root, "precache.json"), JSON.stringify(out.sort()));
console.log(`precache.json: ${out.length} images`);
