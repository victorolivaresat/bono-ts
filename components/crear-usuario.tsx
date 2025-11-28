"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

export function CrearUsuario() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    })
    const [isCreating, setIsCreating] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Por favor complete todos los campos")
            return
        }

        if (formData.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres")
            return
        }

        setIsCreating(true)

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al crear usuario")
            }

            toast.success("Usuario creado correctamente")

            // Limpiar formulario
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "user",
            })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al crear usuario")
        } finally {
            setIsCreating(false)
        }
    }

    return (

        <>
            <form onSubmit={handleSubmit} className="space-y-4 shadow-lg p-10 justify-center rounded-2xl">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Ingrese nombre completo"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                        value={formData.role}
                        onValueChange={(value) =>
                            setFormData({ ...formData, role: value })
                        }
                    >
                        <SelectTrigger id="role">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">
                                Usuario Normal (Solo validar bonos)
                            </SelectItem>
                            <SelectItem value="admin">
                                Administrador (Acceso completo)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        <strong>Permisos por rol:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li><strong>Usuario Normal:</strong> Solo puede buscar y validar bonos</li>
                        <li><strong>Administrador:</strong> Puede crear, editar, eliminar bonos e importar desde Excel</li>
                    </ul>
                </div>

                <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full"
                    size="lg"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isCreating ? "Creando Usuario..." : "Crear Usuario"}
                </Button>
            </form>
        </>
    )
}
