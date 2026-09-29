# Cloudflare — deploy e DNS

Produzione: [https://sacchos.agescipesaro1.it](https://sacchos.agescipesaro1.it)  
Rosa: Google Sheet a **build** (non si sposta).  
Partite (F6): Workers KV sullo stesso Worker.

Piano **Free** basta: Custom Domain, 100k req/giorno Workers, KV 100k read / 1k write / giorno.

`compatibility_date` in `wrangler.jsonc` è `2026-09-10` (massimo supportato dal workerd del lockfile). Non alzarlo senza aggiornare `wrangler` / `workerd`.

## Cosa non fare

- Non cambiare i nameserver di `agescipesaro1.it` (l’apex è già live su Cloudflare).
- Non mettere la rosa su KV/R2/D1.
- Non usare Partial CNAME setup (è a pagamento).

## 1. Secret GitHub

Repo → Settings → Secrets and variables → Actions:

| Secret | Dove |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Dashboard CF → My Profile → API Tokens. Template precompilato in questa guida |
| `CLOUDFLARE_ACCOUNT_ID` | Opzionale se il token vede un solo account. Altrimenti: [Workers Overview](https://dash.cloudflare.com/?to=/:account/workers) → Account ID nella barra laterale (o nell’URL `dash.cloudflare.com/<id>/…`) |
| `ROSTER_SHEET_CSV_URL` | già usato per l’ingest (opzionale se c’è `src/data/roster.sheet.url`) |

Senza `CLOUDFLARE_API_TOKEN`, CI testa e builda ma **non pubblica**. `CLOUDFLARE_ACCOUNT_ID` serve solo se wrangler non riesce a scegliere l’account dal token.

Token precompilato (Workers Scripts + KV + Account Settings read + Routes + DNS):

https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22workers_scripts%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22workers_kv_storage%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22account_settings%22%2C%22type%22%3A%22read%22%7D%2C%7B%22key%22%3A%22workers_routes%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22dns%22%2C%22type%22%3A%22edit%22%7D%5D&accountId=%2A&zoneId=all&name=Sacchos%20GitHub%20deploy

## 2. Stesso account della zona

`agescipesaro1.it` usa già `rosa.ns.cloudflare.com` e `lakas.ns.cloudflare.com`. Il Worker deve stare **su quell’account**.

Se hai creato un account Free nuovo e la zona è su un altro login (webmaster del gruppo):

1. Invita l’email del Worker come membro della zona, **oppure**
2. Fai il deploy con il token dell’account che possiede `agescipesaro1.it`.

Non aggiungere la zona di nuovo: cambieresti i NS e butteresti giù il sito apex.

## 3. Primo deploy

In locale (una volta):

```bash
pnpm wrangler login
pnpm deploy
```

Oppure push su `main` dopo i secret: CI lancia `wrangler deploy`.

`wrangler.jsonc` dichiara il Custom Domain `sacchos.agescipesaro1.it`. Al deploy Cloudflare crea il record DNS e il certificato. Se esiste già un CNAME su `sacchos`, eliminalo **prima** del deploy.

Dashboard alternativa: Worker `sacchos` → Settings → Domains & Routes → Add → Custom Domain → `sacchos.agescipesaro1.it`.

Fino al primo deploy il hostname risponde su `https://sacchos.<sottodominio-account>.workers.dev`.

## 4. Preview dei branch

Ogni push fuori da `main` fa `wrangler versions upload --preview-alias <slug>`. L’URL finisce nel commento della PR. Non usa più `anrighi.github.io/.../preview/`.

## 5. KV partite (F6)

Quando si implementa F6:

```bash
pnpm wrangler kv namespace create MATCHES
pnpm wrangler kv namespace create MATCHES --preview
```

Incolla gli `id` in `wrangler.jsonc` sotto `kv_namespaces` (binding `MATCHES`). Nessun Sheet, nessun Apps Script.
