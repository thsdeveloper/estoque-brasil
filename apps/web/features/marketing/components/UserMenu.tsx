"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut, LayoutDashboard } from "lucide-react"

import { useAuth } from "@/features/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

function getInitials(email: string): string {
  const name = email.split("@")[0]
  const parts = name.split(/[._-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-gray-300 hover:text-[#f84704] font-medium transition-colors duration-300"
      >
        <User className="h-5 w-5" />
        <span>Entrar</span>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border-2 border-transparent hover:border-[#f84704] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#f84704] focus:ring-offset-2 focus:ring-offset-[#343434]">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email ?? ""} />
            <AvatarFallback className="bg-[#f84704] text-white text-sm">
              {getInitials(user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium truncate">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/admin" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Painel Admin</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/admin/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
