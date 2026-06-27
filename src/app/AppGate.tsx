import { useEffect } from 'react'
import { useSettings } from '@/core/settings/store'
import { AppLayout } from './AppLayout'
import { Onboarding } from '@/pages/Onboarding'
import { Unlock } from '@/pages/Unlock'
import { Splash } from '@/components/Splash'

/**
 * Decide o que renderizar antes de liberar o app:
 * - carrega o estado do dispositivo (init)
 * - pede a chave (onboarding) ou o PIN (unlock) quando necessário
 * - só então renderiza o layout com as rotas (Outlet)
 */
export function AppGate() {
  const status = useSettings((s) => s.status)
  const init = useSettings((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

  if (status === 'loading') return <Splash />
  if (status === 'onboarding') return <Onboarding />
  if (status === 'locked') return <Unlock />
  return <AppLayout />
}
