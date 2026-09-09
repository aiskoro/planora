import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

      // isMaster = doar dacă are rând legitim în frizeri, cu is_master = true,
      // scopat pe tenant prin RLS. Fără bypass global — un cont autentificat
      // pe subdomeniul altui tenant nu mai devine master acolo doar prin user_id.
      setIsMaster(angajat?.is_master === true)

      setLoading(false)
    }
    fetch()
  }, [])

  return { frizer, isMaster, loading }
}
