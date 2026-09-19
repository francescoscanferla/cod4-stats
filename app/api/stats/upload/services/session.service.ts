import type { SupabaseClient } from '@supabase/supabase-js';

export class SessionService {
  constructor(private supabaseAdmin: SupabaseClient) {}

  async create(sessionDate: string, description: string): Promise<{ id: string }> {
    const { data, error } = await this.supabaseAdmin
      .from('sessions')
      .insert([{ session_date: sessionDate, description }])
      .select()
      .single();

    if (error) throw new Error(`Errore creazione sessione: ${error.message}`);
    return data as { id: string };
  }
}
