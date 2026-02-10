"use client"

import { Menu } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { EmpresaSelector } from "@/features/empresas"
import { NotificationsMenu } from "./NotificationsMenu"
import { UserMenu } from "./UserMenu"

interface AdminHeaderProps {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-border bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <span className="sr-only">Abrir menu</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>

        <Separator orientation="vertical" className="h-6 lg:hidden" />
        <EmpresaSelector />
      </div>

      <div className="flex items-center gap-x-2">
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  )
}
