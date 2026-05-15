'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Game } from '@/lib/types';
import { Section } from './PlanSection';

interface Props {
  game: Game;
  onChange: (next: Game) => void;
}

export default function ParkingSection({ game, onChange }: Props) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !game.parking_bought;
    onChange({ ...game, parking_bought: next });
    setBusy(true);
    const { error } = await getSupabase()
      .from('games')
      .update({ parking_bought: next, updated_at: new Date().toISOString() })
      .eq('id', game.id);
    setBusy(false);
    if (error) {
      onChange({ ...game, parking_bought: !next });
      console.error(error);
    }
  }

  return (
    <Section title="PARKING PASS" icon="🅿️">
      <div className="flex items-center justify-between py-0.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              game.parking_bought ? 'bg-green' : 'bg-amber'
            }`}
          />
          <div>
            <div className="font-bold text-[15px]">
              {game.parking_bought ? 'Bought' : 'Not bought yet'}
            </div>
            <div className="text-[12px] text-[var(--ink-2)] mt-0.5">
              {game.parking_bought
                ? 'Confirmed via Ticketmaster'
                : 'Toggle on once purchased'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label="Parking bought"
          aria-pressed={game.parking_bought}
          className={`toggle-switch ${game.parking_bought ? 'on' : ''}`}
        />
      </div>
    </Section>
  );
}
