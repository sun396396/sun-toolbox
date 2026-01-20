import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DIR = {
  none: { x: 0, y: 0 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
}

const KEY_TO_DIR = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
}

// 0 = wall, 1 = pellet, 2 = empty
const MAP = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0],
  [0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,1,0,1,0,0,2,0,1,0,1,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

function cloneMap() {
  return MAP.map(row => row.slice())
}

function distManhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function canMove(grid, x, y) {
  const yy = Math.floor(y)
  const xx = Math.floor(x)
  if (yy < 0 || yy >= grid.length) return false
  if (xx < 0 || xx >= grid[0].length) return false
  return grid[yy][xx] !== 0
}

function nearestCellCenter(v) {
  return Math.round(v - 0.5) + 0.5
}

function snapToCenter(pos, axis) {
  const snapped = nearestCellCenter(pos[axis])
  return { ...pos, [axis]: snapped }
}

export default function usePacmanGame() {
  const [state, setState] = useState({
    status: 'idle', // idle | running | gameover
    score: 0,
  })

  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const rafRef = useRef(0)
  const lastRef = useRef(0)

  const gridRef = useRef(cloneMap())

  const worldRef = useRef({
    tile: 32,
    pacman: {
      pos: { x: 1.5, y: 1.5 },
      dir: 'none',
      wantDir: 'none',
      speed: 6.0, // tiles per second
      radius: 0.38,
      mouth: 0,
    },
    ghost: {
      pos: { x: 12.5, y: 10.5 },
      dir: 'left',
      speed: 5.2,
      radius: 0.36,
      color: '#FF4D6D',
    },
    pelletsLeft: 0,
  })

  const dims = useMemo(() => {
    return {
      rows: MAP.length,
      cols: MAP[0].length,
    }
  }, [])

  const countPellets = useCallback(() => {
    let n = 0
    const grid = gridRef.current
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        if (grid[y][x] === 1) n++
      }
    }
    worldRef.current.pelletsLeft = n
  }, [])

  const setCanvas = useCallback((canvas) => {
    if (!canvas) return
    canvasRef.current = canvas
    ctxRef.current = canvas.getContext('2d')
  }, [])

  const resetWorld = useCallback(() => {
    gridRef.current = cloneMap()
    countPellets()

    worldRef.current.pacman.pos = { x: 1.5, y: 1.5 }
    worldRef.current.pacman.dir = 'none'
    worldRef.current.pacman.wantDir = 'none'
    worldRef.current.pacman.mouth = 0

    worldRef.current.ghost.pos = { x: 12.5, y: 10.5 }
    worldRef.current.ghost.dir = 'left'

    setState({ status: 'idle', score: 0 })
  }, [countPellets])

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    lastRef.current = 0
  }, [])

  const gameOver = useCallback(() => {
    setState((s) => ({ ...s, status: 'gameover' }))
    stopLoop()
  }, [stopLoop])

  const tryTurn = useCallback((entity, grid) => {
    const want = entity.wantDir
    if (want === 'none') return

    const dx = DIR[want].x
    const dy = DIR[want].y

    // only allow turn near center to keep movement clean
    const nearCenterX = Math.abs(entity.pos.x - nearestCellCenter(entity.pos.x)) < 0.12
    const nearCenterY = Math.abs(entity.pos.y - nearestCellCenter(entity.pos.y)) < 0.12

    // moving horizontally -> allow vertical turn when x is centered, and vice versa
    if ((want === 'up' || want === 'down') && !nearCenterX) return
    if ((want === 'left' || want === 'right') && !nearCenterY) return

    const nx = entity.pos.x + dx * 0.55
    const ny = entity.pos.y + dy * 0.55

    if (canMove(grid, nx, ny)) {
      // snap to grid line on the perpendicular axis
      if (want === 'up' || want === 'down') {
        entity.pos = snapToCenter(entity.pos, 'x')
      } else {
        entity.pos = snapToCenter(entity.pos, 'y')
      }
      entity.dir = want
    }
  }, [])

  const moveEntity = useCallback((entity, grid, dt) => {
    const dir = entity.dir
    const v = entity.speed * dt

    const dx = DIR[dir].x
    const dy = DIR[dir].y

    if (dir === 'none') return

    const nx = entity.pos.x + dx * v
    const ny = entity.pos.y + dy * v

    if (canMove(grid, nx, ny)) {
      entity.pos.x = nx
      entity.pos.y = ny
    } else {
      // hit wall, stop and snap
      if (dir === 'left' || dir === 'right') {
        entity.pos.x = clamp(entity.pos.x, 0.5, dims.cols - 0.5)
        entity.pos.x = nearestCellCenter(entity.pos.x)
      } else {
        entity.pos.y = clamp(entity.pos.y, 0.5, dims.rows - 0.5)
        entity.pos.y = nearestCellCenter(entity.pos.y)
      }
      entity.dir = 'none'
    }
  }, [dims.cols, dims.rows])

  const chooseGhostDir = useCallback((ghost, pacman, grid) => {
    const dirs = ['left', 'right', 'up', 'down']

    const possible = dirs
      .map((d) => {
        const dx = DIR[d].x
        const dy = DIR[d].y
        const nx = ghost.pos.x + dx * 0.65
        const ny = ghost.pos.y + dy * 0.65
        return { d, ok: canMove(grid, nx, ny) }
      })
      .filter((x) => x.ok)
      .map((x) => x.d)

    if (possible.length === 0) return 'none'

    // avoid immediate reverse unless needed
    const reverse = {
      left: 'right',
      right: 'left',
      up: 'down',
      down: 'up',
      none: 'none',
    }[ghost.dir]

    const candidates = possible.length > 1 ? possible.filter((d) => d !== reverse) : possible

    // greedy chase: pick dir that reduces manhattan distance
    let best = candidates[0]
    let bestDist = Infinity

    for (const d of candidates) {
      const dx = DIR[d].x
      const dy = DIR[d].y
      const next = { x: ghost.pos.x + dx * 1.0, y: ghost.pos.y + dy * 1.0 }
      const dist = distManhattan(next, pacman.pos)
      if (dist < bestDist) {
        bestDist = dist
        best = d
      }
    }

    // slight randomness to feel less robotic
    if (Math.random() < 0.08) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }

    return best
  }, [])

  const step = useCallback((dt) => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    const grid = gridRef.current
    const world = worldRef.current

    const pac = world.pacman
    const ghost = world.ghost

    // input turn
    tryTurn(pac, grid)

    // move
    moveEntity(pac, grid, dt)

    // eat pellet at pacman cell
    const cx = Math.floor(pac.pos.x)
    const cy = Math.floor(pac.pos.y)
    if (grid[cy] && grid[cy][cx] === 1) {
      grid[cy][cx] = 2
      world.pelletsLeft -= 1
      setState((s) => ({ ...s, score: s.score + 10 }))
    }

    // ghost AI: choose dir when near cell center (like intersections)
    const nearX = Math.abs(ghost.pos.x - nearestCellCenter(ghost.pos.x)) < 0.12
    const nearY = Math.abs(ghost.pos.y - nearestCellCenter(ghost.pos.y)) < 0.12
    if (nearX && nearY) {
      ghost.dir = chooseGhostDir(ghost, pac, grid)
    }

    moveEntity(ghost, grid, dt)

    // collide
    const d = Math.hypot(pac.pos.x - ghost.pos.x, pac.pos.y - ghost.pos.y)
    if (d < (pac.radius + ghost.radius)) {
      gameOver()
      return
    }

    // draw
    render(ctx, canvas, grid, world, dims)

    // update mouth animation
    pac.mouth = (pac.mouth + dt * 10) % (Math.PI * 2)

    // win condition (optional): if no pellets, just idle
    if (world.pelletsLeft <= 0) {
      setState((s) => ({ ...s, status: 'idle' }))
      stopLoop()
    }
  }, [chooseGhostDir, dims, gameOver, moveEntity, stopLoop, tryTurn])

  const loop = useCallback((t) => {
    if (!lastRef.current) lastRef.current = t
    const dt = Math.min(0.033, (t - lastRef.current) / 1000)
    lastRef.current = t

    step(dt)

    rafRef.current = requestAnimationFrame(loop)
  }, [step])

  const start = useCallback(() => {
    setState((s) => ({ ...s, status: 'running' }))
    stopLoop()
    rafRef.current = requestAnimationFrame(loop)
  }, [loop, stopLoop])

  const restart = useCallback(() => {
    stopLoop()
    gridRef.current = cloneMap()
    countPellets()

    const world = worldRef.current
    world.pacman.pos = { x: 1.5, y: 1.5 }
    world.pacman.dir = 'none'
    world.pacman.wantDir = 'none'
    world.pacman.mouth = 0

    world.ghost.pos = { x: 12.5, y: 10.5 }
    world.ghost.dir = 'left'

    setState({ status: 'running', score: 0 })
    rafRef.current = requestAnimationFrame(loop)
  }, [countPellets, loop, stopLoop])

  const bindKeyboard = useCallback(() => {
    function onKeyDown(e) {
      const dir = KEY_TO_DIR[e.key]
      if (!dir) return
      e.preventDefault()
      worldRef.current.pacman.wantDir = dir
      // if standing still, also set current dir
      if (worldRef.current.pacman.dir === 'none') {
        worldRef.current.pacman.dir = dir
      }
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    resetWorld()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    state,
    setCanvas,
    start,
    restart,
    bindKeyboard,
  }
}

function render(ctx, canvas, grid, world, dims) {
  const tile = world.tile

  // Fit-to-canvas: compute scale based on desired tile size and canvas size
  const cols = dims.cols
  const rows = dims.rows

  const pad = 16
  const availW = canvas.width - pad * 2
  const availH = canvas.height - pad * 2

  const t = Math.floor(Math.min(availW / cols, availH / rows))
  const ox = Math.floor((canvas.width - t * cols) / 2)
  const oy = Math.floor((canvas.height - t * rows) / 2)

  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // background
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  bg.addColorStop(0, 'rgba(110,231,255,0.06)')
  bg.addColorStop(1, 'rgba(139,92,246,0.06)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // maze
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = grid[y][x]
      const px = ox + x * t
      const py = oy + y * t

      if (v === 0) {
        // wall
        ctx.fillStyle = 'rgba(110,231,255,0.10)'
        ctx.strokeStyle = 'rgba(110,231,255,0.22)'
        roundRect(ctx, px + 2, py + 2, t - 4, t - 4, 8)
        ctx.fill()
        ctx.stroke()
      } else if (v === 1) {
        // pellet
        ctx.fillStyle = 'rgba(255,255,255,0.72)'
        ctx.beginPath()
        ctx.arc(px + t / 2, py + t / 2, Math.max(2, t * 0.08), 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // pacman
  drawPacman(ctx, world.pacman, { ox, oy, t })

  // ghost
  drawGhost(ctx, world.ghost, { ox, oy, t })

  // subtle vignette
  const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 40, canvas.width / 2, canvas.height / 2, canvas.width / 1.2)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // eslint no-unused-vars
  void tile
}

function drawPacman(ctx, pac, { ox, oy, t }) {
  const px = ox + pac.pos.x * t
  const py = oy + pac.pos.y * t
  const r = pac.radius * t

  const dir = pac.dir
  const dirAngle = {
    right: 0,
    left: Math.PI,
    up: -Math.PI / 2,
    down: Math.PI / 2,
    none: 0,
  }[dir] ?? 0

  const mouth = (Math.sin(pac.mouth) * 0.22 + 0.28)

  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(dirAngle)

  ctx.fillStyle = 'rgba(255, 222, 74, 0.95)'
  ctx.shadowColor = 'rgba(255, 222, 74, 0.22)'
  ctx.shadowBlur = 18

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, r, mouth, Math.PI * 2 - mouth)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

function drawGhost(ctx, ghost, { ox, oy, t }) {
  const px = ox + ghost.pos.x * t
  const py = oy + ghost.pos.y * t
  const r = ghost.radius * t

  ctx.save()
  ctx.translate(px, py)

  ctx.fillStyle = ghost.color
  ctx.shadowColor = 'rgba(255,77,109,0.25)'
  ctx.shadowBlur = 16

  // body
  ctx.beginPath()
  ctx.arc(0, -r * 0.2, r, Math.PI, 0)
  ctx.lineTo(r, r)
  ctx.lineTo(-r, r)
  ctx.closePath()
  ctx.fill()

  // eyes
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  ctx.ellipse(-r * 0.35, -r * 0.15, r * 0.28, r * 0.36, 0, 0, Math.PI * 2)
  ctx.ellipse(r * 0.35, -r * 0.15, r * 0.28, r * 0.36, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
  ctx.beginPath()
  ctx.arc(-r * 0.26, -r * 0.10, r * 0.11, 0, Math.PI * 2)
  ctx.arc(r * 0.44, -r * 0.10, r * 0.11, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
