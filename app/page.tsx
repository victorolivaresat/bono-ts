import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-r from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Sistema de Gestión de Bonos
          </CardTitle>
          <CardDescription className="text-base">
            Plataforma de autenticación y validación de bonos otorgados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Características:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Sistema de autenticación seguro</li>
              <li>Gestión completa de bonos</li>
              <li>Validación y seguimiento</li>
              <li>Panel de administración intuitivo</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/register">Crear Cuenta</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
