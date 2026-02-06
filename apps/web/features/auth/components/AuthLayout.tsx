import Image from "next/image";
import Link from "next/link";
import { CheckCircle, BarChart3, Shield, Clock } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  {
    icon: CheckCircle,
    title: "Precisão Garantida",
    description: "99,9% de acurácia em todos os inventários realizados",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Dashboards e relatórios completos em tempo real",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Dados protegidos e processos auditáveis",
  },
  {
    icon: Clock,
    title: "Agilidade",
    description: "Inventários realizados em tempo recorde",
  },
];

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Company Info (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#343434] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Orange accent gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#f84704]/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full items-center">
          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg w-full">
            {/* Logo */}
            <Link href="/" className="block mb-8 text-center">
              <Image
                src="/images/logo-estoque.png"
                alt="Estoque Brasil Inventários"
                width={300}
                height={75}
                priority
                className="h-auto w-64 mx-auto"
              />
            </Link>

            <h1 className="text-4xl font-bold text-white mb-4 text-center">
              Gestão de Inventário{" "}
              <span className="text-[#f84704]">Profissional</span>
            </h1>
            <p className="text-gray-400 text-lg mb-10 text-center">
              Somos especialistas em inventário de estoque para farmácias,
              drogarias e empresas do varejo farmacêutico em todo o Centro-Oeste.
            </p>

            {/* Features list */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#f84704]/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-[#f84704]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Estoque Brasil Inventários.</p>
            <p>Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile header with logo */}
        <div className="lg:hidden bg-[#343434] p-4">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo-estoque.png"
              alt="Estoque Brasil Inventários"
              width={180}
              height={45}
              priority
              className="h-auto w-40"
            />
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center bg-neutral p-4 sm:p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Mobile footer */}
        <div className="lg:hidden bg-neutral border-t border-border p-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Estoque Brasil Inventários</p>
        </div>
      </div>
    </div>
  );
}
