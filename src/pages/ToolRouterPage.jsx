import { useParams } from 'react-router-dom'
import TextTransformToolPage from './TextTransformToolPage'
import Pacman from './Pacman'
import NotFoundPage from './NotFoundPage'

const TOOL_MAP = {
  'text-transform': TextTransformToolPage,
  pacman: Pacman,
}

export default function ToolRouterPage() {
  const { route } = useParams()
  const ToolComponent = TOOL_MAP[route]

  if (!ToolComponent) {
    return <NotFoundPage />
  }

  return <ToolComponent />
}
