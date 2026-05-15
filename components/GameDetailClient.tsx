'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { Game, Guest, TailgateItem } from '@/lib/types';
import DetailHero from './DetailHero';
import PlanSection from './PlanSection';
import GuestSection from './GuestSection';
import TailgateSection from './TailgateSection';
import ParkingSection from './ParkingSection';
import MeetupSection from './MeetupSection';
import NotesSection from './NotesSection';

interface Props {
  initialGame: Game;
  initialGuests: Guest[];
  initialItems: TailgateItem[];
}

export default function GameDetailClient({ initialGame, initialGuests, initialItems }: Props) {
  const [game, setGame] = useState<Game>(initialGame);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [items, setItems] = useState<TailgateItem[]>(initialItems);

  useEffect(() => {
    const supa = getSupabase();
    const channel = supa
      .channel(`game-${game.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${game.id}` },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setGame(payload.new as Game);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests', filter: `game_id=eq.${game.id}` },
        (payload) => {
          setGuests((prev) => applyChange<Guest>(prev, payload, sortGuests));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tailgate_items',
          filter: `game_id=eq.${game.id}`,
        },
        (payload) => {
          setItems((prev) => applyChange<TailgateItem>(prev, payload, sortItems));
        }
      )
      .subscribe();

    return () => {
      supa.removeChannel(channel);
    };
  }, [game.id]);

  return (
    <div className="flex flex-col">
      <DetailHero
        game={game}
        topLeft={
          <Link
            href="/"
            className="flex items-center gap-1 bg-transparent border-none text-white text-[15px] font-semibold cursor-pointer p-0"
          >
            ‹ All Games
          </Link>
        }
      />

      <div className="px-3.5 pt-4 pb-10">
        <PlanSection game={game} onChange={setGame} />
        <GuestSection game={game} guests={guests} onChange={setGuests} />
        <TailgateSection game={game} guests={guests} items={items} onChange={setItems} />
        <ParkingSection game={game} onChange={setGame} />
        <MeetupSection game={game} onChange={setGame} />
        <NotesSection game={game} onChange={setGame} />
      </div>
    </div>
  );
}

type Row = { id: string };

function applyChange<T extends Row>(
  prev: T[],
  payload: { eventType: string; new: unknown; old: unknown },
  sort: (a: T, b: T) => number
): T[] {
  const newRow = payload.new as T | null;
  const oldRow = payload.old as T | null;
  if (payload.eventType === 'INSERT' && newRow?.id) {
    if (prev.some((r) => r.id === newRow.id)) return prev;
    return [...prev, newRow].sort(sort);
  }
  if (payload.eventType === 'UPDATE' && newRow?.id) {
    return prev.map((r) => (r.id === newRow.id ? newRow : r)).sort(sort);
  }
  if (payload.eventType === 'DELETE' && oldRow?.id) {
    return prev.filter((r) => r.id !== oldRow.id);
  }
  return prev;
}

function sortGuests(a: Guest, b: Guest): number {
  if (a.crew !== b.crew) return a.crew.localeCompare(b.crew);
  if (a.display_order !== b.display_order) return a.display_order - b.display_order;
  return a.created_at.localeCompare(b.created_at);
}

function sortItems(a: TailgateItem, b: TailgateItem): number {
  if (a.display_order !== b.display_order) return a.display_order - b.display_order;
  return a.created_at.localeCompare(b.created_at);
}
