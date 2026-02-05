"use client"

import { createContext, useContext, useRef, useCallback, Suspense, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar"

interface LoadingBarContextType {
  start: () => void
  complete: () => void
  increase: (value: number) => void
}

const LoadingBarContext = createContext<LoadingBarContextType | null>(null)

function LoadingBarContent({
  loadingBarRef,
  color,
  height
}: {
  loadingBarRef: React.RefObject<LoadingBarRef | null>
  color: string
  height: number
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadingBarRef.current?.complete()
  }, [pathname, searchParams, loadingBarRef])

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

interface LoadingBarProviderProps {
  children: React.ReactNode
  color?: string
  height?: number
}

export function LoadingBarProvider({
  children,
  color = "#f97316",
  height = 3
}: LoadingBarProviderProps) {
  const loadingBarRef = useRef<LoadingBarRef>(null)

  const start = useCallback(() => {
    loadingBarRef.current?.continuousStart()
  }, [])

  const complete = useCallback(() => {
    loadingBarRef.current?.complete()
  }, [])

  const increase = useCallback((value: number) => {
    loadingBarRef.current?.increase(value)
  }, [])

  // Intercept link clicks to start loading bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")

      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href) return

      // Skip external links
      if (href.startsWith("http") || href.startsWith("//") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return
      }

      // Skip hash links
      if (href.startsWith("#")) return

      // Skip if target is _blank
      if (anchor.target === "_blank") return

      // Skip if modifier keys are pressed (open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      // Skip if download attribute
      if (anchor.hasAttribute("download")) return

      // Start loading bar for internal navigation
      loadingBarRef.current?.continuousStart()
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <LoadingBarContext.Provider value={{ start, complete, increase }}>
      <Suspense fallback={null}>
        <LoadingBarContent
          loadingBarRef={loadingBarRef}
          color={color}
          height={height}
        />
      </Suspense>
      {children}
    </LoadingBarContext.Provider>
  )
}

export function useLoadingBar() {
  const context = useContext(LoadingBarContext)
  if (!context) {
    throw new Error("useLoadingBar must be used within a LoadingBarProvider")
  }
  return context
}
