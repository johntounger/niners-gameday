import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const OPPONENT_FULL_NAME: Record<string, string> = {
  mia: 'Miami Dolphins',
  ari: 'Arizona Cardinals',
  den: 'Denver Broncos',
  wsh: 'Washington Commanders',
  lv: 'Las Vegas Raiders',
  sea: 'Seattle Seahawks',
  lar: 'Los Angeles Rams',
  phi: 'Philadelphia Eagles',
};

const SF = 'San Francisco 49ers';

interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsApiMarket {
  key: string;
  outcomes: OddsApiOutcome[];
}

interface OddsApiBookmaker {
  key: string;
  title: string;
  markets: OddsApiMarket[];
}

interface OddsApiGame {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function extractLines(game: OddsApiGame): { spread: number | null; total: number | null } {
  const spreads: number[] = [];
  const totals: number[] = [];

  for (const book of game.bookmakers) {
    for (const market of book.markets) {
      if (market.key === 'spreads') {
        const sfOutcome = market.outcomes.find((o) => o.name === SF);
        if (sfOutcome?.point !== undefined) spreads.push(sfOutcome.point);
      } else if (market.key === 'totals') {
        const totalPoint = market.outcomes[0]?.point;
        if (totalPoint !== undefined) totals.push(totalPoint);
      }
    }
  }

  return { spread: median(spreads), total: median(totals) };
}

export async function GET() {
  const apiKey = process.env.THE_ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing THE_ODDS_API_KEY env var' },
      { status: 500 }
    );
  }

  const url =
    `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds` +
    `?apiKey=${apiKey}` +
    `&regions=us` +
    `&markets=spreads,totals` +
    `&oddsFormat=american`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json(
      { error: 'Odds API request failed', status: res.status, body },
      { status: 502 }
    );
  }

  const apiGames = (await res.json()) as OddsApiGame[];

  const supa = getSupabase();
  const { data: ourGames, error: gamesErr } = await supa
    .from('games')
    .select('id, opponent_abbr, kickoff_at');

  if (gamesErr) {
    return NextResponse.json({ error: gamesErr.message }, { status: 500 });
  }

  const updates: Array<{
    id: string;
    opponent_abbr: string;
    spread: number | null;
    over_under: number | null;
  }> = [];

  for (const game of ourGames ?? []) {
    const opponentFullName = OPPONENT_FULL_NAME[game.opponent_abbr];
    if (!opponentFullName) continue;

    const ourDate = game.kickoff_at.slice(0, 10);
    const match = apiGames.find((apiGame) => {
      if (apiGame.home_team !== SF) return false;
      if (apiGame.away_team !== opponentFullName) return false;
      return apiGame.commence_time.slice(0, 10) === ourDate;
    });
    if (!match) continue;

    const { spread, total } = extractLines(match);
    if (spread === null && total === null) continue;

    updates.push({
      id: game.id,
      opponent_abbr: game.opponent_abbr,
      spread,
      over_under: total,
    });
  }

  const now = new Date().toISOString();
  const results: Array<{ opponent: string; ok: boolean }> = [];
  for (const u of updates) {
    const { error: updateErr } = await supa
      .from('games')
      .update({
        spread: u.spread,
        over_under: u.over_under,
        odds_updated_at: now,
        updated_at: now,
      })
      .eq('id', u.id);
    results.push({ opponent: u.opponent_abbr, ok: !updateErr });
  }

  return NextResponse.json({
    fetched: apiGames.length,
    matched: updates.length,
    updated: results.filter((r) => r.ok).length,
    results,
    timestamp: now,
  });
}
