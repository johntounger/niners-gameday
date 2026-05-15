'use client';

import { useState } from 'react';
import GameCard from './GameCard';
import { Game } from '@/lib/types';

interface GameWithCounts extends Game {
  guest_count: number;
  item_count: number;
}

export default function PastGames({ games }: { games: GameWithCounts[] }) {
  const [open, setOpen] = useState(false);

  if (games.length === 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full mt-2 py-2.5 px-3.5 rounded-[10px] border border-[var(--line)] flex items-center justify-between text-[13px] text-[var(--ink-2)] font-semibold bg-transparent"
        >
          <span>Show past games</span>
          <span
            style={{
              transition: 'transform 0.2s',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ›
          </span>
        </button>
        {open && (
          <div className="mt-2.5 text-center py-6 px-4 text-[13px] text-[var(--ink-3)] border border-dashed border-[var(--line)] rounded-card">
            No completed games yet.
            <br />
            Past games will move here automatically.
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full mt-2 py-2.5 px-3.5 rounded-[10px] border border-[var(--line)] flex items-center justify-between text-[13px] text-[var(--ink-2)] font-semibold bg-transparent"
      >
        <span>{open ? 'Hide past games' : `Show ${games.length} past game${games.length === 1 ? '' : 's'}`}</span>
        <span
          style={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ›
        </span>
      </button>
      {open && (
        <div className="mt-2.5">
          {games.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              guestCount={g.guest_count}
              itemCount={g.item_count}
              isPast
            />
          ))}
        </div>
      )}
    </>
  );
}
