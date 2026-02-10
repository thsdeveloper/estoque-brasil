"use client"

import { useState, useEffect } from "react"
import { AdminSidebar, AdminHeader } from "@/features/admin-layout"
import { Sheet, SheetContent } from "@/shared/components/ui/sheet"
import { PermissionsProvider } from "@/features/usuarios"
import { EmpresaProvider } from "@/features/empresas"
import { cn } from "@/shared/lib/utils"

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
    setIsHydrated(true)
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newValue))
  }

  return (
    <PermissionsProvider>
      <EmpresaProvider>
        <div className="min-h-screen bg-neutral">
          {/* Mobile sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-72 p-0">
              <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Desktop sidebar */}
          <div
            className={cn(
              "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
              isHydrated
                ? sidebarCollapsed ? "lg:w-16" : "lg:w-72"
                : "lg:w-72"
            )}
          >
            <AdminSidebar
              collapsed={isHydrated ? sidebarCollapsed : false}
              onToggleCollapse={toggleCollapsed}
            />
          </div>

          {/* Main content */}
          <div
            className={cn(
              "transition-all duration-300",
              isHydrated
                ? sidebarCollapsed ? "lg:pl-16" : "lg:pl-72"
                : "lg:pl-72"
            )}
          >
            <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
            <main className="py-6">
              <div className="px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </EmpresaProvider>
    </PermissionsProvider>
  )
}
