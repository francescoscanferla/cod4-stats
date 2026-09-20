# cod4-stats — CoD4 MW Statistics Dashboard

Dashboard Next.js per le statistiche di Call of Duty 4: Modern Warfare. Parse dei log server (`J`/`K`/`D`), storage su Supabase (`sessions`, `players`, `matches_events` con `event_type KILL|DAMAGE`), calcolo K/D, headshot, armi letali e heatmap hit-zone.

**Stack:** Next.js 16.2.9 (Turbopack) • React 19 • TypeScript 5 • Supabase (`@supabase/supabase-js`, `@supabase/ssr`) • Tailwind 4

## Architettura upload (refactoring 2026-09)
`app/api/stats/upload/route.ts` è thin controller. Logica in:
- `services/` — classi con stato (`SupabaseAdminService`, `SessionService`, `PlayerTrackerService` (Map per `player_name` case-sensitive), `LogImportService` 2-pass sincrono)
- `utils/` — funzioni pure (`log-parser.ts`, `event-builder.ts` + `isWorldEvent`)
- `types/log.types.ts` — `enum EventType { KILL, DAMAGE }` (DB `event_type TEXT CHECK`), `players.id UUID` generato all'inserimento, join su `attacker_id/victim_id` (guid log ignorato)

`event_type` permette: armi più letali filtrate su `KILL`, `hit_loc` su tutte le righe (`KILL`+`DAMAGE`).

## Requisiti
- Node.js 20+, npm
- Supabase CLI `npm i -g supabase` o `npx supabase`
- Docker Desktop (per Supabase locale)

## Avvio locale (Opzione A — env nativo Next.js)

File già pronti: `.env.development` → locale Docker, `.env.production` → cloud, `.env.local` → override personale (gitignored).

| File | Caricato quando | Contenuto |
|------|-----------------|-----------|
| `.env.development` | `npm run dev` (`NODE_ENV=development`) | `http://127.0.0.1:54321` + keys da `npx supabase status` |
| `.env.production` | `npm run build`/`start` (`NODE_ENV=production`) | URL/keys cloud `fvdecvas...supabase.co` |
| `.env.local` | sempre, DOPO gli altri (override) | solo `LOG_LEVEL=debug` — non mettere Supabase qui o sovrascrivi `development` |
| `.env.example` | mai caricato | template da copiare |

```bash
# 1. dipendenze
npm install

# 2. variabili d'ambiente — già configurati
# .env.development è già locale (sb_publishable_ACJW...), .env.production è cloud
# .env.local contiene solo LOG_LEVEL=debug. Non aggiungere Supabase a .env.local o prevale su development!

# 3. avvia Supabase locale
npx supabase start
# stampa API URL (http://127.0.0.1:54321), DB URL (postgresql://postgres:postgres@127.0.0.1:54322/postgres), Studio (http://127.0.0.1:54323)
npx supabase status   # rileggi keys se rigeneri

# 4. applica migrazioni locali
npx supabase db reset
# oppure solo pendenti
npx supabase migration up

# 5. avvia Next.js — usa automaticamente .env.development (locale)
npm run dev      # http://localhost:3000 → 127.0.0.1:54321

# 6. build produzione — usa .env.production (cloud)
npm run build    # verifica TypeScript
npm start        # avvia build prodotta su cloud

# 7. se vuoi pushare migrazioni su cloud
npx supabase link --project-ref <project-ref>
npx supabase db push

# 8. altri
npm run lint     # eslint
```

## Database — migrazioni

```bash
# stato migrazioni
npx supabase migration list          # locali vs remote
npx supabase db diff -f <nome>       # genera diff da DB locale (richiede supabase start)
npx supabase migration new <nome>    # crea supabase/migrations/<timestamp>_<nome>.sql

# applicare
npx supabase migration up            # locale
npx supabase db push                 # push su cloud (dopo link)
npx supabase db reset                # drop + reapply tutte le migrazioni + seed (locale)
npx supabase db pull                 # pull schema remoto -> supabase/migrations

# comandi utili
npx supabase gen types typescript --local > app/types/supabase.ts   # genera tipi DB
npx supabase db lint                 # check errori tipi
npx supabase inspect db table-stats  # stats tabelle
npx supabase status                  # URL/porte servizi locali
npx supabase stop                    # ferma container locali
```

Migrazioni presenti (squash 2026-09-19 — unico file, `npx supabase db reset` ricrea tutto):
- `20260919075403_migrate_to_name_key.sql` — dump compattato di tutte le precedenti: `sessions`, `players (id UUID PK, player_name UNIQUE case-sensitive, guid eliminato)`, `matches_events (attacker_id/victim_id UUID FK, event_type TEXT CHECK KILL|DAMAGE)`, RLS + GRANT + indici. Storico compattato via `npx supabase migration squash` (nessun dato perso, test DB resettato)
- `20260920084232_add_merge_players_function.sql` — `FUNCTION merge_players(src_name TEXT, tgt_name TEXT)` per bonifica duplicati same-player

