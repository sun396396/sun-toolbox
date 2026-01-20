import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import PacmanGame from '../components/PacmanGame'
import { supabase } from '../lib/supabase'
import '../styles/pacman.css'

export default function Pacman() {
  const [tool, setTool] = useState({
    name: 'Pac-Man 吃豆人',
    description: '在玻璃擬態介面中，享受經典吃豆人的高質感版本。',
    route: 'pacman',
  })

  useEffect(() => {
    let active = true

    async function loadTool() {
      try {
        const { data, error } = await supabase
          .from('tools')
          .select('id, name, description, route')
          .eq('route', 'pacman')
          .maybeSingle()

        if (error) throw error
        if (!active) return
        if (data) {
          setTool(data)
        }
      } catch {
        // ignore, fallback is fine
      }
    }

    loadTool()

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="container" style={{ paddingTop: '6vh', paddingBottom: '8vh' }}>
      <div className="pacman-topbar">
        <div>
          <div className="badge" style={{ marginBottom: 14 }}>
            Tool
            <span className="muted">/</span>
            {tool.name}
          </div>
          <h1 className="h1">Pac-Man 吃豆人</h1>
          <p className="p" style={{ marginTop: 12 }}>{tool.description}</p>
        </div>

        <div className="pacman-actions">
          <Link className="btn" to="/">回到首頁</Link>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <GlassCard className="pacman-shell">
        <PacmanGame />
      </GlassCard>

      <div style={{ height: 14 }} />

      <div className="pacman-hint muted">
        鍵盤方向鍵控制移動。碰到鬼怪就 Game Over。吃掉豆子提升分數。
      </div>
    </main>
  )
}
