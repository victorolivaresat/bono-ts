"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface Bono {
    id: string
    clientName: string
    ticketNumber: string
    status: string
    documentNumber: string
    documentType: string
    phoneNumber: string
    startDate: string
    expirationDate: string
    observations: string | null
    validatedBy: string | null
    validatedByUser: {
        id: string
        name: string
        email: string
    } | null
    tipoBono: {
        id: string
        nombre: string
        fechaInicio: string
        fechaFin: string
    }
}

export function ValidarBono() {
    const { data: session } = useSession()
    const [documentType, setDocumentType] = useState("")
    const [documentNumber, setDocumentNumber] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [bono, setBono] = useState<Bono | null>(null)
    const [ticketNumber, setTicketNumber] = useState("")
    const [isValidating, setIsValidating] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const handleSearch = async () => {
        if (!documentType || !documentNumber) {
            toast.error("Por favor complete todos los campos")
            return
        }

        try {
            setIsSearching(true)
            const params = new URLSearchParams({
                documentType,
                documentNumber,
            })
            const response = await fetch(`/api/bonos/buscar?${params}`)

            if (!response.ok) {
                if (response.status === 404) {
                    toast.error("No se encontró ningún bono con estos datos")
                    setBono(null)
                    return
                }
                throw new Error("Error al buscar")
            }

            const data = await response.json()
            setBono(data)
            setTicketNumber(data.ticketNumber)

            if (data.status === "cobrado") {
                toast.info("Este bono ya fue cobrado")
            } else {
                toast.success("Bono encontrado")
            }
        } catch {
            toast.error("Error al buscar el bono")
            setBono(null)
        } finally {
            setIsSearching(false)
        }
    }

    const handleValidate = async () => {
        if (!bono || !ticketNumber) {
            toast.error("Por favor ingrese el número de ticket")
            return
        }

        if (bono.status === "cobrado") {
            toast.error("Este bono ya fue cobrado")
            return
        }

        // Validar fechas del tipo de bono
        const now = new Date()
        const fechaInicio = new Date(bono.tipoBono.fechaInicio)
        const fechaFin = new Date(bono.tipoBono.fechaFin)

        if (now < fechaInicio) {
            toast.error(`Este bono no puede ser cobrado antes del ${fechaInicio.toLocaleDateString('es-PE')}`)
            return
        }

        if (now > fechaFin) {
            toast.error(`Este bono expiró el ${fechaFin.toLocaleDateString('es-PE')}`)
            return
        }

        setShowConfirmDialog(true)
    }

    const confirmValidation = async () => {
        if (!session?.user?.id) {
            toast.error("No se pudo obtener la información del usuario")
            return
        }

        try {
            setIsValidating(true)
            const response = await fetch(`/api/bonos/${bono!.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "cobrado",
                    ticketNumber,
                    observations: bono!.observations || null,
                    validatedBy: session.user.id,
                    validatedAt: new Date().toISOString(),
                }),
            })

            if (!response.ok) {
                throw new Error("Error al validar")
            }

            toast.success("Bono validado como cobrado exitosamente")

            // Actualizar el bono mostrado
            const updatedBono = await response.json()
            setBono(updatedBono)
            setShowConfirmDialog(false)
        } catch {
            toast.error("Error al validar el bono")
        } finally {
            setIsValidating(false)
        }
    }

    const handleReset = () => {
        setDocumentType("")
        setDocumentNumber("")
        setBono(null)
        setTicketNumber("")
    }

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: "default" | "secondary" | "destructive" | "success", label: string, icon: React.ComponentType<{ className?: string }> }> = {
            cobrado: { variant: "destructive", label: "Cobrado", icon: CheckCircle },
            no_cobrado: { variant: "secondary", label: "No Cobrado", icon: AlertCircle },
            activo: { variant: "success", label: "Activo", icon: CheckCircle },
            inactivo: { variant: "default", label: "Inactivo", icon: XCircle },
        }

        const { variant, label, icon: Icon } = config[status] || config.activo

        return (
            <Badge variant={variant} className="flex items-center gap-2 w-fit text-lg">
                <Icon />
                {label}
            </Badge>
        )
    }

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-4">
                {/* Formulario de búsqueda */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-2">
                            <Select value={documentType} onValueChange={setDocumentType}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tipo doc." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DNI">DNI</SelectItem>
                                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                    <SelectItem value="Carnet de Extranjería">CE</SelectItem>
                                    <SelectItem value="RUC">RUC</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Número de documento"
                                value={documentNumber}
                                onChange={(e) => setDocumentNumber(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching || !documentType || !documentNumber}
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                            {bono && (
                                <Button variant="outline" onClick={handleReset}>
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Resultado de búsqueda */}
                {bono && (
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-2xl">{bono.clientName}</h3>
                                    <p className="text-muted-foreground">
                                        {bono.documentType} {bono.documentNumber} • {bono.phoneNumber}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {bono.tipoBono.nombre} • Válido del {new Date(bono.tipoBono.fechaInicio).toLocaleDateString('es-PE')} al {new Date(bono.tipoBono.fechaFin).toLocaleDateString('es-PE')}
                                    </p>
                                </div>
                                {getStatusBadge(bono.status)}
                            </div>

                            {bono.observations && (
                                <p className="text-sm text-muted-foreground border-l-2 pl-3">
                                    {bono.observations}
                                </p>
                            )}

                            {bono.validatedByUser && (
                                <p className="text-xs text-muted-foreground">
                                    Validado por {bono.validatedByUser.name}
                                </p>
                            )}

                            {/* Alerta si el bono no está en periodo válido */}
                            {(() => {
                                const now = new Date()
                                const fechaInicio = new Date(bono.tipoBono.fechaInicio)
                                const fechaFin = new Date(bono.tipoBono.fechaFin)

                                if (now < fechaInicio) {
                                    return (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <p className="text-sm text-yellow-800 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Este bono aún no está vigente. Válido desde {fechaInicio.toLocaleDateString('es-PE')}
                                            </p>
                                        </div>
                                    )
                                }

                                if (now > fechaFin) {
                                    return (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-sm text-red-800 flex items-center gap-2">
                                                <XCircle className="h-4 w-4" />
                                                Este bono expiró el {fechaFin.toLocaleDateString('es-PE')}
                                            </p>
                                        </div>
                                    )
                                }

                                return null
                            })()}

                            {/* Formulario de validación */}
                            {bono.status !== "cobrado" && bono.status !== "inactivo" && (() => {
                                const now = new Date()
                                const fechaInicio = new Date(bono.tipoBono.fechaInicio)
                                const fechaFin = new Date(bono.tipoBono.fechaFin)
                                const isInValidPeriod = now >= fechaInicio && now <= fechaFin

                                return isInValidPeriod ? (
                                    <div className="space-y-2 pt-2 border-t">
                                        <Input
                                            placeholder="Número de ticket *"
                                            value={ticketNumber}
                                            onChange={(e) => setTicketNumber(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Observaciones (opcional)"
                                            value={bono.observations || ""}
                                            onChange={(e) => setBono({ ...bono, observations: e.target.value })}
                                        />
                                        <Button
                                            onClick={handleValidate}
                                            disabled={!ticketNumber || isValidating}
                                            className="w-full"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Validar como Cobrado
                                        </Button>
                                    </div>
                                ) : null
                            })()}

                            {bono.status === "cobrado" && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-800 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Cobrado - Ticket: {bono.ticketNumber}
                                    </p>
                                </div>
                            )}

                            {bono.status === "inactivo" && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800 flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Bono inactivo
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Dialog de confirmación */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Validación</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea marcar este bono como cobrado?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <p><strong>Cliente:</strong> {bono?.clientName}</p>
                        <p><strong>Documento:</strong> {bono?.documentType} {bono?.documentNumber}</p>
                        <p><strong>Ticket:</strong> {ticketNumber}</p>
                        {bono?.observations && (
                            <p><strong>Observaciones:</strong> {bono.observations}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={isValidating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmValidation}
                            disabled={isValidating}
                        >
                            {isValidating ? "Validando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
