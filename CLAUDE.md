# Estoque Brasil

## Monorepo Structure

- `apps/api/` - Fastify API (TypeScript, tsx watch)
- `apps/mobile/` - Expo/React Native (Zebra MC2200)
- `apps/web/` - Next.js admin dashboard

## Mobile Build

Sempre usar build **release otimizado** para instalar no device:

```bash
ANDROID_HOME=/mnt/c/Users/thspe/AppData/Local/Android/Sdk npx expo run:android --variant release
```

Nunca usar build debug para device fisico (65MB vs 35MB - Zebra tem pouco armazenamento).

## API

Dev server: `cd apps/api && pnpm dev` (tsx watch, auto-reload)

Base path: `/api` (todas as rotas prefixadas)

## Database

Supabase (PostgreSQL). Usar MCP tools para queries e migrations.

## Conventions

- Commits em portugues, formato: "Atualização do sistema X.XX" ou descritivo
- Mobile: dark theme, tela 4", path aliases `@/*` -> `src/*`
- API: Clean Architecture (entities -> use-cases -> controllers -> routes)
