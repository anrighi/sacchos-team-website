# F5 — Tabellino social e recap

| Field | Value |
|-------|-------|
| Status | not_started |
| Phase | 2 |
| Files | `src/routes/sfida.partita.tsx`, OG meta |
| Tests | `host`+`guest`+`seed` → stesso tabellino e stesso `og:title`; URL senza seed non è un risultato chiuso |

## Goal

`/sfida/partita?host=&guest=&seed=` deterministico, screenshot-friendly, share nativo.

## Prerequisites

- F4 sim

## Acceptance criteria

- [ ] Risultato + nomi rosa inseriti; etichette nickname o nome
- [ ] Mete, scalpi, formazioni, MVP, highlight
- [ ] Card 9:16 e 1200×630
- [ ] `og:title` tipo `Marco 3–2 Luca — tabellino`
- [ ] Rivincita dal tabellino
- [ ] Spec + manifest `done` e PR con `Closes #N`

## Deliverables

- Pagina recap SSR, meta OG, share WhatsApp/Telegram/X / copia link

## Notes

Canonical `https://sacchos.agescipesaro1.it`.
