import { Navigate, useParams } from 'react-router-dom'
import TextTransformToolPage from './TextTransformToolPage'
import NotFoundPage from './NotFoundPage'

const TOOL_MAP = {
  'text-transform': TextTransformToolPage,
}

export default function ToolRouterPage() {
  const { route } = useParams()
  const ToolComponent = TOOL_MAP[route]

  if (route === 'hello') return <Navigate to="/tools/text-transform" replace />

  if (!ToolComponent) {
    return <NotFoundPage />
  }

  return <ToolComponent />
}
