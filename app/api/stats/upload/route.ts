import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SupabaseAdminService } from './services/supabase-admin.service';
import { SessionService } from './services/session.service';
import { PlayerTrackerService } from './services/player-tracker.service';
import { LogImportService } from './services/log-import.service';

export async function POST(request: Request) {
  try {
    const supabaseAdmin = new SupabaseAdminService().getClient();

    const cookieStore = await cookies();
    const {
      data: { session },
      error: authError,
    } = await supabaseAdmin.auth.getSession();
    void cookieStore;
    void session;
    void authError;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = (formData.get('description') as string) || `Log caricato il ${new Date().toLocaleDateString()}`;
    const sessionDateInput = formData.get('session_date') as string;
    const sessionDate = sessionDateInput || new Date().toISOString().split('T')[0];

    if (!file) {
      return NextResponse.json({ error: 'Nessun file caricato' }, { status: 400 });
    }

    const { id: sessionId } = await new SessionService(supabaseAdmin).create(sessionDate, description);

    const text = await file.text();
    const tracker = new PlayerTrackerService();
    const importer = new LogImportService(tracker);
    importer.collectNames(text);

    const names = tracker.toArray();

    if (names.length > 0) {
      const { error: playersError } = await supabaseAdmin
        .from('players')
        .upsert(names, { onConflict: 'player_name' });
      if (playersError) throw new Error(`Errore upsert giocatori: ${playersError.message}`);
    }

    let idByName = new Map<string, string>();
    if (tracker.names().length > 0) {
      const { data: playersWithIds, error: fetchError } = await supabaseAdmin
        .from('players')
        .select('id, player_name')
        .in('player_name', tracker.names());

      if (fetchError) throw new Error(`Errore fetch id giocatori: ${fetchError.message}`);
      idByName = new Map<string, string>((playersWithIds ?? []).map((p) => [p.player_name, p.id]));
    }

    const events = importer.buildEvents(text, sessionId, idByName);

    if (events.length > 0) {
      const { error: eventsError } = await supabaseAdmin.from('matches_events').insert(events);
      if (eventsError) throw new Error(`Errore inserimento eventi: ${eventsError.message}`);
    }

    return NextResponse.json({
      success: true,
      inserted_records: events.length,
      message: `Sessione creata con ID ${sessionId}. Rilevati ${tracker.size} giocatori e salvati ${events.length} eventi di gioco.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
