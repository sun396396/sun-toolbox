import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import { supabase } from '../lib/supabase'

const FALLBACK_TOOLS = [
  {
    id: 'fallback-1',
    name: '文字轉換工具',
    description: '快速轉換文字為大寫、小寫，或清除內容。',
    route: 'text-transform',
  },
]

export default function HomePage() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function loadTools() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('tools')
          .select('id, name, description, route, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (!active) return
        setTools(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!active) return
        setError(e?.message || '載入工具清單失敗')
        setTools(FALLBACK_TOOLS)
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    loadTools()

    return () => {
      active = false
    }
  }, [])

  const subtitle = useMemo(() => {
    if (loading) return '正在載入你的工具清單…'
    if (error) return '目前使用本機預設工具（Supabase 尚未連線或權限不足）'
    return '高效率 × 高質感的工具集合'
  }, [error, loading])

  return (
    <main className="container" style={{ paddingTop: '8vh', paddingBottom: '8vh' }}>
      <header style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className="badge" style={{ justifyContent: 'center', margin: '0 auto 14px', width: 'fit-content' }}>
          Abuji Toolbox
          <span className="muted">•</span>
          SaaS-grade UI
        </div>

        <h1 className="h1">阿布吉工具箱</h1>
        <p className="p" style={{ marginTop: 16, fontSize: '1.15rem' }}>
          {subtitle}
        </p>
      </header>

      <div className="grid grid-3">
        {(tools || []).map((tool) => (
          <GlassCard
            key={tool.id}
            as={Link}
            to={`/tools/${tool.route}`}
            className="tool-card"
            style={{
              display: 'block',
              padding: '24px',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
          >
            <h2 className="h2" style={{ marginBottom: 8 }}>
              {tool.name}
            </h2>
            <p className="p muted">{tool.description}</p>
          </GlassCard>
        ))}

        <GlassCard
          as="div"
          style={{
            padding: '24px',
            borderStyle: 'dashed',
            opacity: 0.85,
          }}
        >
          <h2 className="h2" style={{ marginBottom: 8 }}>更多工具</h2>
          <p className="p muted">之後會從 Supabase 動態擴充，不需要改前端路由結構。</p>
        </GlassCard>
      </div>

      <style>{`
        .tool-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-1);
        }
      `}</style>
    </main>
  )
}
