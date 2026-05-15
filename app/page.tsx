import { getSupabase } from '@/lib/supabase';
import { Game, Guest, TailgateItem } from '@/lib/types';
import { NINERS_LOGO } from '@/lib/teams';
import SeasonBanner from '@/components/SeasonBanner';
import GameCard from '@/components/GameCard';
import PastGames from '@/components/PastGames';

export const revalidate = 60; // light caching; realtime keeps detail pages fresh

interface GameWithCounts extends Game {
  guest_count: number;
  item_count: number;
}

async function loadGames(): Promise<GameWithCounts[]> {
  const supa = getSupabase();
  const { data: games, error: gamesErr } = await supa
    .from('games')
    .select('*')
    .order('kickoff_at', { ascending: true });
  if (gamesErr) throw gamesErr;
  const list = (games ?? []) as Game[];

  const ids = list.map((g) => g.id);
  let guests: Guest[] = [];
  let items: TailgateItem[] = [];
  if (ids.length > 0) {
    const [{ data: gData }, { data: iData }] = await Promise.all([
      supa.from('guests').select('id, game_id').in('game_id', ids),
      supa.from('tailgate_items').select('id, game_id').in('game_id', ids),
    ]);
    guests = (gData ?? []) as Guest[];
    items = (iData ?? []) as TailgateItem[];
  }

  const guestCount = new Map<string, number>();
  for (const g of guests) guestCount.set(g.game_id, (guestCount.get(g.game_id) ?? 0) + 1);
  const itemCount = new Map<string, number>();
  for (const i of items) itemCount.set(i.game_id, (itemCount.get(i.game_id) ?? 0) + 1);

  return list.map((g) => ({
    ...g,
    guest_count: guestCount.get(g.id) ?? 0,
    item_count: itemCount.get(g.id) ?? 0,
  }));
}

export default async function HomePage() {
  let games: GameWithCounts[] = [];
  let err: string | null = null;
  try {
    games = await loadGames();
  } catch (e) {
    err = (e as Error).message ?? 'Failed to load games';
  }

  const now = Date.now();
  const upcoming = games.filter((g) => new Date(g.kickoff_at).getTime() >= now);
  const past = games.filter((g) => new Date(g.kickoff_at).getTime() < now);
  const nextUpId = upcoming[0]?.id ?? null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-4 border-b border-[var(--line)]">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={NINERS_LOGO} alt="49ers" className="w-9 h-9 object-contain mr-2.5" />
          <div>
            <h1 className="display text-[26px] leading-none tracking-wider m-0">
              SEC 129 · ROW 4
            </h1>
            <div className="text-[11px] text-[var(--ink-2)] font-medium tracking-wide mt-1">
              Tounger + Mendiola · 2026 Niners
            </div>
          </div>
        </div>
      </div>

      <div className="px-3.5 pt-4 pb-6">
        <SeasonBanner gameCount={games.length} />

        {err && (
          <div className="rounded-card border border-[var(--line)] bg-white p-4 my-3 text-sm text-[var(--ink-2)]">
            Couldn&apos;t load games: {err}
            <div className="text-xs mt-1">
              Make sure your Supabase env vars are set and the schema + seed have been run.
            </div>
          </div>
        )}

        <SectionDivider title="UPCOMING" count={`${upcoming.length} GAMES`} />
        <div>
          {upcoming.length === 0 && !err && (
            <div className="text-center py-6 px-4 text-[13px] text-[var(--ink-3)] border border-dashed border-[var(--line)] rounded-card">
              No upcoming games. The season may be over.
            </div>
          )}
          {upcoming.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              guestCount={g.guest_count}
              itemCount={g.item_count}
              isNextUp={g.id === nextUpId}
            />
          ))}
        </div>

        <SectionDivider title="PAST GAMES" count={`${past.length} GAMES`} className="mt-5" />
        <PastGames
          games={past.map((g) => ({
            id: g.id,
            week: g.week,
            opponent: g.opponent,
            opponent_abbr: g.opponent_abbr,
            kickoff_at: g.kickoff_at,
            tv_network: g.tv_network,
            label: g.label,
            plan_type: g.plan_type,
            parking_bought: g.parking_bought,
            notes: g.notes,
            created_at: g.created_at,
            updated_at: g.updated_at,
            guest_count: g.guest_count,
            item_count: g.item_count,
          }))}
        />
      </div>
    </div>
  );
}

function SectionDivider({
  title,
  count,
  className = '',
}: {
  title: string;
  count: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mt-2 mx-1 mb-2.5 pt-1 ${className}`}>
      <h3 className="display text-[18px] tracking-wider m-0 text-[var(--ink)]">{title}</h3>
      <span className="text-[11px] font-semibold tracking-wide text-[var(--ink-3)]">{count}</span>
    </div>
  );
}
