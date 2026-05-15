'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Category, Game, TailgateItem } from '@/lib/types';
import { Section } from './PlanSection';

interface Props {
  game: Game;
  items: TailgateItem[];
  onChange: (updater: TailgateItem[] | ((prev: TailgateItem[]) => TailgateItem[])) => void;
}

const CATEGORY_ICON: Record<Category, { emoji: string; bg: string }> = {
  mains:    { emoji: '🥩', bg: '#FEE7E7' },
  sides:    { emoji: '🥗', bg: '#E7F4E7' },
  drinks:   { emoji: '🍺', bg: '#E7EFFE' },
  desserts: { emoji: '🍰', bg: '#FBE7F4' },
  supplies: { emoji: '🪑', bg: '#F4F0E7' },
};

const CATEGORIES: Category[] = ['mains', 'sides', 'drinks', 'desserts', 'supplies'];

export default function TailgateSection({ game, items, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [category, setCategory] = useState<Category>('mains');
  const [busy, setBusy] = useState(false);

  async function save() {
    const clean = name.trim();
    if (!clean) {
      setAdding(false);
      return;
    }
    setBusy(true);
    const { data, error } = await getSupabase()
      .from('tailgate_items')
      .insert({
        game_id: game.id,
        item_name: clean,
        assignee: assignee.trim() || null,
        category,
        display_order: items.length,
      })
      .select()
      .single();
    setBusy(false);
    if (error) {
      console.error(error);
      return;
    }
    onChange((prev) => [...prev, data as TailgateItem]);
    setName('');
    setAssignee('');
    setCategory('mains');
    setAdding(false);
  }

  async function remove(id: string) {
    onChange((prev) => prev.filter((it) => it.id !== id));
    const { error } = await getSupabase().from('tailgate_items').delete().eq('id', id);
    if (error) console.error(error);
  }

  return (
    <Section
      title="TAILGATE MENU"
      icon="🍔"
      rightSlot={
        <span className="text-[12px] text-[var(--ink-2)] font-semibold">
          {items.length} item{items.length === 1 ? '' : 's'}
        </span>
      }
    >
      <div>
        {items.length === 0 && !adding && (
          <div className="py-3 text-center text-[13px] text-[var(--ink-3)]">
            Nothing on the menu yet.
          </div>
        )}

        {items.map((it) => {
          const meta = CATEGORY_ICON[it.category];
          return (
            <div
              key={it.id}
              className="flex items-center gap-2.5 py-2.5 border-b border-[var(--line)] last:border-b-0"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0"
                style={{ background: meta.bg }}
              >
                {meta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold">{it.item_name}</div>
                <div className="text-[12px] text-[var(--ink-2)] mt-0.5 flex items-center gap-1.5">
                  {it.assignee || 'Unassigned'}
                  <span className="text-[9px] font-bold text-[var(--ink-3)] uppercase tracking-wide">
                    · {it.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(it.id)}
                className="bg-transparent border-none text-[var(--ink-3)] w-7 h-7 rounded-md cursor-pointer text-[14px] flex items-center justify-center hover:bg-[#FCEAEA] hover:text-red"
                title="Remove"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="flex flex-wrap gap-1.5 pt-2 items-center">
          <input
            type="text"
            value={name}
            autoFocus
            placeholder="What?"
            onChange={(e) => setName(e.target.value)}
            className="flex-[1_1_60%] border border-[var(--line)] bg-white rounded-lg py-2 px-3 text-[14px] outline-none focus:border-red"
          />
          <input
            type="text"
            value={assignee}
            placeholder="Who?"
            onChange={(e) => setAssignee(e.target.value)}
            className="flex-[1_1_30%] border border-[var(--line)] bg-white rounded-lg py-2 px-3 text-[14px] outline-none focus:border-red"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full border border-[var(--line)] bg-white rounded-lg py-2 px-3 text-[14px] outline-none focus:border-red"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <div className="flex gap-1.5 w-full mt-1.5">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="flex-1 bg-red text-white border-none py-2 rounded-lg text-[13px] font-bold cursor-pointer disabled:opacity-60"
            >
              {busy ? 'Adding…' : 'Add item'}
            </button>
            <button
              type="button"
              onClick={() => {
                setName('');
                setAssignee('');
                setCategory('mains');
                setAdding(false);
              }}
              className="bg-transparent border-none text-[var(--ink-3)] p-2 cursor-pointer text-[13px]"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full mt-2 py-2.5 px-3 border border-dashed border-[var(--ink-3)] text-[var(--ink-2)] rounded-[10px] cursor-pointer text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:border-red hover:text-red bg-transparent"
        >
          ＋ Add tailgate item
        </button>
      )}
    </Section>
  );
}
