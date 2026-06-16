import { CATEGORY_STYLES } from "../_lib/meta";

export function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_STYLES[category] ?? "bg-white/5 text-white/40 border-white/10";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {category}
    </span>
  );
}
