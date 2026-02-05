"use client"

import { useRouter } from "next/navigation"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "@/features/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"

function getInitials(name: string | undefined, email: string | undefined): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return "U"
}

export function UserMenu() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name
  const userEmail = user?.email
  const userAvatar = user?.user_metadata?.avatar_url

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userAvatar} alt={userName || "Avatar do usuário"} />
            <AvatarFallback className="bg-zinc-800 text-white text-sm">
              {getInitials(userName, userEmail)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {userName && (
              <p className="text-sm font-medium leading-none">{userName}</p>
            )}
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/admin/perfil")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push("/admin/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
