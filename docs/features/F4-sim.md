# F4 — Simulazione 2×15′ in 90s

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 2 |
| Files | `src/lib/challenge/sim.ts`, `src/components/challenge/MatchView.tsx`, `src/routes/sfida.tsx` |
| Tests | stesso seed → stessa sequenza e punteggio; orologio 2×15′; pause ≥ 0; tre vuoti → uscita; 4 pieni → meta tecnica |

## Goal

Sim deterministica: cronometro da scoutball due tempi da 15′, wall-clock ~90s (~20×), pause su eventi.

## Prerequisites

- F3 payload valido host+guest

## Acceptance criteria

- [x] Orologio mostra 15′×2, non 0–90s
- [x] Tra eventi scorre accelerato; meta/scalpo/parata pausano 1–3s
- [x] Intervallo breve a 15′
- [x] Eventi da stats (velocità, salto, intercetto, scalpo, finalizzazione, gk)
- [x] Ticker: nickname o nome + numero se collisione
- [x] Tre vuoti → uscita; 3 in campo → meta tecnica
- [x] Spec + manifest `done`

## Deliverables

- Engine puro + test seed
- UI ticker (motion pesante solo se non `prefers-reduced-motion`)

## Notes

Regolamento: https://www.scoutballitalia.it/regolamento — portiere obbligatorio, ≥2 per sesso (già validato in F3).

La partita parte da `/sfida?host=&guest=&seed=`. Senza `seed` ne viene creato uno e messo in query (stesso seed, stesse rose → stessa sequenza). Playback 20× (`50ms` per secondo di gioco) con pausa 1–3s su meta/scalpo/parata e 2s di intervallo; con `prefers-reduced-motion` l’orologio salta di evento in evento.

Fuori ruolo: malus sulle stat se `role` è valorizzato e non coincide con la linea (portiere non-POR: `gk × 0.7`). Il portiere non esce per scalpo pieno: senza di lui non si gioca. Chi prende tre vuoti nello stesso tempo esce; a quattro scalpi pieni (restano in tre, portiere compreso) scatta la meta tecnica e tutti rientrano.
