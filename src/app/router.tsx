import { createHashRouter } from 'react-router-dom'
import { AppGate } from './AppGate'
import { Home } from '@/pages/Home'
import { Settings } from '@/pages/Settings'
import { moduleRegistry } from '@/core/modules/registry'

/**
 * Usamos HashRouter porque o app é hospedado como site estático no GitHub
 * Pages, onde rotas "de verdade" (BrowserRouter) dariam 404 ao recarregar.
 *
 * As rotas dos módulos são injetadas automaticamente a partir do registry.
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppGate />,
    children: [
      { index: true, element: <Home /> },
      ...moduleRegistry.flatMap((m) => m.routes),
      { path: 'settings', element: <Settings /> },
    ],
  },
])
