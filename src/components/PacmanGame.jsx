import { useEffect, useRef } from 'react'
import usePacmanGame from '../hooks/usePacmanGame'

export default function PacmanGame() {
  const canvasRef = useRef(null)

  const {
    state,
    start,
    restart,
    bindKeyboard,
    setCanvas,
  } = usePacmanGame()

  useEffect(() => {
    setCanvas(canvasRef.current)
  }, [setCanvas])

  useEffect(() => {
    return bindKeyboard(window)
  }, [bindKeyboard])

  return (
    <div className="pacman-grid">
      <div className="pacman-hud">
        <div className="pacman-hud-left">
          <div className="pacman-score">
            <div className="pacman-score-label">Score</div>
            <div className="pacman-score-value">{state.score}</div>
          </div>

          <div className="pacman-status">
            <span className={`pacman-pill ${state.status}`}>{state.status.toUpperCase()}</span>
          </div>
        </div>

        <div className="pacman-hud-right">
          {state.status !== 'running' ? (
            <button className="btn btn-primary" onClick={start}>
              {state.status === 'idle' ? 'Start' : 'Restart'}
            </button>
          ) : (
            <button className="btn" onClick={restart}>Restart</button>
          )}
        </div>
      </div>

      <div className="pacman-stage">
        <canvas ref={canvasRef} className="pacman-canvas" width={768} height={512} />

        {state.status === 'gameover' && (
          <div className="pacman-overlay">
            <div className="pacman-overlay-inner">
              <div className="pacman-overlay-title">Game Over</div>
              <div className="pacman-overlay-sub">Final score: {state.score}</div>
              <div style={{ height: 14 }} />
              <button className="btn btn-primary" onClick={restart}>Restart</button>
            </div>
          </div>
        )}
      </div>

      <div className="pacman-footer muted">
        Desktop: 使用方向鍵移動。手機：目前以桌機體驗為主（可正常顯示）。
      </div>
    </div>
  )
}
