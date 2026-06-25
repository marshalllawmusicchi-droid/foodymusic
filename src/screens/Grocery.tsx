import React, { useMemo } from "react";
import { ShoppingCart, Check, ListChecks } from "lucide-react";
import { Page, Section, StatPill } from "../components/ui/common";
import { Badge } from "../components/ui/Logo";
import { useApp } from "../context/AppContext";

// Default seed list with quantities, prices, aisles
const seedItems = [
  { name: "Arborio rice", qty: "1 lb", price: 3.49, aisle: "Pantry" },
  { name: "Cremini mushrooms", qty: "12 oz", price: 2.99, aisle: "Produce" },
  { name: "Yellow onion", qty: "2", price: 1.2, aisle: "Produce" },
  { name: "Garlic", qty: "1 head", price: 0.79, aisle: "Produce" },
  { name: "Parmesan", qty: "4 oz", price: 6.49, aisle: "Dairy" },
  { name: "Butter", qty: "1 stick", price: 1.99, aisle: "Dairy" },
  { name: "Chicken thighs", qty: "1.5 lb", price: 7.49, aisle: "Meat & Seafood" },
  { name: "Vegetable stock", qty: "4 cups", price: 2.49, aisle: "Canned Goods" },
  { name: "Olive oil", qty: "1 bottle", price: 8.99, aisle: "Pantry" },
  { name: "Fresh thyme", qty: "1 bunch", price: 1.99, aisle: "Produce" },
  { name: "Lemon", qty: "2", price: 0.98, aisle: "Produce" },
];

export const Grocery: React.FC = () => {
  const { grocery, toggleGrocery, navigate } = useApp();

  // Merge seed items with any concierge-added items
  const items = useMemo(() => {
    const merged = [...seedItems];
    Object.keys(grocery).forEach((name) => {
      if (!merged.find((i) => i.name === name)) merged.push({ name, qty: "1", price: 2.5, aisle: "Other" });
    });
    return merged;
  }, [grocery]);

  const byAisle = useMemo(() => {
    const m: Record<string, typeof items> = {};
    items.forEach((i) => { (m[i.aisle] = m[i.aisle] || []).push(i); });
    return m;
  }, [items]);

  const total = items.reduce((s, i) => s + i.price, 0);
  const checked = items.filter((i) => grocery[i.name]).length;
  const savings = +(total * 0.18).toFixed(2);

  return (
    <Page>
      <Section title="Grocery List" sub="Group by aisle, check items off, and track your running total">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatPill label="Estimated Total" value={"$" + total.toFixed(2)} accent="text-white" />
          <StatPill label="Estimated Savings" value={"$" + savings.toFixed(2)} accent="text-emerald-400" />
          <StatPill label="Items" value={`${checked}/${items.length}`} accent="text-amber-400" />
        </div>

        <div className="space-y-5">
          {Object.entries(byAisle).map(([aisle, list]) => (
            <div key={aisle} className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
              <div className="px-4 py-2.5 bg-white/[0.03] flex items-center gap-2"><ListChecks size={15} className="text-amber-400" /><span className="font-semibold text-white text-sm">{aisle}</span></div>
              <div className="divide-y divide-white/5">
                {list.map((i) => {
                  const done = grocery[i.name];
                  return (
                    <button key={i.name} onClick={() => toggleGrocery(i.name)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${done ? "bg-emerald-500 border-emerald-500" : "border-white/20"}`}>{done && <Check size={13} className="text-black" />}</span>
                        <span className={`text-sm ${done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>{i.name}</span>
                        <span className="text-xs text-zinc-500">{i.qty}</span>
                      </div>
                      <span className="text-sm text-zinc-400">${i.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400"><ShoppingCart size={17} /> Add to Cart</button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20"><Badge kind="Affiliate" /> Order via FreshMart</button>
          <button onClick={() => navigate("deals")} className="px-5 py-3 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold hover:bg-emerald-500/25">Find more coupons</button>
        </div>
      </Section>
    </Page>
  );
};
