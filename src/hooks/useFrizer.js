import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// MASTER_ID este per-tenant — masterul unui tenant e primul user cu rol master
// Pentru backward compatibility, păstrăm și MASTER_ID global pentru demo
const MASTER_ID = '0eabcc9b-8972-4b40-ab03-bcb835204d65'

export function useFrizer() {
  const [frizer, setFrizer] = useState(null)
  const [isMaster, setIsMaster] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const userId = session.user.id

      const { data: angajat } = await supabase
        .from('frizeri')
        .select('*, tenants(slug, nume_afacere)')
        .eq('user_id', userId)
        .single()

      setFrizer(angajat || null)

      // isMaster = true dacă e MASTER_ID global SAU dacă are rol master în tenant
      setIsMaster(userId === MASTER_ID || angajat?.is_master === true)

      setLoading(false)
    }
    fetch()
  }, [])

  return { frizer, isMaster, loading }
}