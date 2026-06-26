CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.players (
    guid TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.matches_events (
    id INT8 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    attacker_guid TEXT REFERENCES public.players(guid) ON DELETE SET NULL,
    victim_guid TEXT REFERENCES public.players(guid) ON DELETE CASCADE,
    weapon TEXT NOT NULL,
    damage INT4 NOT NULL,
    mod TEXT NOT NULL,
    hit_loc TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read matches_events" ON public.matches_events FOR SELECT USING (true);

COMMENT ON TABLE public.sessions IS 'Contiene le sessioni di gioco sul server.';
COMMENT ON COLUMN public.sessions.id IS 'ID univoco della sessione.';
COMMENT ON COLUMN public.sessions.session_date IS 'Data di svolgimento della sessione.';
COMMENT ON COLUMN public.sessions.description IS 'Note o titolo opzionale della sessione.';
COMMENT ON COLUMN public.sessions.created_at IS 'Timestamp di inserimento.';

COMMENT ON TABLE public.players IS 'Anagrafica dei giocatori tracciati sul server.';
COMMENT ON COLUMN public.players.guid IS 'Il codice GUID rilasciato da CoD4.';
COMMENT ON COLUMN public.players.player_name IS 'Ultimo nickname registrato in partita per questo giocatore.';
COMMENT ON COLUMN public.players.updated_at IS 'Data ultimo aggiornamento del nickname.';

COMMENT ON TABLE public.matches_events IS 'Registro atomico di ogni uccisione estratto dai log.';
COMMENT ON COLUMN public.matches_events.id IS 'ID evento.';
COMMENT ON COLUMN public.matches_events.session_id IS 'Riferimento alla sessione di gioco corrente.';
COMMENT ON COLUMN public.matches_events.attacker_guid IS 'GUID di chi attacca. Se NULL, indica morte ambientale.';
COMMENT ON COLUMN public.matches_events.victim_guid IS 'GUID del giocatore che subisce il danno o la morte.';
COMMENT ON COLUMN public.matches_events.weapon IS 'Codice arma usata.';
COMMENT ON COLUMN public.matches_events.damage IS 'Quantità di danno inflitto (es. 100 per uccisione immediata).';
COMMENT ON COLUMN public.matches_events.mod IS 'Metodo di danno (es. MOD_RIFLE_BULLET, MOD_HEAD_SHOT, MOD_SUICIDE).';
COMMENT ON COLUMN public.matches_events.hit_loc IS 'Punto impatto anatomico (es. head, torso_lower, none).';
COMMENT ON COLUMN public.matches_events.created_at IS 'Data e ora esatta dell''evento registrato.';