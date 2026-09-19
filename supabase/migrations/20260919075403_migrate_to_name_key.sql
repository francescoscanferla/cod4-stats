


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."matches_events" (
    "id" bigint NOT NULL,
    "session_id" "uuid",
    "attacker_id" "uuid",
    "victim_id" "uuid",
    "weapon" "text" NOT NULL,
    "damage" integer NOT NULL,
    "mod" "text" NOT NULL,
    "hit_loc" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "event_type" "text" DEFAULT 'KILL'::"text" NOT NULL,
    CONSTRAINT "matches_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['KILL'::"text", 'DAMAGE'::"text"])))
);


ALTER TABLE "public"."matches_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."matches_events" IS 'Registro atomico di ogni uccisione estratto dai log.';



COMMENT ON COLUMN "public"."matches_events"."id" IS 'ID evento.';



COMMENT ON COLUMN "public"."matches_events"."session_id" IS 'Riferimento alla sessione di gioco corrente.';



COMMENT ON COLUMN "public"."matches_events"."attacker_id" IS 'FK a players.id di chi attacca. NULL = morte ambientale';



COMMENT ON COLUMN "public"."matches_events"."victim_id" IS 'FK a players.id del giocatore che subisce danno/morte';



COMMENT ON COLUMN "public"."matches_events"."weapon" IS 'Codice arma usata.';



COMMENT ON COLUMN "public"."matches_events"."damage" IS 'Quantità di danno inflitto (es. 100 per uccisione immediata).';



COMMENT ON COLUMN "public"."matches_events"."mod" IS 'Metodo di danno (es. MOD_RIFLE_BULLET, MOD_HEAD_SHOT, MOD_SUICIDE).';



COMMENT ON COLUMN "public"."matches_events"."hit_loc" IS 'Punto impatto anatomico (es. head, torso_lower, none).';



COMMENT ON COLUMN "public"."matches_events"."created_at" IS 'Data e ora esatta dell''evento registrato.';



COMMENT ON COLUMN "public"."matches_events"."event_type" IS 'Origine log: KILL (riga K) o DAMAGE (riga D). Permette query separate per armi letali (solo KILL) vs hit_loc (tutti).';



ALTER TABLE "public"."matches_events" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."matches_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "player_name" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."players" OWNER TO "postgres";


COMMENT ON TABLE "public"."players" IS 'Anagrafica giocatori: id interno, player_name univoco case-sensitive usato come chiave import (guid log ignorato)';



COMMENT ON COLUMN "public"."players"."id" IS 'ID interno generato all''inserimento';



COMMENT ON COLUMN "public"."players"."player_name" IS 'Nome univoco case-sensitive del log CoD4';



CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."sessions" IS 'Contiene le sessioni di gioco sul server.';



COMMENT ON COLUMN "public"."sessions"."id" IS 'ID univoco della sessione.';



COMMENT ON COLUMN "public"."sessions"."session_date" IS 'Data di svolgimento della sessione.';



COMMENT ON COLUMN "public"."sessions"."description" IS 'Note o titolo opzionale della sessione.';



COMMENT ON COLUMN "public"."sessions"."created_at" IS 'Timestamp di inserimento.';



ALTER TABLE ONLY "public"."matches_events"
    ADD CONSTRAINT "matches_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_player_name_key" UNIQUE ("player_name");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_matches_events_event_type" ON "public"."matches_events" USING "btree" ("event_type");



CREATE INDEX "idx_matches_events_session_event_type" ON "public"."matches_events" USING "btree" ("session_id", "event_type");



ALTER TABLE ONLY "public"."matches_events"
    ADD CONSTRAINT "matches_events_attacker_id_fkey" FOREIGN KEY ("attacker_id") REFERENCES "public"."players"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matches_events"
    ADD CONSTRAINT "matches_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches_events"
    ADD CONSTRAINT "matches_events_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



CREATE POLICY "Allow insert matches_events" ON "public"."matches_events" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert players" ON "public"."players" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert sessions" ON "public"."sessions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public read matches_events" ON "public"."matches_events" FOR SELECT USING (true);



CREATE POLICY "Allow public read players" ON "public"."players" FOR SELECT USING (true);



CREATE POLICY "Allow public read sessions" ON "public"."sessions" FOR SELECT USING (true);



CREATE POLICY "Allow update players" ON "public"."players" FOR UPDATE USING (true) WITH CHECK (true);



ALTER TABLE "public"."matches_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON TABLE "public"."matches_events" TO "anon";
GRANT ALL ON TABLE "public"."matches_events" TO "authenticated";
GRANT ALL ON TABLE "public"."matches_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."matches_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."matches_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."matches_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";
































--
-- Dumped schema changes for auth and storage
--

