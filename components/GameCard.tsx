import Link from 'next/link';
import { Game } from '@/lib/types';
import { TEAMS, logoUrl } from '@/lib/teams';
import { formatGameDate, PLAN_EMOJI, PLAN_PILL_LABEL } from '@/lib/format';

interface Props {
  game: Game;
  guestCount: number;
  itemCount: number;
  isNextUp?: boolean;
  isPast?: boolean;
}

export default function GameCard({ game, guestCount, itemCount, isNextUp, isPast }: Props) {
  const date = formatGameDate(game.kickoff_at);
  const team = TEAMS[game.opponent_abbr];

  const cardClasses = [
    'game-card relative flex gap-3 cursor-pointer rounded-card bg-white p-3.5 mb-2.5 shadow-card border transition-transform active:scale-[0.98]',
    isNextUp ? 'game-card-next border-red' : 'border-transparent',
    isPast ? 'opacity-[0.55]' : '',
  ].join(' ');

  const cardStyle = isNextUp
    ? { boxShadow: '0 0 0 3px rgba(179,25,43,0.08), 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }
    : undefined;

  return (
    <Link href={`/game/${game.id}`} className={cardClasses} style={cardStyle}>
      {/* Date column */}
      <div className="w-[52px] flex-shrink-0 text-center pt-1">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-gold">
          {date.month}
        </div>
        <div className="display text-[30px] leading-none my-0.5">{date.day}</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]">
          {date.dow}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {isNextUp && !isPast && (
          <div className="inline-block bg-red text-white display text-[12px] py-0.5 px-2 rounded mb-1.5 tracking-[0.1em]">
            NEXT UP
          </div>
        )}
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)] mb-0.5">
          Week {game.week}
          {game.label ? ` · ${game.label}` : ''}
        </div>
        <div
          className={`display text-[22px] leading-none tracking-[0.02em] mb-1 ${
            isPast ? 'text-[var(--ink-2)]' : ''
          }`}
        >
          VS. {game.opponent.toUpperCase()}
        </div>
        <div className="text-[12px] text-[var(--ink-2)] mb-2 flex items-center gap-1.5">
          {date.time}
          {game.tv_network && (
            <span className="bg-[#F0F0F4] py-px px-1.5 rounded text-[10px] font-bold text-[var(--ink-2)] tracking-wide">
              {game.tv_network}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {!game.plan_type && (
            <span className="pill bg-[#F0F0F4] text-[var(--ink-2)] text-[11px] font-semibold py-[3px] px-2 rounded-full">
              No plan yet
            </span>
          )}
          {game.plan_type && (
            <span className="bg-[#FCEAEA] text-red text-[11px] font-semibold py-[3px] px-2 rounded-full inline-flex items-center gap-1">
              {PLAN_EMOJI[game.plan_type]} {PLAN_PILL_LABEL[game.plan_type]}
            </span>
          )}
          {guestCount > 0 && (
            <span className="bg-[#E6F4EA] text-green text-[11px] font-semibold py-[3px] px-2 rounded-full inline-flex items-center gap-1">
              👥 {guestCount} guest{guestCount === 1 ? '' : 's'}
            </span>
          )}
          {itemCount > 0 && (
            <span className="bg-[#E6F4EA] text-green text-[11px] font-semibold py-[3px] px-2 rounded-full inline-flex items-center gap-1">
              🍔 {itemCount} item{itemCount === 1 ? '' : 's'}
            </span>
          )}
          <span
            className={`text-[11px] font-semibold py-[3px] px-2 rounded-full inline-flex items-center gap-1 ${
              game.parking_bought
                ? 'bg-[#E6F4EA] text-green'
                : 'bg-[#FFF4E6] text-amber'
            }`}
          >
            🅿️ {game.parking_bought ? 'Parking ✓' : 'Not bought'}
          </span>
        </div>
      </div>

      {/* Opponent logo with halo */}
      <div
        className="opp-logo-badge self-center"
        style={{ '--team-rgb': team?.rgb ?? '0,0,0' } as React.CSSProperties}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl(game.opponent_abbr)} alt={game.opponent} />
      </div>
    </Link>
  );
}
