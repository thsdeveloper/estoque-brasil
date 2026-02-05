"use client"

import Link, { LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef, useCallback } from "react"
import { useLoadingBar } from "@/shared/providers"

interface LinkWithLoadingProps extends LinkProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export const LinkWithLoading = forwardRef<HTMLAnchorElement, LinkWithLoadingProps>(
  ({ href, onClick, children, ...props }, ref) => {
    const { start } = useLoadingBar()
    const router = useRouter()

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Call original onClick if exists
        onClick?.(e)

        // Don't start loading for external links, hash links, or if default prevented
        if (e.defaultPrevented) return

        const url = typeof href === "string" ? href : href.pathname || ""

        // Skip loading bar for external links
        if (url.startsWith("http") || url.startsWith("//")) return

        // Skip loading bar for hash links on same page
        if (url.startsWith("#")) return

        // Start the loading bar
        start()
      },
      [href, onClick, start]
    )

    return (
      <Link ref={ref} href={href} onClick={handleClick} {...props}>
        {children}
      </Link>
    )
  }
)

LinkWithLoading.displayName = "LinkWithLoading"
