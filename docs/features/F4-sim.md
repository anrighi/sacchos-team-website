# F4 — Simulazione 2×15′ in 90s

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 2 |
| Files | `src/lib/challenge/sim.ts`, `src/lib/challenge/board.ts`, `src/lib/challenge/efficiency.ts`, `src/components/challenge/MatchView.tsx`, `src/components/challenge/MatchBoard.tsx`, `src/components/challenge/ScalpoMark.tsx`, `src/components/challenge/AnalogClock.tsx`, `src/routes/sfida.tsx` |
| Tests | stesso seed → stessa sequenza e punteggio; orologio 2×15′ + 5′ SA/GO; pause ≥ 0; tre vuoti → uscita; 4 pieni → meta tecnica; niente pareggio (argento, oro, spareggio scalpi); campo 30×18 orizzontale semplificato; carte fisse, vuoti a fazzoletti/scalpi, pieno toglie la carta; overlay sulla carta in focus, niente palla |

## Goal

Sim deterministica: cronometro da scoutball due tempi da 15′, wall-clock ~90s (~20×), pause su eventi.

## Prerequisites

- F3 payload valido host+guest

## Acceptance criteria

- [x] Orologio analogico 15′ × 2 (non digitale 0–90s)
- [x] Tra eventi scorre accelerato; meta/scalpo/impedisce-la-meta pausano 1–3s
- [x] Intervallo breve a 15′
- [x] Eventi da stats (velocità, salto, intercetto, scalpo, finalizzazione, gk)
- [x] Ticker: nickname o nome + numero se collisione
- [x] Tre vuoti → uscita; 3 in campo → meta tecnica
- [x] Spec + manifest `done`
- [x] Campo 2D scoutball in match view (30×18 orizzontale, aree 4 m, carte fisse, overlay sulla carta)
- [x] Niente pareggio: 5′ meta d'argento (tempo intero), 5′ meta d'oro (prima meta), poi scalpi pieni / vuoti / sorteggio

## Deliverables

- Engine puro + test seed
- UI ticker (motion pesante solo se non `prefers-reduced-motion`)
- Tavolo 2D scoutball orizzontale semplificato: carte in modulo, overlay sulla carta in focus, scalpi (fazzoletto) per i vuoti, carta tolta sul pieno, niente palla
- «Impedisce la meta di {tiratore}»; tiri in porta persistiti in `localStorage` come efficienza (mete/tiri) fino a F6

## Notes

Regolamento: https://www.scoutballitalia.it/regolamento — portiere obbligatorio, ≥2 per sesso (già validato in F3).

La partita parte da `/sfida?host=&guest=&seed=`. Senza `seed` ne viene creato uno e messo in query (stesso seed, stesse rose → stessa sequenza). Playback 20× (`50ms` per secondo di gioco) con pausa 1–3s su meta/scalpo/impedisce la meta e 2s di intervallo; con `prefers-reduced-motion` l’orologio e il tavolo saltano di evento in evento. Il tabellino elenca gli eventi dal più recente.

Tra cronometro analogico (15′ a giro in 1T/2T, 5′ a giro in SA/GO) e ticker c’è il campo scoutball semplificato in orizzontale (30×18 m, host a sinistra / ospite a destra, porte 4 m sui lati corti, aree a tutta larghezza profonde 4 m, metà campo; niente area di rigore da calcio). Orologio, campo e ticker restano fissi; scorre solo la cronaca (MrAlex più piccolo). Pausa, rewind e salto al periodo successivo sul tabellone, per gli screenshot. Le carte restano ferme nel modulo: sull’evento si evidenzia il giocatore e un overlay rosa sulla sua carta (Palla, Meta, Meta d'oro, Scalpo, Impedisce la meta); le altre si smorzano. Niente palla disegnata. Tre fazzoletti (scalpi) = vuoti rimasti (si azzerano all’intervallo, non ai supplementari); scalpo pieno toglie la carta dal campo fino alla meta successiva (niente ritratto spento: con il dim del focus sembrava già fuori). Il punteggio pulsa sulla meta. `prefers-reduced-motion`: solo fade. Il fischio d’inizio non è palla al centro: il seed sceglie chi attacca per primo e il secondo tempo inverte.

A parità dopo i 2×15′ si va ai supplementari da eliminazione diretta (regolamento Scoutball Italia): 5′ di meta d'argento, tempo giocato per intero, vince chi è avanti allo scadere; se è ancora pari, 5′ di meta d'oro, la prima meta chiude subito, altrimenti si arriva in fondo. I supplementari sono un prolungamento del 2T: niente cambio campo, vuoti che continuano, scalpato che resta fuori finché non arriva una meta. Ancora pari: più scalpi pieni, poi meno vuoti (i falli di squadra non sono nel sim), poi sorteggio da organizzatori. `winner` è sempre valorizzato.

Fuori ruolo: malus sulle stat se `role` è valorizzato e non coincide con la linea (portiere non-POR: `gk × 0.7`). Il portiere non esce per scalpo pieno: senza di lui non si gioca. Chi prende tre vuoti nello stesso tempo esce; a quattro scalpi pieni (restano in tre, portiere compreso) scatta la meta tecnica e tutti rientrano.

«Impedisce la meta» cita chi ha tirato (`Chiara impedisce la meta di Federico`); sul campo overlay sul portiere e «Meta tentata» sul tiratore. Ogni tiro arrivato in porta (meta o impedita) entra nel box score: efficienza attaccante = mete / tiri in porta, efficienza portiere = parate / tiri affrontati. Lo store è `localStorage` (`sacchos.efficiency.v1`), una riga per `seed` (niente doppio conteggio sulla rivincita dello stesso link). F6 sposterà lo stesso payload sullo Sheet.
