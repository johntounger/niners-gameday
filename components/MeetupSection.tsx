'use client';

import { useEffect, useRef, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Game } from '@/lib/types';
import { Section } from './PlanSection';

interface Props {
  game: Game;
  onChange: (next: Game) => void;
}

type Field = 'meet_location' | 'driver' | 'meet_time';

export default function MeetupSection({ game, onChange }: Props) {
  return (
    <Section title="MEETUP" icon="🚗">
      <div className="flex flex-col gap-3">
        <AutoSaveField
          game={game}
          onChange={onChange}
          field="meet_location"
          label="Where"
          placeholder="Tounger's, Mendi's, Red Lot..."
        />
        <AutoSaveField
          game={game}
          onChange={onChange}
          field="driver"
          label="Who's driving"
          placeholder="John, Austin, Justin..."
        />
        <AutoSaveField
          game={game}
          onChange={onChange}
          field="meet_time"
          label="What time"
          placeholder="1pm, 12:30, kickoff -3hr..."
        />
      </div>
    </Section>
  );
}

function AutoSaveField({
  game,
  onChange,
  field,
  label,
  placeholder,
}: {
  game: Game;
  onChange: (next: Game) => void;
  field: Field;
  label: string;
  placeholder: string;
}) {
  const initial = (game[field] ?? '') as string;
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const lastSaved = useRef(initial);

  useEffect(() => {
    if (initial !== lastSaved.current && initial !== value) {
      setValue(initial);
      lastSaved.current = initial;
    }
  }, [initial]);

  useEffect(() => {
    if (value === lastSaved.current) return;
    const timer = setTimeout(async () => {
      setStatus('saving');
      const cleaned = value.trim() === '' ? null : value.trim();
      onChange({ ...game, [field]: cleaned } as Game);
      const { error } = await getSupabase()
        .from('games')
        .update({ [field]: cleaned, updated_at: new Date().toISOString() })
        .eq('id', game.id);
      if (!error) {
        lastSaved.current = value;
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1500);
      } else {
        setStatus('idle');
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--ink-3)]">
          {label}
        </label>
        {status === 'saving' && (
          <span className="text-[10px] text-[var(--ink-3)]">Saving…</span>
        )}
        {status === 'saved' && (
          <span className="text-[10px] text-green font-semibold">✓ Saved</span>
        )}
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-[var(--line)] bg-[#F8F8FA] rounded-[10px] px-3.5 py-3 text-[14px] outline-none focus:border-red focus:bg-white"
      />
    </div>
  );
}
