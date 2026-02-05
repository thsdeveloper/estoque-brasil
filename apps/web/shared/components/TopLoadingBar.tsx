"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar"

interface TopLoadingBarProps {
  color?: string
  height?: number
}

export function TopLoadingBar({
  color = "#f97316", // brand-orange
  height = 3
}: TopLoadingBarProps) {
  const loadingBarRef = useRef<LoadingBarRef>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadingBarRef.current?.complete()
  }, [pathname, searchParams])

  return (
    <LoadingBar
      ref={loadingBarRef}
      color={color}
      height={height}
      shadow={true}
      transitionTime={200}
      waitingTime={400}
    />
  )
}
