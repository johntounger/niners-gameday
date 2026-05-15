'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Game } from '@/lib/types';
import { logoUrl, NINERS_LOGO } from '@/lib/teams';
import { computeCountdown, formatGameDate, CountdownInfo } from '@/lib/format';
import WeatherStrip from './WeatherStrip';

interface Props {
  game: Game;
  topLeft?: ReactNode;
}

export default function DetailHero({ game, topLeft }: Props) {
  const [cd, setCd] = useState<CountdownInfo>(() => computeCountdown(game.kickoff_at));

  useEffect(() => {
    const tick = () => setCd(computeCountdown(game.kickoff_at));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [game.kickoff_at]);

  const date = formatGameDate(game.kickoff_at);
  const weekLabel = game.label
    ? `WEEK ${game.week} · ${game.label.toUpperCase()}`
    : `WEEK ${game.week}`;

  return (
    <div
      className={`detail-hero text-white px-5 pt-3.5 pb-0 overflow-hidden ${
        cd.isGameday ? 'gameday' : ''
      }`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        {topLeft ?? <span />}
        <span className="text-white opacity-60 text-sm">·</span>
      </div>

      {cd.isGameday && (
        <div className="text-center">
          <div className="gameday-label">🏈 GAMEDAY</div>
        </div>
      )}

      <div className="display text-[14px] tracking-[0.12em] opacity-90 text-center mb-0.5">
        {weekLabel}
      </div>

      {/* Matchup logos */}
      <div className="flex items-center justify-center gap-3.5 my-2 mb-3 relative z-[1]">
        <MatchupLogo src={NINERS_LOGO} alt="49ers" />
        <span
          className="display text-[22px] tracking-[0.1em] opacity-95"
          style={{ color: 'var(--gold-light)' }}
        >
          VS
        </span>
        <MatchupLogo src={logoUrl(game.opponent_abbr)} alt={game.opponent} />
      </div>

      <div className="display text-[30px] tracking-[0.02em] leading-none text-center mb-1.5">
        49ERS VS. {game.opponent.toUpperCase()}
      </div>
      <div className="text-[14px] opacity-95 text-center font-medium">
        {date.long} · {date.time}
        {game.tv_network ? ` · ${game.tv_network}` : ''}
      </div>

      <div
        className="rounded-[12px] mt-3.5 p-3.5 text-center relative z-[1]"
        style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}
      >
        <div className="display text-[36px] tracking-[0.02em] leading-none">{cd.big}</div>
        {cd.label && (
          <div className="text-[11px] uppercase tracking-[0.12em] opacity-85 mt-1 font-semibold">
            {cd.label}
          </div>
        )}
      </div>

      <WeatherStrip kickoffIso={game.kickoff_at} />
    </div>
  );
}

function MatchupLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="w-[76px] h-[76px] bg-white rounded-full p-2.5 flex items-center justify-center"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  );
}
