// One-off smoke for Phase 3. Run: node --experimental-strip-types scripts/smoke-data.mts
// Uses relative imports because Node doesn't resolve the @/ tsconfig path alias.
import { getTemplates, parseCategory, parseSearch, parseSort } from "../src/lib/data.ts";
import { isLaunchable, isExternalHttpUrl } from "../src/lib/url.ts";

async function show(label: string, q: Parameters<typeof getTemplates>[0]) {
  const r = await getTemplates(q);
  console.log(label.padEnd(48), "->", String(r.length).padStart(2), "items   ", r.map((t) => t.slug).join(", "));
}

await show("all (default newest)", {});
await show("sort=alpha", { sort: "alpha" });
await show("category=marketing", { category: "marketing" });
await show("search=pitch", { search: "pitch" });
await show("search=growth, category=marketing", { search: "growth", category: "marketing" });
await show("search=zzz (empty state)", { search: "zzz" });
await show("search=playbook (matches tags)", { search: "playbook" });

console.log();
console.log("parseCategory('marketing') =>", parseCategory("marketing"));
console.log("parseCategory('junk')      =>", parseCategory("junk"));
console.log("parseCategory(undefined)   =>", parseCategory(undefined));
console.log("parseSort('alpha')         =>", parseSort("alpha"));
console.log("parseSort('junk')          =>", parseSort("junk"));
console.log("parseSearch('  hello ')    =>", JSON.stringify(parseSearch("  hello ")));
console.log("parseSearch('')            =>", JSON.stringify(parseSearch("")));

console.log();
console.log("isExternalHttpUrl('https://x.com')  =>", isExternalHttpUrl("https://x.com"));
console.log("isExternalHttpUrl('javascript:1')  =>", isExternalHttpUrl("javascript:1"));
console.log("isExternalHttpUrl('/local')         =>", isExternalHttpUrl("/local"));

const okTpl = { slug: "a", launchUrl: "https://x.com" } as never;
const offTpl = { slug: "b", launchUrl: "https://x.com", disabled: true } as never;
const badTpl = { slug: "c", launchUrl: "oops" } as never;
console.log("isLaunchable(ok)        =>", isLaunchable(okTpl));
console.log("isLaunchable(disabled)  =>", isLaunchable(offTpl));
console.log("isLaunchable(badUrl)    =>", isLaunchable(badTpl));
