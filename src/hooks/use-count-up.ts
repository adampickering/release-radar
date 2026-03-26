import { useEffect, useRef, useState } from 'react'

/**
 * Animate a number from 0 to `target` over `duration` ms with ease-out.
 * Returns the current display value as a formatted string.
 * Integers stay integers, decimals keep one decimal place.
 */
export function useCountUp(target: number, duration = 400): string {
  const [display, setDisplay] = useState('0')
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const prevTargetRef = useRef<number>(0)

  useEffect(() => {
    const isDecimal = target % 1 !== 0
    const from = prevTargetRef.current
    prevTargetRef.current = target

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    if (target === 0) {
      setDisplay(isDecimal ? '0.0' : '0')
      return
    }

    startTimeRef.current = 0

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const t = Math.min(elapsed / duration, 1)
      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - (1 - t) ** 3
      const current = from + (target - from) * eased

      setDisplay(isDecimal ? current.toFixed(1) : String(Math.round(current)))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return display
}
