import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'

/**
 * Contexto livre que um módulo passa ao construir o prompt do tutor.
 * Ex.: o tópico atual, dados da música, cenário escolhido, etc.
 */
export interface ModulePromptContext {
  topic?: string
  details?: Record<string, unknown>
}

/**
 * Contrato que todo módulo de estudo precisa implementar.
 *
 * Para adicionar um módulo novo:
 *  1. Crie uma pasta em `src/modules/<seu-modulo>`
 *  2. Exporte um objeto que implemente `LearningModule`
 *  3. Registre-o em `src/core/modules/registry.ts`
 *
 * O restante do app (navegação, rotas e histórico) passa a reconhecer
 * o módulo automaticamente.
 */
export interface LearningModule {
  /** Id único e estável. Também é a "scope" usada para separar o histórico. */
  id: string
  /** Nome exibido (pt-BR). */
  title: string
  /** Descrição curta exibida na Home. */
  description: string
  /** Ícone do módulo. */
  icon: ReactNode
  /** Caminho base da rota, relativo à raiz do app. Ex.: "modules/work". */
  path: string
  /** Rotas aninhadas renderizadas dentro do layout principal. */
  routes: RouteObject[]
  /**
   * Constrói a system instruction que define o comportamento do tutor
   * neste módulo (foco, estilo de correção, etc.).
   */
  buildSystemPrompt: (ctx?: ModulePromptContext) => string
}
