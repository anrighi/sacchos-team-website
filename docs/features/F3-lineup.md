# F3 — Schieramento 3-2-1 e link sfida

| Field | Value |
|-------|-------|
| Status | not_started |
| Phase | 2 |
| Files | `src/routes/sfida.tsx`, `src/lib/challenge/` |
| Tests | encode/decode payload; displayName obbligatorio; 7 slug, 1 POR, ≥2 per sesso; stesso slug vietato sulle due rose |

## Goal

Chi crea dà un nome alla rosa, schiera 7 in 3-2-1 (default), copia `/sfida?host=`. Chi apre vede chi sta sfidando.

## Prerequisites

- F1 (slug giocatori)

## Acceptance criteria

- [ ] Campo nome obbligatorio (trim, non vuoto)
- [ ] 7 titolari, 1 portiere, ≥2 per sesso; fuori ruolo permesso (malus in F4)
- [ ] Modulo default 3-2-1; costanti TS per 2-3-1 e 2-1-1-2 (no `formations.json`)
- [ ] Host casa bianca; guest navy
- [ ] Query `host=` tonda; decode non muta gli slot host
- [ ] Etichette: nickname o nome
- [ ] Spec + manifest `done` e PR con `Closes #N`

## Deliverables

- UI schieramento mobile (campo verticale, roster a cassetto)
- `src/lib/challenge/` puro + Vitest

## Notes

Stesso giocatore non in entrambe le rose. Varianti modulo come costanti, UI può partire dal solo 3-2-1.
