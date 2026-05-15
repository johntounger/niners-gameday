'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Game, Guest, Crew } from '@/lib/types';
import { initials } from '@/lib/format';
import { Section } from './PlanSection';

interface Props {
  game: Game;
  guests: Guest[];
  onChange: (updater: Guest[] | ((prev: Guest[]) => Guest[])) => void;
}

const CREW_META: Record<Crew, { label: string; cap: number }> = {
  tounger: { label: 'TOUNGER CREW', cap: 4 },
  mendi: { label: 'MENDI CREW', cap: 5 },
};

export default function GuestSection({ game, guests, onChange }: Props) {
  return (
    <Section title="GUESTS" icon="👥">
      <CrewGroup crew="tounger" game={game} guests={guests} onChange={onChange} />
      <CrewGroup crew="mendi" game={game} guests={guests} onChange={onChange} />
    </Section>
  );
}

function CrewGroup({
  crew,
  game,
  guests,
  onChange,
}: {
  crew: Crew;
  game: Game;
  guests: Guest[];
  onChange: Props['onChange'];
}) {
  const meta = CREW_META[crew];
  const list = guests.filter((g) => g.crew === crew);
  const hosts = list.filter((g) => g.is_host).length;
  const nonHosts = list.length - hosts;
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    const clean = name.trim();
    if (!clean) {
      setAdding(false);
      return;
    }
    setBusy(true);
    const { data, error } = await getSupabase()
      .from('guests')
      .insert({
        game_id: game.id,
        crew,
        name: clean,
        is_host: false,
        display_order: list.length,
      })
      .select()
      .single();
    setBusy(false);
    if (error) {
      console.error(error);
      return;
    }
    onChange((prev) => [...prev, data as Guest]);
    setName('');
    setAdding(false);
  }

  async function remove(id: string) {
    onChange((prev) => prev.filter((g) => g.id !== id));
    const { error } = await getSupabase().from('guests').delete().eq('id', id);
    if (error) console.error(error);
  }

  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-dashed border-[var(--line)]">
        <div className="display text-[15px] tracking-[0.05em]">{meta.label}</div>
        <span className="text-[12px] text-[var(--ink-2)] font-semibold">
          {list.length} of {meta.cap} · {hosts} host{hosts === 1 ? '' : 's'}
          {nonHosts ? ` + ${nonHosts} guest${nonHosts === 1 ? '' : 's'}` : ''}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {list.map((g) => (
          <div
            key={g.id}
            className="flex items-center gap-2.5 py-2 px-2.5 bg-[#F8F8FA] rounded-[8px] text-[14px]"
          >
            <Avatar name={g.name} crew={crew} isHost={g.is_host} />
            <span className="flex-1">{g.name}</span>
            {g.is_host && (
              <span className="bg-[var(--ink)] text-white text-[9px] font-bold py-px px-1.5 rounded uppercase tracking-wide">
                Host
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(g.id)}
              className="bg-transparent border-none text-[var(--ink-3)] w-7 h-7 rounded-md cursor-pointer text-[14px] flex items-center justify-center hover:bg-[#FCEAEA] hover:text-red"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-1.5 pt-1.5 items-center">
          <input
            type="text"
            value={name}
            placeholder="Guest name"
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') {
                setName('');
                setAdding(false);
              }
            }}
            className="flex-1 border border-[var(--line)] bg-white rounded-lg py-2 px-3 text-[14px] outline-none focus:border-red"
          />
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="bg-red text-white border-none py-2 px-3.5 rounded-lg text-[13px] font-bold cursor-pointer disabled:opacity-60"
          >
            {busy ? '…' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => {
              setName('');
              setAdding(false);
            }}
            className="bg-transparent border-none text-[var(--ink-3)] p-2 cursor-pointer text-[13px]"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full mt-2 py-2.5 px-3 border border-dashed border-[var(--ink-3)] text-[var(--ink-2)] rounded-[10px] cursor-pointer text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:border-red hover:text-red bg-transparent"
        >
          ＋ Add {crew === 'tounger' ? 'Tounger' : 'Mendi'} guest
        </button>
      )}
    </div>
  );
}

function Avatar({ name, crew, isHost }: { name: string; crew: Crew; isHost: boolean }) {
  const bg = isHost ? 'var(--ink)' : crew === 'mendi' ? 'var(--gold)' : 'var(--red)';
  return (
    <div
      className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ background: bg }}
    >
      {initials(name)}
    </div>
  );
}
