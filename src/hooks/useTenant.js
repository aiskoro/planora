import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTenant() {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [eroare, setEroare] = useState(null)

  useEffect(() => {
    async function detectTenant() {
      const hostname = window.location.hostname
      let slug = 'demo'

      if (
        hostname !== 'localhost' &&
        hostname !== 'timevia.ro' &&
        hostname !== 'www.timevia.ro'
      ) {
        slug = hostname.split('.')[0]
      }

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .eq('activ', true)
        .single()

      if (error || !data) {
        setEroare('Platforma nu a fost găsită.')
        setLoading(false)
        return
      }

      setTenant(data)
      setLoading(false)
    }

    detectTenant()
  }, [])

  return { tenant, loading, eroare }
}