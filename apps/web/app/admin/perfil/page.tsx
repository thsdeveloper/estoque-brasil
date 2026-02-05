"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Shield, Save, Loader2, Phone, Clock } from "lucide-react"
import { useAuth } from "@/features/auth"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string | null
  updated_at: string | null
}

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

export default function PerfilPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Erro ao buscar perfil:", error)
        setLoading(false)
        return
      }

      setProfile(data)
      setName(data.full_name || "")
      setPhone(data.phone || "")
      setLoading(false)
    }

    if (!authLoading && user) {
      fetchProfile()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ type: "error", text: "O nome não pode estar vazio" })
      return
    }

    if (!user?.id) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: name.trim(),
          phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: name.trim(),
              phone: phone.trim() || null,
            }
          : null
      )

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      setMessage({ type: "error", text: "Erro ao atualizar perfil. Tente novamente." })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  const userEmail = profile?.email || user?.email
  const userName = profile?.full_name
  const userAvatar = profile?.avatar_url
  const isActive = profile?.is_active ?? true
  const createdAt = profile?.created_at
  const lastLoginAt = profile?.last_login_at

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Meu Perfil</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>Sua foto de identificação no sistema</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userAvatar || undefined} alt={userName || "Avatar do usuário"} />
              <AvatarFallback className="bg-zinc-800 text-white text-2xl">
                {getInitials(userName, userEmail)}
              </AvatarFallback>
            </Avatar>
            <p className="mt-4 text-lg font-medium text-zinc-900">{userName || "-"}</p>
            <p className="text-sm text-zinc-500">{userEmail || "-"}</p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize suas informações de perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="email"
                  value={userEmail || ""}
                  disabled
                  className="pl-10 bg-zinc-50"
                />
              </div>
              <p className="text-xs text-zinc-500">
                O email não pode ser alterado diretamente
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Detalhes sobre sua conta no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="text-sm font-medium text-zinc-900 truncate max-w-[150px]">
                    {userEmail || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Membro desde</p>
                  <p className="text-sm font-medium text-zinc-900">
                    {createdAt
                      ? new Date(createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Último acesso</p>
                  <p className="text-sm font-medium text-zinc-900">
                    {lastLoginAt
                      ? new Date(lastLoginAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Status</p>
                  <p className={`text-sm font-medium ${isActive ? "text-green-600" : "text-red-600"}`}>
                    {isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
