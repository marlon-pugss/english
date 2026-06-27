import type { LearningModule } from './types'
import { workModule } from '@/modules/work'
import { musicModule } from '@/modules/music'

/**
 * Registro central de módulos.
 *
 * Esta é a ÚNICA lista que precisa ser tocada para habilitar um módulo novo:
 * basta importar e adicionar aqui. A ordem define a ordem de exibição na Home.
 */
export const moduleRegistry: LearningModule[] = [workModule, musicModule]

export function getModule(id: string): LearningModule | undefined {
  return moduleRegistry.find((m) => m.id === id)
}
