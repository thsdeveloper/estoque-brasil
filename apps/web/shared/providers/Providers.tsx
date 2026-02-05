"use client"

import { LoadingBarProvider } from "./LoadingBarProvider"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <LoadingBarProvider color="#f97316" height={3}>
      {children}
    </LoadingBarProvider>
  )
}
