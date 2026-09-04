# F4 — Simulazione 2×15′ in 90s

| Field | Value |
|-------|-------|
| Status | not_started |
| Phase | 2 |
| Files | `src/lib/challenge/sim.ts`, UI ticker su `/sfida` |
| Tests | stesso seed → stessa sequenza e punteggio; orologio 2×15′; pause ≥ 0 |

## Goal

Sim deterministica: cronometro da scoutball due tempi da 15′, wall-clock ~90s (~20×), pause su eventi.

## Prerequisites

- F3 payload valido host+guest

## Acceptance criteria

- [ ] Orologio mostra 15′×2, non 0–90s
- [ ] Tra eventi scorre accelerato; meta/scalpo/parata pausano 1–3s
- [ ] Intervallo breve a 15′
- [ ] Eventi da stats (velocità, salto, intercetto, scalpo, finalizzazione, gk)
- [ ] Ticker: nickname o nome + numero se collisione
- [ ] Tre vuoti → uscita; 3 in campo → meta tecnica
- [ ] Spec + manifest `done` e PR con `Closes #N`

## Deliverables

- Engine puro + test seed
- UI ticker (motion pesante solo se non `prefers-reduced-motion`)

## Notes

Regolamento: https://www.scoutballitalia.it/regolamento — portiere obbligatorio, ≥2 per sesso (già validato in F3).