## Upload log — formato atteso
Righe CoD4: `MM:SS J;guid;...;name` | `MM:SS K;attackerGuid;...;attackerName;victimGuid;...;victimName;weapon;damage;mod;hitLoc` | `MM:SS D;victimGuid;...;victimName;attackerGuid;...;attackerName;weapon;damage;mod;hitLoc` (`guid` del log ignorato, chiave import = `player_name` case-sensitive)
Endpoint: `POST /api/stats/upload` (multipart `file`, `description`, `session_date`) — parsing sincrono 2-pass (`collectNames` + `buildEvents`), `players` upsert su `player_name`, `event_type` mappato da `K`→`KILL`, `D`→`DAMAGE`, join su `players.id`.

## Comandi utili

```bash
npm run dev          # dev con Turbopack
npm run build        # build + typecheck
npm run lint         # eslint-config-next
npx tsc --noEmit     # solo typecheck
npx supabase --help  # help CLI
```

## Variabili d'ambiente

| Nome | Dove | Note |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.development` (locale) / `.env.production` (cloud) | URL Supabase — non mettere in `.env.local` o sovrascrivi |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.development` / `.env.production` | anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.development` / `.env.production` (solo server) | bypass RLS per upload |
| `LOG_LEVEL` | `.env.local` | `debug` per log `[upload]` dettagliati (unico valore in .env.local) |
| `OPENAI_API_KEY` | `supabase/config.toml` | Studio AI |

## Autenticazione — Google in locale & Admin

**Admin check:** `app/admin/page.tsx:27` e `app/page.tsx:31` guardano `session.user.user_metadata.is_admin === true`. Senza quel flag vieni redirectato a `/login`.

**Impostare admin in locale (dopo aver creato account via login):**
```bash
# 1. trova l'utente (Studio: http://127.0.0.1:54323 → Authentication → Users, oppure SQL)
npx supabase db query "select id, email, raw_user_meta_data from auth.users;" --local

# 2. promuovi ad admin (sostituisci email)
npx supabase db query "update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || '{\"is_admin\": true}'::jsonb where email = 'tuamail@gmail.com';" --local

# 3. alternativa via Studio: Authentication → Users → ⋯ → Edit user → User Metadata → aggiungi {"is_admin": true} → Save

# 4. fai logout/login per refreshare la sessione (il JWT deve contenere il nuovo metadata)
```
Per cloud: `npx supabase db query "..." --linked` oppure Dashboard Supabase → Authentication → Users → stessa modifica. Rimuovere admin: `raw_user_meta_data - 'is_admin'`.

**Google OAuth in locale:**
`supabase/config.toml:322-332` ha già `[auth.external.google]` con `client_id/secret = env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID/SECRET)` e `skip_nonce_check=true`, e `additional_redirect_urls` include `http://127.0.0.1:3000`/`http://localhost:3000`.

1. Crea credenziali su https://console.cloud.google.com/apis/credentials → ID client OAuth 2.0 (Web) → **Origini JS:** `http://127.0.0.1:3000`, `http://localhost:3000` → **Redirect:** `http://127.0.0.1:54321/auth/v1/callback` (locale) + `https://<ref>.supabase.co/auth/v1/callback` (cloud).
2. Metti i segreti in `.env.development.local` (gitignored, sovrascrive `.env.development`):
   ```
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=GOCSPX-xxx
   # opzionale Discord: SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID/SECRET
   ```
3. Abilita in `supabase/config.toml` → `[auth.external.google] enabled = true` (e discord se serve) → `npx supabase stop && npx supabase start && npx supabase db reset`.
4. Login su `http://127.0.0.1:3000/login` — `login/page.tsx:10 redirectTo: window.location.origin` torna su `127.0.0.1:3000/`. Usa `127.0.0.1` non `localhost` per matchare `site_url`.

Se non vuoi configurare Google in locale, usa email/password (conferma disabilitata in locale) per testare admin.

## Manutenzione DB — Merge player duplicato

Stesso giocatore con due nomi (case-sensitive duplicato, es. `mario_kill` → `Mario_Kill`):

```sql
SELECT public.merge_players('mario_kill', 'Mario_Kill');
-- sposta tutti i matches_events (attacker + victim) dal source al target ed elimina il source
-- parametri case-sensitive, nomi usati una sola volta come variabili interne
```

Esecuzione: Studio → SQL Editor oppure `npx supabase db query "select public.merge_players('mario_kill','Mario_Kill');" --local` (`--linked` per cloud). Funzione in `20260920084232`.

Truncate test:
```sql
TRUNCATE TABLE public.matches_events, public.sessions, public.players RESTART IDENTITY CASCADE;
```

## Troubleshooting
- `event_type` mancante dopo pull cloud → `npx supabase db push` o `migration up`
- Dati storici `event_type` tutti `KILL` → reimport log per avere `DAMAGE` corretti (802 D / 714 K su `20260916.txt`)
- `supabase start` fallisce → Docker non in esecuzione
- Login locale Google fallisce con `redirect_uri_mismatch` → controlla URI in Google Console (deve essere esattamente `http://127.0.0.1:54321/auth/v1/callback`)
- Admin ancora redirect a `/login` dopo update → logout/login obbligatorio, verifica `raw_user_meta_data` contiene `{"is_admin": true}`
