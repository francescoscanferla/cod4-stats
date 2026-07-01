# CONTESTO E SPECIFICHE DI SVILUPPO: DASHBOARD STATISTICHE COD4

Questo documento funge da "Fonte della Verità" per l'agente di sviluppo Cline. Contiene la visione globale, i requisiti dell'interfaccia utente (UI), l'architettura dei dati e la roadmap incrementale per lo sviluppo dell'applicazione **cod4-stats**.

---

## 1. Visione del Progetto & Obiettivo
L'obiettivo è creare una Dashboard web moderna e reattiva per visualizzare le statistiche di gioco di un server di *Call of Duty 4: Modern Warfare*. 
L'applicazione deve permettere agli utenti di monitorare l'andamento globale storico e i dati dell'ultima sessione attiva attraverso un'interfaccia scura, pulita e competitiva.

### Stack Tecnologico
- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS) — *Già inizializzato*.
- **Database / Backend:** Supabase — *Client già installato, chiavi configurate in `.env.local`*.
- **Stile/Tema:** Palette Dark ispirata a *Catppuccin Mocha* (Sfondi principali `#11111b`, `#181825`, `#1e1e2e`, scritte chiare `#cdd6f4` e accenti verdi `#a6e3a1` o `#1fc75c`).

### UI/UX
Attualmente l'interfaccia grafica è definita al livello di colori e componenti. Quindi per i futuri sviluppi manteniamo sempre lo stile attuale come colori e UX.

---

## 2. Architettura delle API (Backend unificato)
Per ottimizzare i token e le performance, il backend utilizzerà un **unico endpoint flessibile** controllato da un Query Parameter temporale (`?period=`).

- **Endpoint:** `/api/stats`
- **Query Parameters gestiti:**
  - `?period=global` (Restituisce lo storico complessivo dei giocatori)
  - `?period=last` (Restituisce i dati della sola ultima sessione attiva)

### Contratto del Payload JSON (Identico per entrambi i periodi)
L'endpoint deve rispondere con una struttura rigida che mappa 8 metriche esatte (senza campi superflui come lo stato online o posizionamenti pre-calcolati):

```json
{
  "awards": {
    "kills": { "player_name": "Player1", "value": 1245 },
    "headshots": { "player_name": "Player2", "value": 184 },
    "ratio": { "player_name": "Player3", "value": 1.27 },
    "claymorekills": { "player_name": "Player4", "value": 22 },
    "grenadekills": { "player_name": "Player5", "value": 15 },
    "knifekills": { "player_name": "Player6", "value": 32 },
    "deaths": { "player_name": "Player7", "value": 982 },
    "suicides": { "player_name": "Player8", "value": 4 }
  },
  "general": [
    {
      "player_name": "Player1",
      "kills": 1245,
      "headshots": 184,
      "ratio": 1.27,
      "claymorekills": 22,
      "grenadekills": 15,
      "knifekills": 32,
      "deaths": 982,
      "suicides": 4
    }
  ]
}

## 3. Specifiche del Sito

### Pagine Principali
- **`/` (Home Page):** Visualizza le statistiche generali e i "premi" (awards) dei giocatori. Permette di alternare tra statistiche "Globali" e "Ultima Sessione". Include funzionalità di autenticazione (reindirizzamento a `/login` se non autenticato) e un pannello di amministrazione (`/admin`) accessibile solo agli utenti con `is_admin: true`.
- **`/login`:** Pagina di accesso per gli utenti.
- **`/admin`:** Pannello di amministrazione (accesso ristretto).

### Componenti UI Notabili
- **Header:** Contiene il titolo del sito ("B.Y.O.B. Stats"), un pulsante per il pannello di amministrazione (se `isAdmin` è true), un pulsante di disconnessione e l'avatar dell'utente.
- **Selettore Periodo:** Due pulsanti ("Globali" e "Ultima Sessione") per filtrare le statistiche.
- **Sezione Premi (Awards):** Mostra i migliori giocatori per diverse categorie (es. "Il Mietitore" per le uccisioni). Ogni premio include un'icona, nome, descrizione e il giocatore con il valore più alto.
- **Tabella Classifica Generale:** Una tabella interattiva che mostra le statistiche dettagliate di tutti i giocatori, ordinabile per ogni colonna (es. `KILLS`, `HEADSHOTS`, `RATIO`).

### Variabili di Stile/Tema (da `globals.css`)
- `--background`: `#ffffff` (light), `#0a0a0a` (dark)
- `--foreground`: `#171717` (light), `#ededed` (dark)
- Colori usati in `page.tsx`:
  - `bg-[#11111b]`
  - `text-[#cdd6f4]`
  - `bg-[#1e1e2e]`
  - `text-[#1fc75c]`
  - `hover:bg-[#313244]`
  - `border-t-green-400`
  - `border-t-[#ff5d00]`
  - `border-t-[#313244]`
  - `text-[#5f6378]`
  - `text-red-500`
  - `text-[#a6e3a1]`
  - `text-[#f9e2af]`


## 4. Roadmap dei Task (TO-DO)
L'evoluzione del progetto segue una sequenza rigida di micro-task atomici. Ogni task corrisponde a un file `.md` operativo fornito all'agente.

