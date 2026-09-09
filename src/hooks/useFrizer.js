import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// useFrizer(tenantId) — necesită tenantId (din useTenant()) ca să știe
// pentru care tenant se caută rândul din `frizeri`. Fără tenantId, hook-ul
// așteaptă (loading rămâne true) în loc să interogheze fără scop de tenant —
// altfel un cont cu rând master pe alt tenant ar fi returnat oricum, indiferent
// de subdomeniul curent.
export function useFrizer(tenantId) {
  const [frizer, setFrizer] = useState(null)
  const [isMaster, setIsMaster] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      if (!tenantId) return

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const userId = session.user.id

      const { data: angajat } = await supabase
        .from('frizeri')
        .select('*, tenants(slug, nume_afacere)')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .single()

      setFrizer(angajat || null)

      // isMaster = doar dacă are rând legitim în frizeri, PE ACEST TENANT,
      // cu is_master = true. Fără bypass global, fără căutare cross-tenant.
      setIsMaster(angajat?.is_master === true)

      setLoading(false)
    }
    fetch()
  }, [tenantId])

  return { frizer, isMaster, loading }
}
