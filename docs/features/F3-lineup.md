# F3 — Schieramento 3-2-1 e link sfida

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 2 |
| Files | `src/routes/sfida.tsx`, `src/lib/challenge/`, `src/components/challenge/` |
| Tests | encode/decode payload; displayName obbligatorio; 7 slug, 1 POR, ≥2 per sesso; stesso slug vietato sulle due rose |

## Goal

Chi crea dà un nome alla rosa, schiera 7 in 3-2-1 (default), copia `/sfida?host=`. Chi apre vede chi sta sfidando.

## Prerequisites

- F1 (slug giocatori)

## Acceptance criteria

- [x] Campo nome obbligatorio (trim, non vuoto)
- [x] 7 titolari, 1 portiere, ≥2 per sesso; fuori ruolo permesso (malus in F4)
- [x] Modulo default 3-2-1; costanti TS per 2-3-1 e 2-1-1-2 (no `formations.json`)
- [x] Host casa bianca; guest navy
- [x] Query `host=` tonda; decode non muta gli slot host
- [x] Etichette: nickname o nome
- [x] Spec + manifest `done`

## Deliverables

- UI schieramento mobile (campo verticale, roster a cassetto)
- `src/lib/challenge/` puro + Vitest

## Notes

Stesso giocatore non in entrambe le rose. Varianti modulo come costanti, UI può partire dal solo 3-2-1.
Skin della pagina: `docs/VISUAL.md` (PNG ritagliati, hero scuro, CTA a pillola, poco testo).

Codifica link: `host=<nome>~<modulo>~<7 slug separati da ~>`, slot vuoto = campo vuoto. Leggibile e tonda, niente base64. Il nome viene normalizzato (spazi compattati, `~` e `|` rimossi, max 24 caratteri) prima di entrare nell'URL.

`Rosa casuale` schiera sette validi (portiere, ≥2 per sesso) tra i giocatori liberi.

Il ritratto in campo segue il lato (host casa, ospite trasferta), non la squadra di appartenenza: `PlayerPortrait` riceve `kit` e Toon Head colora la maglia. Un PNG in `public/players/{slug}.png` ha comunque la precedenza.
