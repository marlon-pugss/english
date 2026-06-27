# English Voice Coach

PWA (Progressive Web App) para estudar inglês com foco em **prática de conversação por voz** e **correção de fala**. Toda a inteligência vem do **Google Gemini**, usando a **sua** chave de API, guardada apenas no seu dispositivo. Funciona no navegador, no celular e no desktop, e pode ser instalado como app.

- **Conversa por voz em tempo real** (Gemini Live API): você fala, o tutor entende seu sotaque, responde por voz e corrige pronúncia, gramática e vocabulário.
- **Módulos** organizam o estudo, com histórico salvo por módulo para retomar de onde parou.
  - **Situações de Trabalho**: role-play de dailys, code reviews, descrição de soluções técnicas, reuniões com stakeholders (foco em dev Salesforce).
  - **Músicas**: organize músicas em pastas, busque a letra a partir do nome + um trecho e estude vocabulário e expressões conversando sobre ela.
- Arquitetura **extensível**: adicionar um módulo novo é simples (veja abaixo).

---

## Stack

- **React + TypeScript + Vite**
- **Tailwind CSS v4** (tema escuro)
- **vite-plugin-pwa** (instalável + offline shell)
- **@google/genai** (Gemini: Live API para voz + `generateContent` para texto)
- **Dexie** (IndexedDB) para dados locais
- **Zustand** para estado
- **React Router** (HashRouter, compatível com GitHub Pages)

Sem backend: o app é 100% client-side. As chamadas vão direto do seu navegador para o Google, usando a sua chave.

---

## Pré-requisitos

- **Node.js 20.19+ ou 22+** e npm
- Uma **chave de API do Google Gemini** (gratuita para uso pessoal)
- Navegador moderno com suporte a microfone. **Chrome ou Edge** são os mais indicados para a conversa por voz.

---

## Onde pego a chave do Gemini

1. Acesse o **Google AI Studio**: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google.
3. Clique em **"Create API key" / "Get API key"** e copie a chave (começa com `AIza...`).
4. Abra o app e cole a chave na primeira tela (onboarding). Opcionalmente, defina um **PIN** para criptografar a chave no dispositivo.

A chave **nunca** é enviada a nenhum servidor nosso — ela fica só no seu navegador (IndexedDB) e é usada para falar diretamente com o Gemini.

---

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173). Na primeira vez, o app pede a sua chave do Gemini.

> Dica: a conversa por voz exige **HTTPS ou localhost** para acessar o microfone. `localhost` já funciona.

### Build de produção e preview

```bash
npm run build      # type-check + build (gera dist/)
npm run preview    # serve o build localmente
```

### Lint

```bash
npm run lint
```

---

## Deploy no GitHub Pages

O projeto já vem com um workflow do GitHub Actions (`.github/workflows/deploy.yml`) que builda e publica automaticamente.

1. Crie um repositório no GitHub e suba o código:
   ```bash
   git remote add origin git@github.com:<seu-usuario>/<seu-repo>.git
   git push -u origin main
   ```
2. No GitHub, vá em **Settings → Pages** e em **"Build and deployment" → Source** selecione **"GitHub Actions"**.
3. A cada `push` na branch `main`, o app é publicado em:
   `https://<seu-usuario>.github.io/<seu-repo>/`

### Se o nome do repositório for diferente

O caminho base é configurado em `vite.config.ts` (atualmente `'/english/'`):

```ts
const REPO_BASE = '/english/'
```

Troque para `/<nome-do-seu-repo>/`. Se você usar **domínio próprio** ou um **user/organization site** (`<usuario>.github.io`), use `'/'`.

---

## Como usar

1. **Onboarding**: cole a chave do Gemini (e, se quiser, defina um PIN).
2. Na **Home**, escolha um módulo.
3. **Situações de Trabalho**: escolha um cenário e toque em **"Iniciar conversa"**. Permita o microfone e fale em inglês.
4. **Músicas**: crie uma pasta, adicione uma música (nome + trecho), use **"Buscar letra (IA)"**, revise a letra e converse sobre ela por voz.
5. O **histórico** de cada conversa fica salvo; retome pela seção *"Continue de onde parou"* ou pelas listas de cada módulo.

---

## Privacidade e segurança

- **Chave da API**: salva apenas no dispositivo (IndexedDB). Com um **PIN**, é criptografada com AES-GCM (derivação PBKDF2). Sem o PIN não é possível recuperá-la.
- **Dados de estudo** (músicas, histórico): ficam só no navegador. Use **Configurações → Backup** para exportar/importar um arquivo JSON (a chave não é incluída no backup, por segurança).
- Como é um app client-side, qualquer pessoa com acesso físico ao dispositivo desbloqueado pode usar o app — por isso o PIN é recomendado.

## Custos

A **Live API (áudio)** consome mais tokens que texto. Há um nível gratuito para uso pessoal moderado; acompanhe o uso no Google AI Studio. Modelos usados ficam centralizados em `src/core/gemini/models.ts` (fáceis de trocar).

## Compatibilidade

- **Chrome/Edge (desktop e Android)**: melhor experiência para voz e instalação como PWA.
- **iOS/Safari**: funciona, mas o áudio exige interação do usuário e há limitações em segundo plano. Instale via "Adicionar à Tela de Início".
- Se a conversa por voz não conectar, confira o nome do modelo Live em `src/core/gemini/models.ts`.

---

## Arquitetura e como adicionar um novo módulo

A pasta `src/` está organizada assim:

```
src/
  app/         # bootstrap, roteamento, layout, "portão" (onboarding/PIN)
  core/
    audio/     # captura/reprodução de áudio PCM
    crypto/    # criptografia da chave (PIN)
    gemini/    # cliente, Live API, prompts, modelos
    live/      # hook de conversa por voz
    modules/   # registry + contrato LearningModule
    settings/  # estado global (Zustand)
    storage/   # Dexie (banco) + repositórios + backup
  components/   # UI compartilhada (conversa, histórico, etc.)
  modules/      # cada módulo de estudo
  pages/        # Home, Onboarding, Unlock, Settings
```

Para criar um módulo novo:

1. Crie `src/modules/<seu-modulo>/index.tsx` exportando um objeto que implemente `LearningModule` (veja `src/core/modules/types.ts`): `id`, `title`, `description`, `icon`, `path`, `routes` e `buildSystemPrompt`.
2. Reaproveite o componente `VoiceConversation` para a prática por voz e `ConversationHistory` para o histórico.
3. Registre o módulo em `src/core/modules/registry.ts` (uma linha).

Pronto: navegação, rotas e histórico passam a reconhecer o módulo automaticamente.

---

Gerado com a ajuda do [Devin](https://devin.ai).
