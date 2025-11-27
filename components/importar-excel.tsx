"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface TipoBono {
    id: string
    nombre: string
}

export function ImportarExcel() {
    const [file, setFile] = useState<File | null>(null)
    const [tipoBonoId, setTipoBonoId] = useState<string>("")
    const [tiposBonos, setTiposBonos] = useState<TipoBono[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [result, setResult] = useState<{
        processedCount: number
        errorCount: number
        errors?: string[]
    } | null>(null)

    useEffect(() => {
        fetchTiposBonos()
    }, [])

    const fetchTiposBonos = async () => {
        try {
            const response = await fetch("/api/tipos-bonos")
            if (!response.ok) throw new Error("Error al cargar tipos de bonos")
            const data = await response.json()
            setTiposBonos(data.filter((t: TipoBono & { activo: boolean }) => t.activo))
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al cargar tipos de bonos")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            // Validar tipo de archivo
            const validTypes = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv",
                "application/csv"
            ]

            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
                toast.error("Por favor seleccione un archivo Excel (.xlsx, .xls) o CSV (.csv)")
                return
            }

            setFile(selectedFile)
            setResult(null)
        }
    }

    const handleUpload = async () => {
        if (!file) {
            toast.error("Por favor seleccione un archivo")
            return
        }

        if (!tipoBonoId) {
            toast.error("Por favor seleccione un tipo de bono")
            return
        }

        setIsUploading(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("tipoBonoId", tipoBonoId)

            const response = await fetch("/api/bonos/importar", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al importar el archivo")
            }

            setResult({
                processedCount: data.processedCount,
                errorCount: data.errorCount,
                errors: data.errors,
            })

            if (data.errorCount === 0) {
                toast.success(`Se importaron ${data.processedCount} bonos correctamente`)
            } else {
                toast.warning(
                    `Se importaron ${data.processedCount} bonos. ${data.errorCount} filas con errores`
                )
            }

            // Limpiar el archivo después de la importación exitosa
            setFile(null)
            const fileInput = document.getElementById("file-upload") as HTMLInputElement
            if (fileInput) fileInput.value = ""
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al importar el archivo")
        } finally {
            setIsUploading(false)
        }
    }

    const downloadTemplateCSV = () => {
        const csvContent = `cliente,dni,tipo_documento,telefono
Juan Pérez,12345678,DNI,999888777
María García,87654321,DNI,988777666`

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "plantilla_bonos.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("Plantilla CSV descargada")
    }

    const downloadTemplateExcel = async () => {
        try {
            const response = await fetch("/api/bonos/plantilla")
            if (!response.ok) throw new Error("Error al descargar plantilla")

            const blob = await response.blob()
            const link = document.createElement("a")
            const url = URL.createObjectURL(blob)
            link.setAttribute("href", url)
            link.setAttribute("download", "plantilla_bonos.xlsx")
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success("Plantilla Excel descargada")
        } catch (error) {
            console.error("Error downloading Excel template:", error)
            toast.error("Error al descargar plantilla Excel")
        }
    }

    return (
        <>
            <div className="space-y-6">
                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Formato del archivo:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li><strong>cliente:</strong> Nombre completo del cliente (requerido)</li>
                        <li><strong>dni:</strong> Número de documento (requerido)</li>
                        <li><strong>tipo_documento:</strong> DNI, Pasaporte, etc. (requerido)</li>
                        <li><strong>telefono:</strong> Número de teléfono (opcional)</li>
                    </ul>
                    <p className="text-sm text-blue-800 mt-2">
                        <strong>Nota:</strong> El estado será *ACTIVO* por defecto. Las fechas se toman del tipo de bono seleccionado.
                    </p>
                </div>

                {/* Seleccionar tipo de bono */}
                <div className="space-y-2">
                    <Label htmlFor="tipoBono">Tipo de Bono *</Label>
                    <Select value={tipoBonoId} onValueChange={setTipoBonoId}>
                        <SelectTrigger id="tipoBono">
                            <SelectValue placeholder="Selecciona el tipo de bono" />
                        </SelectTrigger>
                        <SelectContent>
                            {tiposBonos.map((tipo) => (
                                <SelectItem key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        Todos los bonos importados se asignarán a este tipo
                    </p>
                </div>

                {/* Descargar plantillas */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        onClick={downloadTemplateExcel}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Plantilla Excel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={downloadTemplateCSV}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Plantilla CSV
                    </Button>
                </div>

                {/* Seleccionar archivo */}
                <div className="space-y-2">
                    <label
                        htmlFor="file-upload"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Seleccionar archivo Excel o CSV
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {file && (
                        <p className="text-sm text-gray-600 mt-1">
                            Archivo seleccionado: {file.name}
                        </p>
                    )}
                </div>

                {/* Botón de importar */}
                <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading || !tipoBonoId}
                    size="lg"
                >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Importando..." : "Importar Bonos"}
                </Button>

                {/* Mostrar progreso */}
                {isUploading && (
                    <div className="space-y-2">
                        <Progress value={undefined} className="w-full" />
                        <p className="text-sm text-center text-muted-foreground">
                            Procesando archivo...
                        </p>
                    </div>
                )}

                {/* Resultados */}
                {result && (
                    <div className="space-y-4 border-t pt-4">
                        <h4 className="font-semibold">Resultados de la importación:</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-800">
                                    <CheckCircle className="h-5 w-5" />
                                    <div>
                                        <p className="text-sm font-medium">Procesados</p>
                                        <p className="text-2xl font-bold">{result.processedCount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-red-800">
                                    <XCircle className="h-5 w-5" />
                                    <div>
                                        <p className="text-sm font-medium">Errores</p>
                                        <p className="text-2xl font-bold">{result.errorCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result.errors && result.errors.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-2 text-yellow-800">
                                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-semibold mb-2">Errores encontrados:</p>
                                        <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                                            {result.errors.map((error, idx) => (
                                                <li key={idx} className="list-disc list-inside">
                                                    {error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
