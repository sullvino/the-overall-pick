import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const PAGE_SIZE = 1000

export function useDraftData() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      const all = []
      let from = 0
      while (true) {
        const { data, error: err } = await supabase
          .from('v_draft_analysis')
          .select('*')
          .order('draft_year', { ascending: true })
          .order('overall_pick', { ascending: true })
          .range(from, from + PAGE_SIZE - 1)

        if (err) {
          if (!cancelled) setError(err)
          return
        }
        all.push(...data)
        if (data.length < PAGE_SIZE) break
        from += PAGE_SIZE
      }
      if (!cancelled) setRows(all)
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [])

  return { rows, error, loading: rows === null && error === null }
}
