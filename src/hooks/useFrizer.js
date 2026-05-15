import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
      setIsMaster(userId === MASTER_ID)

      const { data } = await supabase
        .from('frizeri')
        .select('*')
        .eq('user_id', userId)
        .single()

      setFrizer(data || null)
      setLoading(false)
    }
    fetch()
  }, [])

  return { frizer, isMaster, loading }
}