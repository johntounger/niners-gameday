export interface TeamMeta {
  name: string;
  /** Primary brand color as an "r,g,b" string for use in CSS rgba(). */
  rgb: string;
}

export const TEAMS: Record<string, TeamMeta> = {
  mia: { name: 'Dolphins',   rgb: '0,142,151' },
  ari: { name: 'Cardinals',  rgb: '151,35,63' },
  den: { name: 'Broncos',    rgb: '251,79,20' },
  wsh: { name: 'Commanders', rgb: '90,20,20' },
  lv:  { name: 'Raiders',    rgb: '20,20,20' },
  sea: { name: 'Seahawks',   rgb: '0,34,68' },
  lar: { name: 'Rams',       rgb: '0,53,148' },
  phi: { name: 'Eagles',     rgb: '0,76,84' },
};

export function logoUrl(abbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
}

export const NINERS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png';
