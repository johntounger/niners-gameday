import { Game, Guest, TailgateItem, PlanType } from './types';

const PT_TIMEZONE = 'America/Los_Angeles';

const partsCache = new Map<string, Intl.DateTimeFormat>();
function fmt(opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(opts);
  let f = partsCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: PT_TIMEZONE, ...opts });
    partsCache.set(key, f);
  }
  return f;
}

export interface GameDateParts {
  month: string;
  day: string;
  dow: string;
  long: string;
  time: string;
  shortDate: string;
}

export function formatGameDate(iso: string): GameDateParts {
  const d = new Date(iso);
  const month = fmt({ month: 'short' }).format(d).toUpperCase();
  const day = fmt({ day: '2-digit' }).format(d);
  const dow = fmt({ weekday: 'short' }).format(d).toUpperCase();

  const dowLong = fmt({ weekday: 'short' }).format(d);
  const monthLong = fmt({ month: 'short' }).format(d);
  const dayLong = fmt({ day: 'numeric' }).format(d);
  const yearLong = fmt({ year: 'numeric' }).format(d);
  const long = `${dowLong}, ${monthLong} ${dayLong}, ${yearLong}`;

  const time = `${fmt({ hour: 'numeric', minute: '2-digit', hour12: true })
    .format(d)} PT`;

  const numericMonth = fmt({ month: 'numeric' }).format(d);
  const numericDay = fmt({ day: 'numeric' }).format(d);
  const shortDate = `${dowLong} ${numericMonth}/${numericDay}`;

  return { month, day, dow, long, time, shortDate };
}

export interface CountdownInfo {
  big: string;
  label: string;
  isGameday: boolean;
  isFinal: boolean;
  msUntil: number;
}

export function computeCountdown(kickoffIso: string, now = new Date()): CountdownInfo {
  const kickoff = new Date(kickoffIso).getTime();
  const ms = kickoff - now.getTime();

  if (ms < 0) {
    return { big: 'FINAL', label: '', isGameday: false, isFinal: true, msUntil: ms };
  }

  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);

  if (days > 30) {
    return { big: `${days} DAYS`, label: 'TO KICKOFF', isGameday: false, isFinal: false, msUntil: ms };
  }
  if (days >= 7) {
    return { big: `${days}d · ${hours}h`, label: 'TO KICKOFF', isGameday: false, isFinal: false, msUntil: ms };
  }
  if (days >= 1) {
    return { big: `${days}d ${hours}h ${mins}m`, label: 'TO KICKOFF', isGameday: false, isFinal: false, msUntil: ms };
  }
  return { big: `${hours}h ${mins}m`, label: 'UNTIL KICKOFF', isGameday: true, isFinal: false, msUntil: ms };
}

export const PLAN_LABEL: Record<PlanType, string> = {
  joint_tailgate: 'JOINT TAILGATE',
  redzone_rally: 'REDZONE RALLY',
  separate_parties: 'SEPARATE PARTIES',
};

export const PLAN_EMOJI: Record<PlanType, string> = {
  joint_tailgate: '🍔',
  redzone_rally: '🎉',
  separate_parties: '⚡',
};

export const PLAN_PILL_LABEL: Record<PlanType, string> = {
  joint_tailgate: 'Joint Tailgate',
  redzone_rally: 'RedZone Rally',
  separate_parties: 'Separate Parties',
};

export interface ShareTextInput {
  game: Game;
  guests: Guest[];
  items: TailgateItem[];
}

export function buildShareText({ game, guests, items }: ShareTextInput): string {
  const date = formatGameDate(game.kickoff_at);
  const opponent = game.opponent.toUpperCase();
  const lines: string[] = [];

  lines.push(`🏈 ${date.shortDate} · 49ERS vs ${opponent} · ${date.time}`);
  lines.push('');

  if (game.plan_type) {
    lines.push(`${PLAN_EMOJI[game.plan_type]} ${PLAN_LABEL[game.plan_type]}`);
    lines.push('');
  }

  const lineCompact = formatLineCompact(game.spread, game.over_under);
  if (lineCompact) {
    lines.push(`🎲 Line: ${lineCompact}`);
    lines.push('');
  }

  const meetupBits: string[] = [];
  if (game.meet_location) meetupBits.push(`Where: ${game.meet_location}`);
  if (game.driver) meetupBits.push(`Driver: ${game.driver}`);
  if (game.meet_time) meetupBits.push(`Meet at: ${game.meet_time}`);
  if (meetupBits.length > 0) {
    lines.push('🚗 Meetup');
    for (const bit of meetupBits) lines.push(`• ${bit}`);
    lines.push('');
  }

  if (items.length > 0) {
    lines.push('🍔 Menu');
    for (const it of items) {
      const who = it.assignee?.trim();
      lines.push(`• ${it.item_name}${who ? ` — ${who}` : ''}`);
    }
    lines.push('');
  }

  lines.push(`🅿️ Parking: ${game.parking_bought ? '✓ Bought' : '⚠️ Not yet'}`);
  lines.push(`👥 Crew: ${guests.length} confirmed`);

  if (game.notes && game.notes.trim()) {
    lines.push('');
    lines.push('📝 Notes');
    lines.push(game.notes.trim());
  }

  lines.push('');
  lines.push('Go Niners! 💛❤️');

  return lines.join('\n');
}

export function formatSpread(spread: number | null): string {
  if (spread === null || spread === undefined) return '—';
  if (spread === 0) return "PICK 'EM";
  const sign = spread > 0 ? '+' : '';
  return `SF ${sign}${spread}`;
}

export function formatTotal(total: number | null): string {
  if (total === null || total === undefined) return '—';
  return `O/U ${total}`;
}

export function formatLineCompact(
  spread: number | null,
  total: number | null
): string | null {
  if (spread === null && total === null) return null;
  const parts: string[] = [];
  if (spread !== null) {
    if (spread === 0) parts.push('PK');
    else parts.push(`${spread > 0 ? '+' : ''}${spread}`);
  }
  if (total !== null) parts.push(`O/U ${total}`);
  return parts.join(' · ');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}
