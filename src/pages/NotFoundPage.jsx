import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="container" style={{ paddingTop: '10vh', paddingBottom: '10vh', textAlign: 'center' }}>
      <h1 className="h1">404</h1>
      <p className="p" style={{ marginTop: 10 }}>找不到你要的頁面</p>
      <div style={{ height: 20 }} />
      <Link className="btn" to="/">回首頁</Link>
    </main>
  )
}
