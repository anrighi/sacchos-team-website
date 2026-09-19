# F8 — Link corti per la sfida

| Field | Value |
|-------|-------|
| Status | deferred |
| Phase | 0+ |
| Files | `src/lib/challenge/shortlink.ts`, resolver su `/s/$id` (o `/sfida/$id`) |
| Tests | mint/resolve round-trip; nome unico → slug; collisione nome → id; id ignoto → vuoto |

## Goal

Dopo lo schieramento, il link da mandare contiene solo il **nome della rosa** o un **id corto**. Chi apre `/s/marco` (o `/s/k7p2qm1a`) vede la sfida senza i sette slug in query.

## Prerequisites

- F3 payload `host`/`guest` (resta il formato canonico di fallback)
- Runtime con storage (Worker / Sheet in append, stesso vincolo di F6). Su Pages statico non si persiste il mapping.

## Acceptance criteria

- [ ] Esplicitamente non implementato in questo slice
- [ ] Manifest `deferred`
- [ ] Quando si riapre: `mint` → id 8 caratteri; se `normalizeName` è libero, anche slug dal nome
- [ ] `GET` dello slug/id idrata la stessa `Lineup` di `encodeLineup` / `decodeLineup`
- [ ] Due rose con lo stesso nome non si sovrascrivono: la seconda tiene solo l’id
- [ ] Senza store (Pages): si continua a copiare `?host=` tondo; niente 404 silenzioso
- [ ] Stesso giocatore resta vietato sulle due rose (regola F3)

## Deliverables

- Nessuno fino a riapertura
- Allora: engine puro + Vitest, adapter di storage, UI share che preferisce l’URL corto

## Notes

Oggi il link è `?host=<nome>~<modulo>~<7 slug>` (F3) e `?guest=&seed=` (F4). Va bene in chiaro, è lungo da incollare su WhatsApp.

F8 non salta lo schieramento: i sette si scelgono ancora. L’engine accorcia solo **la condivisione** (e, se il nome è unico nello store, il riutilizzo: “la rosa di Marco” risolve l’ultimo schieramento salvato con quel nome).

Forma prevista, da confermare in implementazione:

- `/s/:id` — id opaco, sempre valido
- `/s/:nome` — solo se il nome (già normalizzato, max 24, senza `~`) è unico
- partita: id host + id guest + `seed`, non re-inlinare i 14 slug

Niente accorciatori terzi (bit.ly e simili): mapping nel nostro store, niente PII oltre al nome rosa già pubblico nel link F3.

Non aprire PR di implementazione per F8 finché lo status non torna `todo`. Non anticipare F5/F6.
