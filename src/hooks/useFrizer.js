import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// useFrizer(tenantId) — necesită tenantId (din useTenant()) ca să știe
// pentru care tenant se caută rândul din `frizeri`. Fără tenantId, hook-ul
// așteaptă (loading rămâne true) în loc să interogheze fără scop de tenant —
// altfel un cont cu rând master pe alt tenant ar fi returnat oricum, indiferent
// de subdomeniul curent.
//
// IMPORTANT: NU folosim supabase.auth.getSession() aici (apel unic, o singura
// data). La o incarcare proaspata de pagina, SDK-ul Supabase restaureaza
// sesiunea din localStorage asincron -- daca getSession() e apelat exact in
// fereastra aia, poate intoarce null chiar daca userul e logat corect, si
// codul nu mai reincearca niciodata, ramanand blocat pe "fara acces" pana la
// refresh manual (bug real, confirmat live pe contul Catei / Nails).
// onAuthStateChange se declanseaza garantat cu sesiunea deja restaurata
// (evenimentul initial), plus la orice schimbare ulterioara -- elimina cursa.
export function useFrizer(tenantId) {
  const [frizer, setFrizer] = useState(null)
  const [isMaster, setIsMaster] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return

    let activ = true

    async function incarcaFrizer(userId) {
      const { data: angajat } = await supabase
        .from('frizeri')
        .select('*, tenants(slug, nume_afacere)')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .single()

      if (!activ) return

      setFrizer(angajat || null)

      // isMaster = doar dacă are rând legitim în frizeri, PE ACEST TENANT,
      // cu is_master = true. Fără bypass global, fără căutare cross-tenant.
      setIsMaster(angajat?.is_master === true)

      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        if (activ) {
          setFrizer(null)
          setIsMaster(false)
          setLoading(false)
        }
        return
      }
      incarcaFrizer(session.user.id)
    })

    return () => {
      activ = false
      subscription.unsubscribe()
    }
  }, [tenantId])

  return { frizer, isMaster, loading }
}