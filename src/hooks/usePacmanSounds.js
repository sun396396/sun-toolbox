import { useCallback, useEffect, useRef, useState } from 'react'

const SOUND_URLS = {
  bgm: '/sounds/bgm.mp3',
  eatDot: '/sounds/eat-dot.wav',
  eatGhost: '/sounds/eat-ghost.wav',
  gameOver: '/sounds/game-over.wav',
}

export default function usePacmanSounds() {
  const bgmRef = useRef(null)
  const [enabled, setEnabled] = useState(true)

  const safePlay = useCallback(async (audio, { restart = true } = {}) => {
    if (!enabled || !audio) return
    try {
      if (restart) audio.currentTime = 0
      await audio.play()
    } catch {
      // ignore autoplay restrictions
    }
  }, [enabled])

  const ensureBgm = useCallback(() => {
    if (bgmRef.current) return bgmRef.current
    const a = new Audio(SOUND_URLS.bgm)
    a.loop = true
    a.volume = 0.25
    bgmRef.current = a
    return a
  }, [])

  const playBgm = useCallback(async () => {
    const a = ensureBgm()
    await safePlay(a, { restart: false })
  }, [ensureBgm, safePlay])

  const stopBgm = useCallback(() => {
    const a = bgmRef.current
    if (!a) return
    a.pause()
    a.currentTime = 0
  }, [])

  const playEatDot = useCallback(() => {
    const a = new Audio(SOUND_URLS.eatDot)
    a.volume = 0.6
    void safePlay(a)
  }, [safePlay])

  const playEatGhost = useCallback(() => {
    const a = new Audio(SOUND_URLS.eatGhost)
    a.volume = 0.75
    void safePlay(a)
  }, [safePlay])

  const playGameOver = useCallback(() => {
    const a = new Audio(SOUND_URLS.gameOver)
    a.volume = 0.85
    void safePlay(a)
  }, [safePlay])

  const toggleSound = useCallback(() => {
    setEnabled((v) => {
      const next = !v
      if (!next) stopBgm()
      return next
    })
  }, [stopBgm])

  useEffect(() => {
    return () => {
      stopBgm()
    }
  }, [stopBgm])

  return {
    enabled,
    toggleSound,
    playBgm,
    stopBgm,
    playEatDot,
    playEatGhost,
    playGameOver,
  }
}
