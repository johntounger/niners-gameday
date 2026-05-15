'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Game, PlanType } from '@/lib/types';

interface Props {
  game: Game;
  onChange: (next: Game) => void;
}

const OPTIONS: { value: PlanType; emoji: string; name: string; desc: string }[] = [
  {
    value: 'joint_tailgate',
    emoji: '🍔',
    name: 'Joint Tailgate',
    desc: 'Tounger + Mendi together',
  },
  {
    value: 'redzone_rally',
    emoji: '🎉',
    name: 'RedZone Rally',
    desc: "Levi's pregame party — no tailgate",
  },
  {
    value: 'separate_parties',
    emoji: '⚡',
    name: 'Separate Parties',
    desc: 'Tounger & Mendi each do their own',
  },
];

export default function PlanSection({ game, onChange }: Props) {
  const [saving, setSaving] = useState<PlanType | null>(null);

  async function pick(value: PlanType) {
    if (saving || game.plan_type === value) return;
    const previous = game.plan_type;
    onChange({ ...game, plan_type: value });
    setSaving(value);
    const { error } = await getSupabase()
      .from('games')
      .update({ plan_type: value, updated_at: new Date().toISOString() })
      .eq('id', game.id);
    setSaving(null);
    if (error) {
      onChange({ ...game, plan_type: previous });
      console.error(error);
    }
  }

  return (
    <Section title="GAMEDAY PLAN" icon="📋">
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => {
          const selected = game.plan_type === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              className={`text-left rounded-[12px] py-3 px-3.5 flex items-center gap-3 transition-all border-2 ${
                selected ? 'border-red bg-[#FCEAEA]' : 'border-[var(--line)] bg-white'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 relative ${
                  selected ? 'border-red' : 'border-[var(--ink-3)]'
                }`}
              >
                {selected && (
                  <span className="absolute top-[3px] left-[3px] w-2.5 h-2.5 bg-red rounded-full block" />
                )}
              </span>
              <span className="text-[22px]">{opt.emoji}</span>
              <div>
                <div className="font-bold text-[14px]">{opt.name}</div>
                <div className="text-[12px] text-[var(--ink-2)] mt-0.5">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

export function Section({
  title,
  icon,
  rightSlot,
  children,
}: {
  title: string;
  icon: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-card p-4 mb-3 shadow-card">
      <div className="flex items-center justify-between mb-3.5">
        <div className="display text-[16px] tracking-[0.08em] text-[var(--ink)] flex items-center gap-2">
          <span className="text-[16px]">{icon}</span> {title}
        </div>
        {rightSlot}
      </div>
      {children}
    </div>
  );
}
