# F2 — Hero, font, loghi e motion

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 1 |
| Files | `src/routes/index.tsx`, `src/components/HomeLanding.tsx`, `src/components/Reveal.tsx`, `src/components/SiteNav.tsx`, `src/styles.css`, `src/lib/portrait.ts`, `public/brand/*.png` |
| Tests | visivo + `prefers-reduced-motion` (fade only) |

## Goal

Home cinematografica: logo Saccho's, kit bianca/navy, ventaglio carte, motion allineata al drago. Rosa e sfida con hero dedicati.

## Prerequisites

- F1 (carte da mettere in evidenza)

## Acceptance criteria

- [x] Hero home 100dvh, logo, due kit, CTA Rosa / Sfida
- [x] MrAlex su titoli, numeri, overall
- [x] JPG ritagliati in PNG per UI (sfondo rimosso)
- [ ] Loghi ridisegnati in SVG, stesso tratto → rinviato a fase 0+
- [x] Motion: reveal in fade/slide; `prefers-reduced-motion` = fade
- [x] Nav già in F0 resta; skin più editoriale
- [x] Spec + manifest `done`

## Deliverables

- Asset brand puliti (favicon, crop drago, chip Saccios)
- Hero home / rosa / sfida

## Notes

Niente restyling palette. Rosso marker solo sul chip Saccios Tim.
JPG di reference restano in `public/brand/`; la UI usa PNG ritagliati (sfondo rimosso). Ridisegnare i loghi in SVG resta una chore di grafica in fase 0+.
Home: tre blocchi (hero, carte, chiusura), poco testo, kit e ritratti fluttuanti, `prefers-reduced-motion` = niente drift.
Reference home: landing prodotto Apple (iPhone 17 Pro) — capitoli a tutto schermo, headline grandi, CTA a pillola, niente copia Apple.
