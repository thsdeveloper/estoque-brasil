"use client"

import { Construction } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"

interface UnderDevelopmentProps {
  title?: string
  description?: string
  showBackButton?: boolean
}

export function UnderDevelopment({
  title = "Funcionalidade em Desenvolvimento",
  description = "Esta funcionalidade está sendo desenvolvida e estará disponível em breve.",
  showBackButton = true,
}: UnderDevelopmentProps) {
  const router = useRouter()

  return (
    <Card>
      <CardContent className="pt-6">
        <Alert variant="warning">
          <Construction className="h-5 w-5" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>

        {showBackButton && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
