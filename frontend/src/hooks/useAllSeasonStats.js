import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const PAGE_SIZE = 1000

// Fetches every season row (all players) once, so league-average reference
// lines can be computed client-side without a dedicated DB view.
export function useAllSeasonStats() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      const all = []
      let from = 0
      while (true) {
        const { data, error } = await supabase
          .from('skater_season_stats')
          .select('player_id, season, games_played, points, toi_per_game_sec')
          .range(from, from + PAGE_SIZE - 1)

        if (error || cancelled) return
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

  return rows
}
