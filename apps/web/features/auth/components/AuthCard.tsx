import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/shared/components/ui/card';

interface AuthCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ description, children, footer }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo-estoque-negativo.png"
            alt="Estoque Brasil Inventários"
            width={280}
            height={90}
            priority
            className="h-auto w-44"
          />
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="flex-col gap-2">{footer}</CardFooter>}
    </Card>
  );
}
