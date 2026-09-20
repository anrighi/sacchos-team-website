# Visual

Linee guida per **tutte** le pagine, non solo la home. Spec F2: [features/F2-visual.md](features/F2-visual.md). Regola agent: `.cursor/rules/visual.mdc`.

Riferimento implementato: `src/components/HomeLanding.tsx`.

## Tokens

| Token | Valore | Uso |
|-------|--------|-----|
| Navy | `#1a2634` | brand, maglia trasferta |
| Navy deep | `#0d141c` | body, testo su rosa |
| Rosa | `#f867a5` | accent, CTA, artigli |
| Bianco | `#ffffff` / `#f4f1ea` | testo, maglia casa |
| Titoli | `font-display` (MrAlex) | h1/h2, overall, nickname in evidenza |
| Corpo | `font-sans` (MrAlex) | claim, CTA, nav, filtri — niente system UI |

Tema dark fisso. UI in italiano. **Solo MrAlex** (`--font-sans` e `--font-display`). Identità solo **Saccho's Team**; Saccios Tim è un filtro, logo pennarello solo sul chip.

## Asset

Path da passare a `publicUrl`. I JPG nello stesso folder sono **reference**, non UI.

| Asset | UI | Note |
|-------|----|------|
| Logo Saccho's | `/brand/logo-sacchos.png` | Anello e lettere sul nero; dentro l’anello è trasparente; il pallone resta bianco |
| Logo Saccios Tim | `/brand/logo-saccios-tim.png` | Solo chip filtro / intestazione rosa Saccios |
| Kit casa | `/brand/kit-home-front.png` | Ritaglio, niente foglio bianco |
| Kit trasferta | `/brand/kit-away-front.png` | Ritaglio, niente foglio bianco |
| Ritratti | `PlayerPortrait` | `backdrop={false}` se fluttuano sul nero; default nelle `PlayerCard` |
| Foglio maglie | — | `maglie-scoutball.jpg` non va in pagina |
| Favicon | `/favicon.jpg` | Eccezione: icona tab, non hero |

```tsx
<img src={publicUrl("/brand/logo-sacchos.png")} alt={club.name} className="h-9 w-auto object-contain" />
```

Logo e kit: `object-contain` e altezza/larghezza esplicite. Non `rounded-full` + `object-cover` sul logo intero.

## Ricetta pagina

1. `main` con `bg-black text-white`
2. Hero compatto: `landing-hero-glow`, titolo MrAlex, **una** riga di claim, una o due CTA a pillola
3. Un blocco visivo (kit, ventaglio ritratti, campo) senza didascalie lunghe
4. Chiusura con headline corta + CTA, `border-t border-white/10`

Poco testo. Headline da due parole con punto (`Le carte.`, `In campo.`). Non duplicare la stessa cutout in due sezioni.

CTA (tap ≥ 44px / `min-h-11`):

```tsx
<Link to="/rosa" className="inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm text-navy-deep hover:bg-pink/90">
  Vedi la rosa
</Link>
<Link to="/sfida" className="inline-flex min-h-11 items-center rounded-full px-5 text-sm text-pink ring-1 ring-pink/40 hover:bg-pink/10">
  Lancia una sfida
</Link>
```

## Motion

| Classe / componente | Uso |
|---------------------|-----|
| `float-drift` | Logo, kit, ritratti cutout. Mettila sul nodo che deve muoversi, non su un parent già ruotato se vuoi tenere la rotazione |
| `landing-hero-glow` | Sfondo hero (già anima `glow-breathe`) |
| `<Reveal>` | Capitoli sotto il fold: fade + slide |
| `prefers-reduced-motion` | Già in `src/styles.css`: drift spento, reveal statico, fade only |

Niente bounce, loop veloci, o parallax. Drift lento (~6s).

## Altre superfici

- **Nav:** logo PNG `h-9 w-auto object-contain`, non cerchio ritagliato dal JPG. Voci: Home, Rosa, Sfida. Archivio (`/sfide`) nascosto fino a F6
- **Rosa / scheda:** hero compatto come la home (`La rosa.` + CTA, niente conteggio carte). Filtri a pillola `min-h-11`. `PlayerCard` con backdrop in carta, logo contain (niente `rounded-full`). Intestazioni squadra e chip: PNG contain
- **Sfida (F3+):** stesso hero scuro, MrAlex, pillole, eventuali kit PNG come cutout sul campo, non JPG

## Non fare

- Nuovi colori o il rosso marker fuori dal chip Saccios Tim
- Foto reali, cognomi
- Ridisegnare i loghi in SVG in questa fase (chore 0+)
- Sfondi CSS pieni dietro le PNG (il PNG è già il ritaglio)
