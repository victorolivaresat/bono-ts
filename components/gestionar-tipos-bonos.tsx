"use client";

import { useEffect, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnDef,
    flexRender,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

interface TipoBono {
    id: string;
    nombre: string;
    descripcion: string | null;
    fechaInicio: string;
    fechaFin: string;
    activo: boolean;
    _count?: {
        bonosAsignados: number;
    };
}

export function GestionarTiposBonos() {
    const [tiposBonos, setTiposBonos] = useState<TipoBono[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [editingTipo, setEditingTipo] = useState<TipoBono | null>(null);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        fechaInicio: "",
        fechaFin: "",
        activo: true,
    });

    const columns: ColumnDef<TipoBono>[] = [
        {
            accessorKey: "nombre",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "descripcion",
            header: "Descripción",
            cell: ({ row }) => (
                <div className="max-w-xs truncate">{row.original.descripcion || "-"}</div>
            ),
        },
        {
            accessorKey: "fechaInicio",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fecha Inicio
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) =>
                new Date(row.original.fechaInicio).toLocaleDateString("es-ES"),
        },
        {
            accessorKey: "fechaFin",
            header: "Fecha Fin",
            cell: ({ row }) =>
                new Date(row.original.fechaFin).toLocaleDateString("es-ES"),
        },
        {
            accessorKey: "activo",
            header: "Estado",
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {row.original.activo ? "Activo" : "Inactivo"}
                </span>
            ),
        },
        {
            accessorKey: "_count.bonosAsignados",
            header: "Bonos",
            cell: ({ row }) => row.original._count?.bonosAsignados || 0,
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(row.original)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: tiposBonos,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    useEffect(() => {
        fetchTiposBonos();
    }, []);

    const fetchTiposBonos = async () => {
        try {
            const response = await fetch("/api/tipos-bonos");
            if (!response.ok) throw new Error("Error al cargar tipos de bonos");
            const data = await response.json();
            setTiposBonos(data);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al cargar tipos de bonos");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (tipo: TipoBono) => {
        setEditingTipo(tipo);
        setFormData({
            nombre: tipo.nombre,
            descripcion: tipo.descripcion || "",
            fechaInicio: new Date(tipo.fechaInicio).toISOString().split("T")[0],
            fechaFin: new Date(tipo.fechaFin).toISOString().split("T")[0],
            activo: tipo.activo,
        });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este tipo de bono?")) return;

        try {
            const response = await fetch(`/api/tipos-bonos/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Error al eliminar");
            toast.success("Tipo de bono eliminado");
            fetchTiposBonos();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al eliminar tipo de bono");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingTipo
                ? `/api/tipos-bonos/${editingTipo.id}`
                : "/api/tipos-bonos";
            const method = editingTipo ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Error al guardar");

            toast.success(
                editingTipo
                    ? "Tipo de bono actualizado"
                    : "Tipo de bono creado"
            );
            setShowDialog(false);
            resetForm();
            fetchTiposBonos();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al guardar tipo de bono");
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            fechaInicio: "",
            fechaFin: "",
            activo: true,
        });
        setEditingTipo(null);
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Buscar por nombre..."
                    value={(table.getColumn("nombre")?.getFilterValue() as string) ?? ""}
                    onChange={(e) =>
                        table.getColumn("nombre")?.setFilterValue(e.target.value)
                    }
                    className="max-w-sm"
                />
                <Button
                    onClick={() => {
                        resetForm();
                        setShowDialog(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Tipo de Bono
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Siguiente
                </Button>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTipo ? "Editar" : "Crear"} Tipo de Bono
                        </DialogTitle>
                        <DialogDescription>
                            {editingTipo
                                ? "Modifica los datos del tipo de bono"
                                : "Crea un nuevo tipo de bono"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nombre: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) =>
                                        setFormData({ ...formData, descripcion: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
                                    <Input
                                        id="fechaInicio"
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fechaInicio: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fechaFin">Fecha Fin *</Label>
                                    <Input
                                        id="fechaFin"
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fechaFin: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="activo"
                                    checked={formData.activo}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, activo: checked })
                                    }
                                />
                                <Label htmlFor="activo">Activo</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowDialog(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
