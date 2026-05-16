'use client';

import { useState } from 'react';
import { Game } from '@/lib/types';
import { Section } from './PlanSection';
import { formatSpread, formatTotal } from '@/lib/format';

interface Props {
  game: Game;
}

export default function BettingSection({ game }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/refresh-odds', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Refresh failed (HTTP ${res.status})`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }

  const hasLine = game.spread !== null || game.over_under !== null;
  const updatedAt = game.odds_updated_at ? new Date(game.odds_updated_at) : null;
  const updatedLabel = updatedAt
    ? `Updated ${relativeTime(updatedAt)}`
    : 'Not fetched yet';

  return (
    <Section
      title="BETTING LINE"
      icon="🎲"
      rightSlot={
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="text-[11px] font-bold text-red bg-transparent border-none cursor-pointer disabled:opacity-50"
        >
          {refreshing ? 'Refreshing…' : '↻ Refresh'}
        </button>
      }
    >
      {hasLine ? (
        <div className="flex items-center justify-around gap-4 py-1">
          <div className="text-center flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)] mb-1">
              Spread
            </div>
            <div className="display text-[26px] tracking-wider">
              {formatSpread(game.spread)}
            </div>
          </div>
          <div className="w-px h-12 bg-[var(--line)]" />
          <div className="text-center flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)] mb-1">
              Total
            </div>
            <div className="display text-[26px] tracking-wider">
              {formatTotal(game.over_under)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-3 text-[13px] text-[var(--ink-3)]">
          No line yet. Tap Refresh to fetch the latest.
        </div>
      )}

      <div className="text-[10px] text-[var(--ink-3)] mt-3 text-center">
        {updatedLabel} · consensus of US sportsbooks
      </div>

      {error && (
        <div className="text-[11px] text-red mt-2 text-center bg-[#FCEAEA] py-1.5 px-2 rounded-md">
          {error}
        </div>
      )}
    </Section>
  );
}

function relativeTime(d: Date): string {
  const ms = Date.now() - d.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
