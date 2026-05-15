import { notFound } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { Game, Guest, TailgateItem } from '@/lib/types';
import GameDetailClient from '@/components/GameDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function GameDetailPage({ params }: PageProps) {
  const supa = getSupabase();
  const id = params.id;

  const [{ data: game }, { data: guests }, { data: items }] = await Promise.all([
    supa.from('games').select('*').eq('id', id).single(),
    supa
      .from('guests')
      .select('*')
      .eq('game_id', id)
      .order('crew', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supa
      .from('tailgate_items')
      .select('*')
      .eq('game_id', id)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ]);

  if (!game) notFound();

  return (
    <GameDetailClient
      initialGame={game as Game}
      initialGuests={(guests ?? []) as Guest[]}
      initialItems={(items ?? []) as TailgateItem[]}
    />
  );
}
