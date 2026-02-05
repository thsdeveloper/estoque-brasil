import { createClient } from "@/lib/supabase/server"
import {
  Users,
  Building2,
  Store,
  ClipboardList,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"
import Link from "next/link"

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: totalClients },
    { count: totalEmpresas },
    { count: totalLojas },
    { count: totalInventarios },
    { count: inventariosAtivos },
    { count: totalProdutos },
    { count: totalContagens },
    { count: totalDivergentes },
    { data: recentInventarios },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("empresas").select("*", { count: "exact", head: true }),
    supabase.from("lojas").select("*", { count: "exact", head: true }),
    supabase.from("inventarios").select("*", { count: "exact", head: true }),
    supabase.from("inventarios").select("*", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("inventarios_produtos").select("*", { count: "exact", head: true }),
    supabase.from("inventarios_contagens").select("*", { count: "exact", head: true }),
    supabase.from("inventarios_contagens").select("*", { count: "exact", head: true }).eq("divergente", true),
    supabase
      .from("inventarios")
      .select(`
        id,
        data_inicio,
        data_termino,
        ativo,
        lojas (nome),
        empresas (nome_fantasia, razao_social)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return {
    totalClients: totalClients || 0,
    totalEmpresas: totalEmpresas || 0,
    totalLojas: totalLojas || 0,
    totalInventarios: totalInventarios || 0,
    inventariosAtivos: inventariosAtivos || 0,
    totalProdutos: totalProdutos || 0,
    totalContagens: totalContagens || 0,
    totalDivergentes: totalDivergentes || 0,
    recentInventarios: recentInventarios || [],
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const mainStats = [
    {
      name: "Clientes",
      value: stats.totalClients,
      icon: Users,
      href: "/admin/clients",
      color: "bg-blue-500",
    },
    {
      name: "Empresas",
      value: stats.totalEmpresas,
      icon: Building2,
      href: "/admin/empresas",
      color: "bg-purple-500",
    },
    {
      name: "Lojas",
      value: stats.totalLojas,
      icon: Store,
      href: "/admin/clients",
      color: "bg-green-500",
    },
    {
      name: "Inventários",
      value: stats.totalInventarios,
      icon: ClipboardList,
      href: "/admin/inventarios",
      color: "bg-orange-500",
    },
  ]

  const inventoryStats = [
    {
      name: "Inventários Ativos",
      value: stats.inventariosAtivos,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Produtos Cadastrados",
      value: stats.totalProdutos,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Total de Contagens",
      value: stats.totalContagens,
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Itens Divergentes",
      value: stats.totalDivergentes,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Visão geral do sistema de inventário de estoque
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  {stat.value.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
              <div className={`h-full ${stat.color} w-1/3`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Inventory Stats */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Resumo de Inventários
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {inventoryStats.map((stat) => (
            <div
              key={stat.name}
              className={`${stat.bgColor} rounded-xl p-5 border border-zinc-100`}
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm font-medium text-zinc-600">
                  {stat.name}
                </span>
              </div>
              <p className={`mt-3 text-2xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Inventories & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Inventories */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Inventários Recentes
            </h2>
            <Link
              href="/admin/inventarios"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          {stats.recentInventarios.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInventarios.map((inv: any) => (
                <Link
                  key={inv.id}
                  href={`/admin/inventarios/${inv.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        inv.ativo ? "bg-green-500" : "bg-zinc-300"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {inv.lojas?.nome || `Inventário #${inv.id}`}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {inv.empresas?.nome_fantasia || inv.empresas?.razao_social || "Empresa não informada"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        inv.ativo
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {inv.ativo ? "Ativo" : "Finalizado"}
                    </span>
                    <p className="mt-1 text-xs text-zinc-400">
                      {new Date(inv.data_inicio).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-2 text-sm text-zinc-500">
                Nenhum inventário cadastrado
              </p>
              <Link
                href="/admin/inventarios/new"
                className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Criar primeiro inventário
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/inventarios/new"
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors group"
            >
              <ClipboardList className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm font-medium text-zinc-700">
                Novo Inventário
              </span>
            </Link>
            <Link
              href="/admin/clients"
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
              <Users className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm font-medium text-zinc-700">
                Gerenciar Clientes
              </span>
            </Link>
            <Link
              href="/admin/empresas"
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
            >
              <Building2 className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm font-medium text-zinc-700">
                Gerenciar Empresas
              </span>
            </Link>
            <Link
              href="/admin/relatorios/gerar"
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
            >
              <TrendingUp className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-sm font-medium text-zinc-700">
                Gerar Relatório
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Estoque Brasil</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Sistema completo de gestão e controle de inventários de estoque.
          Gerencie clientes, lojas, empresas e realize inventários com
          acompanhamento em tempo real de contagens, divergências e relatórios.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">{stats.totalClients}</p>
            <p className="text-xs text-zinc-400">Clientes</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">{stats.totalLojas}</p>
            <p className="text-xs text-zinc-400">Lojas</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">{stats.inventariosAtivos}</p>
            <p className="text-xs text-zinc-400">Inventários Ativos</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">{stats.totalContagens}</p>
            <p className="text-xs text-zinc-400">Contagens</p>
          </div>
        </div>
      </div>
    </div>
  )
}
