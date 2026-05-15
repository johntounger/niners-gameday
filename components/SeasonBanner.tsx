import { NINERS_LOGO } from '@/lib/teams';

export default function SeasonBanner({ gameCount }: { gameCount: number }) {
  return (
    <div className="season-banner relative overflow-hidden rounded-card text-white text-center px-5 py-6 min-h-[180px] flex flex-col items-center justify-center mb-[18px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={NINERS_LOGO}
        alt="49ers"
        className="w-16 h-16 object-contain relative z-[1] mb-3"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
      />
      <h2
        className="display text-[30px] tracking-[0.06em] leading-none m-0 relative z-[1]"
        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
      >
        SECTION 129 · ROW 4
      </h2>
      <p className="mt-2 mb-0 text-[12px] opacity-85 relative z-[1] font-semibold tracking-[0.14em] uppercase">
        {gameCount} home games · 2026 season
      </p>
    </div>
  );
}
