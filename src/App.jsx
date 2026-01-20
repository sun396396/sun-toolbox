import { Link, Route, Routes } from 'react-router-dom'

function HomePage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>阿布吉工具箱</h1>
      <p>一個可擴充的小工具平台（Vite + React + Supabase + Netlify）</p>

      <h2>工具</h2>
      <ul>
        <li>
          <Link to="/tools/hello">Hello Tool</Link>
        </li>
      </ul>
    </div>
  )
}

function HelloToolPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Hello Tool</h1>
      <p>這是一個示範工具頁，之後每個小工具都會是獨立 route + 模組。</p>
      <p>
        <Link to="/">回首頁</Link>
      </p>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>404</h1>
      <p>
        <Link to="/">回首頁</Link>
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tools/hello" element={<HelloToolPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
