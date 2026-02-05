"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useLoadingBar } from "@/shared/providers"

export function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { complete } = useLoadingBar()

  useEffect(() => {
    // Complete loading bar when navigation finishes
    complete()
  }, [pathname, searchParams, complete])

  return null
}
