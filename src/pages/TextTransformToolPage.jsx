import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'

export default function TextTransformToolPage() {
  const [value, setValue] = useState('')

  const stats = useMemo(() => {
    const chars = value.length
    const lines = value ? value.split('\n').length : 0
    return { chars, lines }
  }, [value])

  return (
    <main className="container" style={{ paddingTop: '6vh', paddingBottom: '8vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="badge" style={{ marginBottom: 14 }}>
            Tool
            <span className="muted">/</span>
            文字轉換
          </div>
          <h1 className="h1">文字轉換工具</h1>
          <p className="p" style={{ marginTop: 12 }}>
            Apple 風格的快速轉換：大寫、小寫、清空。
          </p>
        </div>

        <Link className="btn" to="/">回到首頁</Link>
      </div>

      <div style={{ height: 24 }} />

      <GlassCard style={{ padding: 18 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="在這裡輸入文字..."
            style={{
              width: '100%',
              minHeight: 180,
              resize: 'vertical',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,.10)',
              background: 'rgba(0,0,0,.20)',
              color: 'rgba(255,255,255,.92)',
              padding: 14,
              outline: 'none',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setValue((v) => v.toUpperCase())}>
                轉大寫
              </button>
              <button className="btn" onClick={() => setValue((v) => v.toLowerCase())}>
                轉小寫
              </button>
              <button className="btn btn-danger" onClick={() => setValue('')}>
                清空
              </button>
            </div>

            <div className="muted" style={{ fontSize: 12 }}>
              {stats.chars} 字元 · {stats.lines} 行
            </div>
          </div>
        </div>
      </GlassCard>
    </main>
  )
}
