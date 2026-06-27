# AGENTS.md

Notas para agentes/IA que forem trabalhar neste repositório.

## Comandos

- Instalar: `npm install`
- Dev: `npm run dev`
- Build + type-check: `npm run build` (roda `tsc -b && vite build`)
- Preview do build: `npm run preview` (serve em `/english-voice-coach/`)
- Lint: `npm run lint` (oxlint)

Sempre rode `npm run build` e `npm run lint` antes de concluir uma mudança.

## Convenções

- React + TypeScript estrito. `verbatimModuleSyntax` e `erasableSyntaxOnly` ativos:
  - Use `import type { ... }` para tipos.
  - Não declare `enum`/`namespace` próprios (use uniões de string).
- Alias de import: `@/` → `src/`.
- Estado global: Zustand (`src/core/settings`). Dados: Dexie (`src/core/storage`).
- UI: Tailwind v4 (tokens em `src/index.css` no bloco `@theme`). Componentes
  compartilhados em `src/components/ui.tsx`.
- Sem backend: o app é client-side. A chave do Gemini fica só no dispositivo.
- O SDK `@google/genai` é carregado por import dinâmico (`src/core/gemini/client.ts`)
  para manter o bundle inicial leve — mantenha assim.

## Gemini

- Modelos centralizados em `src/core/gemini/models.ts`. O modelo Live pode mudar
  de nome; ajuste ali se a conversa por voz não conectar.
- Texto: `src/core/gemini/text.ts`. Voz (Live API): `src/core/gemini/live.ts`.

## Módulos (extensibilidade)

- Contrato em `src/core/modules/types.ts` (`LearningModule`).
- Registre novos módulos em `src/core/modules/registry.ts`.
- Reaproveite `VoiceConversation` e `ConversationHistory`.

## Idioma

- UI e mensagens ao usuário em português (pt-BR). Prompts do tutor em inglês
  (em `src/core/gemini/prompts.ts` e nos módulos).
