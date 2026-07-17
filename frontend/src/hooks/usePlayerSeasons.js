import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function usePlayerSeasons(playerId) {
  const [seasons, setSeasons] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!playerId) {
      setSeasons(null)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('skater_season_stats')
      .select('season, sequence, team_name, games_played, goals, assists, points, toi_per_game_sec')
      .eq('player_id', playerId)
      .order('season', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        setLoading(false)
        if (error) {
          setSeasons([])
          return
        }
        setSeasons(data)
      })
    return () => {
      cancelled = true
    }
  }, [playerId])

  return { seasons, loading }
}
