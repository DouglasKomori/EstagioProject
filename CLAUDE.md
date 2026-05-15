# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Victor Uematsu Barbearia** — a full-stack management system for a barbershop. Two separate apps share one git repo:

- **Backend** (`/`): Node.js + Express 5 API, runs on port 5000
- **Frontend** (`/my-app`): Next.js 16 + React 19 + Tailwind CSS 4, runs on port 3000

Database: **PostgreSQL on Supabase**. The backend was originally MySQL (mysql2) and was fully migrated to PostgreSQL (pg). All SQL uses `?` placeholders — `db/database.js` auto-converts them to `$1, $2...` at query time.

---

## Commands

### Backend (run from repo root)
```bash
node server.js          # start production
npm start               # same via npm script
node swagger.js         # regenerate swaggerOutput.json after route changes
```

### Frontend (run from /my-app)
```bash
npm run dev             # dev server on port 3000
npm run build           # production build
npm run lint            # eslint
```

There are no tests.

---

## Environment Variables

Backend `.env` in repo root:
```
DB_HOST=       # Supabase host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=
FRONTEND_URL=http://localhost:3000   # used for CORS
PORT=5000
```

Frontend `/my-app/.env.local` (or Vercel/Render env vars):
```
NEXT_PUBLIC_API_URL=http://localhost:5000   # embedded at build time
```

`NEXT_PUBLIC_API_URL` must be correct **before** running `npm run build` — it's baked into the static output.

---

## Architecture

### Backend

Follows a strict layered pattern: `routes → controllers → repositories → database`.

- **`server.js`** — registers all routes, configures CORS (`process.env.FRONTEND_URL`), swagger UI at `/docs`
- **`db/database.js`** — single `Database` class wrapping `pg.Pool`. Key methods:
  - `ExecutaComando(sql, values)` → returns `row[]`
  - `ExecutaComandoNonQuery(sql, values)` → returns `boolean`
  - `ExecutaComandoLastInserted(sql, values)` → appends `RETURNING id`, returns the new `id`
  - `AbreTransacao()` / `Commit()` / `Rollback()` — uses a dedicated pool client stored in `#transactionClient`
  - **`COLUNAS_CAMEL` map + `normalizarRow`** — PostgreSQL returns all identifiers in lowercase; this map remaps them back to camelCase before returning rows. If a new column/alias is added to a query and its name isn't in the map, it will be returned in lowercase and may break frontend access.
- **`middlewares/authMiddleware.js`** — JWT-based auth. Three guards: `validarToken` (any logged-in user), `validarFuncionario` (ADMIN or FUNCIONARIO), `validarAdmin` (ADMIN only). JWT secret is hardcoded as `"BARBERUEMATSU"`. Token payload includes `{ id, nome, email, telefone, perfil }`.
- **`entities/`** — plain JS classes (no ORM), just property containers
- **`repositories/`** — all SQL lives here. Each repo instantiates `new Database()` per call
- **`routes/`** — thin Express routers; each route applies the appropriate auth middleware before delegating to the controller

### Frontend

Next.js App Router. Two distinct UX areas:

**Client-facing** (`/app/page.tsx`, `/agendamento`, `/cadastro`, `/login`, `/sobre`, `/espaco-interno`):
- Wrapped by `clienteLayout.tsx` — global header, hamburger sidebar, WhatsApp FAB, footer
- If `pathname.startsWith("/admin")`, `clienteLayout` renders nothing (just `children`) so admin has its own shell

**Admin panel** (`/app/admin/**`):
- Wrapped by `/app/admin/layout.tsx` — checks `localStorage` for token + perfil on mount; redirects CLIENTE profiles to `/`. Has a collapsible sidebar with sectioned navigation (Operacional / Cadastros / Relatórios)
- All API calls use `localStorage.getItem("token")` as Bearer token
- No global state manager — each page is self-contained with local `useState`

### User Roles

| Perfil | Access |
|--------|--------|
| `CLIENTE` | Public pages + `/agendamento` (own bookings only) |
| `FUNCIONARIO` | Full admin panel |
| `ADMIN` | Full admin panel + admin-only operations |

Clients are stored in the `cliente` table; staff/professionals are in the `pessoa` table (type `PF`). Staff accounts for admin access are created via the "Acesso" button in `/admin/pessoas`.

### Key Domain Concepts

- **Caixa** — cash register session (ABERTO/FECHADO). Revenue reports are tied to a caixa
- **Comanda** — per-client bill, contains services and products; linked to a caixa
- **Agendamento** — appointment, links a client + professional + services + datetime
- **Disponibilidade** — weekly schedule per professional (day-of-week + time range)
- **Bloqueio** — time block (vacation/absence) per professional; prevents bookings
- **Movimentacao de Estoque** — stock in/out log per product

### Adding a New camelCase Column/Alias

If you add a SQL alias or column that contains uppercase letters (e.g., `AS totalValor`), PostgreSQL will return it as `totalvalor`. Add the mapping to `COLUNAS_CAMEL` in `db/database.js`:

```js
totalvalor: 'totalValor',
```

Without this, `row.totalValor` will be `undefined` in repositories and the frontend.
