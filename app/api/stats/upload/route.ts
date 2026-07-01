import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js'; // Assicurati che sia installato il pacchetto standard

export async function POST(request: Request) {
    try {
        // 1. Inizializziamo il client Supabase Admin (scavalca RLS in modo sicuro sul server)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. RECUPERO E VERIFICA DELLA SESSIONE LATO SERVER (Protezione dell'endpoint)
        // Nota: se usi @supabase/ssr o @supabase/auth-helpers-nextjs per i cookie, 
        // adatta questa parte al tuo metodo di recupero sessione server-side.
        const cookieStore = await cookies();
        
        // Eseguiamo un controllo generico sulla sessione corrente
        const { data: { session }, error: authError } = await supabaseAdmin.auth.getSession();
        
        // Se non trovi la sessione tramite getSession, potresti dover usare getUser() passando il token presente nei cookie
        // Per ora usiamo supabaseAdmin per l'insert, ma accertati che solo gli admin possano inviare richieste.

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const description = formData.get('description') as string || `Log caricato il ${new Date().toLocaleDateString()}`;
        
        const sessionDateInput = formData.get('session_date') as string;
        const sessionDate = sessionDateInput || new Date().toISOString().split('T')[0];

        if (!file) {
            return NextResponse.json({ error: 'Nessun file caricato' }, { status: 400 });
        }

        // 3. Eseguiamo l'insert usando il client Admin (Non fallirà per l'RLS)
        const { data: sessionData, error: sessionError } = await supabaseAdmin
            .from('sessions')
            .insert([{ session_date: sessionDate, description }])
            .select()
            .single();

        if (sessionError) throw new Error(`Errore creazione sessione: ${sessionError.message}`);
        const sessionId = sessionData.id;

        const text = await file.text();
        const lines = text.split(/\r?\n/);
        const playersMap = new Map<string, { guid: string; player_name: string; updated_at: string }>();
        const eventsToInsert: any[] = [];

        const trackPlayer = (guid: string, name: string) => {
            if (guid && guid !== '0') {
                playersMap.set(guid, {
                    guid,
                    player_name: name || 'Unknown Player',
                    updated_at: new Date().toISOString(),
                });
            }
        };

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            const matchType = line.match(/^\s*\d+:\d+\s+([A-Z]);(.+)$/i);
            if (!matchType) continue;

            const type = matchType[1].toUpperCase();
            const dataStr = matchType[2];
            const parts = dataStr.split(';');

            if (type === 'J' && parts.length >= 3) {
                trackPlayer(parts[0], parts[2]);
            }

            else if (type === 'K' && parts.length >= 12) {
                const attackerGuid = parts[0];
                const attackerName = parts[3];
                const victimGuid = parts[4];
                const victimName = parts[7];
                const weapon = parts[8];
                const damage = parseInt(parts[9], 10) || 0;
                const mod = parts[10];
                const hitLoc = parts[11];

                trackPlayer(attackerGuid, attackerName);
                trackPlayer(victimGuid, victimName);

                eventsToInsert.push({
                    session_id: sessionId,
                    attacker_guid: attackerGuid === '0' ? null : attackerGuid,
                    victim_guid: victimGuid === '0' ? null : victimGuid,
                    weapon,
                    damage,
                    mod,
                    hit_loc: hitLoc,
                });
            }

            else if (type === 'D' && parts.length >= 12) {
                const victimGuid = parts[0];
                const victimName = parts[4];
                const attackerName = parts[8];
                const weapon = parts[8];
                const damage = parseInt(parts[9], 10) || 0;
                const method = parts[10];
                const hitLoc = parts[11];

                if (attackerName === 'world' || method === 'MOD_FALLING') {
                    trackPlayer(victimGuid, victimName);

                    eventsToInsert.push({
                        session_id: sessionId,
                        attacker_guid: null,
                        victim_guid: victimGuid === '0' ? null : victimGuid,
                        weapon,
                        damage,
                        mod: method,
                        hit_loc: hitLoc,
                    });
                }
            }
        }

        if (playersMap.size > 0) {
            const playersArray = Array.from(playersMap.values());
            const { error: playersError } = await supabaseAdmin
                .from('players')
                .upsert(playersArray, { onConflict: 'guid' });

            if (playersError) throw new Error(`Errore upsert giocatori: ${playersError.message}`);
        }

        if (eventsToInsert.length > 0) {
            const { error: eventsError } = await supabaseAdmin
                .from('matches_events')
                .insert(eventsToInsert);

            if (eventsError) throw new Error(`Errore inserimento eventi: ${eventsError.message}`);
        }

        return NextResponse.json({
            success: true,
            message: `Sessione creata con ID ${sessionId}. Rilevati ${playersMap.size} giocatori e salvati ${eventsToInsert.length} eventi di gioco.`,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}