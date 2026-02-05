"use client"

import { Bell, Wrench, Sparkles } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

interface Notification {
  id: string
  title: string
  message: string
  icon: React.ElementType
  time: string
  read: boolean
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "Sistema de Notificações",
    message: "Estamos trabalhando no sistema de notificações em tempo real. Em breve você receberá alertas importantes aqui.",
    icon: Wrench,
    time: "Agora",
    read: false,
  },
  {
    id: "2",
    title: "Novidades em breve",
    message: "Novas funcionalidades estão sendo desenvolvidas para melhorar sua experiência. Fique atento!",
    icon: Sparkles,
    time: "Agora",
    read: false,
  },
]

export function NotificationsMenu() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-zinc-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-normal text-zinc-600">
              {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex gap-3 p-3 hover:bg-zinc-50 cursor-pointer transition-colors"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                notification.read ? "bg-zinc-100" : "bg-orange-100"
              }`}>
                <notification.icon className={`h-4 w-4 ${
                  notification.read ? "text-zinc-500" : "text-orange-600"
                }`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-tight ${
                    notification.read ? "font-normal text-zinc-600" : "font-medium text-zinc-900"
                  }`}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500 mt-1" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {notification.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs text-zinc-500" disabled>
            Ver todas as notificações
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
