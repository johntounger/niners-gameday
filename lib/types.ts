export type PlanType = 'joint_tailgate' | 'redzone_rally' | 'separate_parties';
export type Crew = 'tounger' | 'mendi';
export type Category = 'mains' | 'sides' | 'drinks' | 'desserts' | 'supplies';

export interface Game {
  id: string;
  week: number;
  opponent: string;
  opponent_abbr: string;
  kickoff_at: string;
  tv_network: string | null;
  label: string | null;
  plan_type: PlanType | null;
  parking_bought: boolean;
  notes: string;
  meet_location: string | null;
  driver: string | null;
  meet_time: string | null;
  spread: number | null;
  over_under: number | null;
  odds_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  game_id: string;
  crew: Crew;
  name: string;
  is_host: boolean;
  display_order: number;
  created_at: string;
}

export interface TailgateItem {
  id: string;
  game_id: string;
  item_name: string;
  assignee: string | null;
  category: Category;
  display_order: number;
  created_at: string;
}
