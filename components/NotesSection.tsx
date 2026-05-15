'use client';

import { useEffect, useRef, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Game } from '@/lib/types';
import { Section } from './PlanSection';

interface Props {
  game: Game;
  onChange: (next: Game) => void;
}

export default function NotesSection({ game, onChange }: Props) {
  const [value, setValue] = useState(game.notes ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const savedSnapshot = useRef(game.notes ?? '');

  // Sync external changes (realtime) in if we're not actively editing.
  useEffect(() => {
    if (game.notes !== savedSnapshot.current) {
      savedSnapshot.current = game.notes ?? '';
      setValue(game.notes ?? '');
    }
  }, [game.notes]);

  async function commit() {
    if (value === savedSnapshot.current) return;
    setStatus('saving');
    const { error } = await getSupabase()
      .from('games')
      .update({ notes: value, updated_at: new Date().toISOString() })
      .eq('id', game.id);
    if (error) {
      console.error(error);
      setStatus('idle');
      return;
    }
    savedSnapshot.current = value;
    onChange({ ...game, notes: value });
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 1200);
  }

  return (
    <Section title="NOTES" icon="📝">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        placeholder="Meeting spot, driver, reminders..."
        className="w-full border border-[var(--line)] bg-[#F8F8FA] rounded-[10px] py-3 px-3.5 text-[14px] text-[var(--ink)] outline-none resize-y min-h-[60px] focus:border-red focus:bg-white"
        style={{ fontFamily: 'inherit' }}
      />
      <div className="text-[11px] text-[var(--ink-3)] mt-1.5 text-right">
        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Auto-saves on tap-away'}
      </div>
    </Section>
  );
}
