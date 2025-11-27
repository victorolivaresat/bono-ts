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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Plus, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BonoDialog } from "./bono-dialog";

interface BonoAsignado {
    id: string;
    ticketNumber: string;
    tipoBonoId: string;
    clientName: string;
    documentType: string;
    documentNumber: string;
    phoneNumber: string;
    status: string;
    observations: string | null;
    tipoBono: {
        id: string;
        nombre: string;
        fechaInicio: string;
        fechaFin: string;
    };
    validatedByUser: {
        id: string;
        name: string;
        email: string;
    } | null;
    validatedAt: string | null;
    createdAt: string;
}interface TipoBono {
    id: string;
    nombre: string;
}

export function ListaBonos() {
    const [bonos, setBonos] = useState<BonoAsignado[]>([]);
    const [tiposBonos, setTiposBonos] = useState<TipoBono[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBono, setSelectedBono] = useState<BonoAsignado | null>(null);

    const columns: ColumnDef<BonoAsignado>[] = [
        {
            accessorKey: "ticketNumber",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ticket
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.ticketNumber || "No asignado",
        },
        {
            accessorKey: "clientName",
            header: "Cliente",
        },
        {
            accessorKey: "tipoBono.nombre",
            header: "Tipo de Bono",
            cell: ({ row }) => row.original.tipoBono.nombre,
        },
        {
            accessorKey: "documentNumber",
            header: "Documento",
            cell: ({ row }) =>
                `${row.original.documentType} ${row.original.documentNumber}`,
        },
        {
            accessorKey: "phoneNumber",
            header: "Teléfono",
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => {
                const status = row.original.status;
                const colors: Record<string, string> = {
                    activo: "bg-green-100 text-green-800",
                    cobrado: "bg-blue-100 text-blue-800",
                    no_cobrado: "bg-yellow-100 text-yellow-800",
                    inactivo: "bg-gray-100 text-gray-800",
                };
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: "validatedByUser",
            header: "Validado Por",
            cell: ({ row }) => {
                const user = row.original.validatedByUser;
                if (!user) return "-";
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                );
            },
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
        data: bonos,
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
        fetchBonos();
        fetchTiposBonos();
    }, []);

    useEffect(() => {
        if (statusFilter === "all") {
            table.getColumn("status")?.setFilterValue(undefined);
        } else {
            table.getColumn("status")?.setFilterValue(statusFilter);
        }
    }, [statusFilter, table]);

    const fetchBonos = async () => {
        try {
            const response = await fetch("/api/bonos");
            if (!response.ok) throw new Error("Error al cargar bonos");
            const data = await response.json();
            setBonos(data);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al cargar los bonos");
        } finally {
            setLoading(false);
        }
    };

    const fetchTiposBonos = async () => {
        try {
            const response = await fetch("/api/tipos-bonos");
            if (!response.ok) throw new Error("Error al cargar tipos de bonos");
            const data = await response.json();
            setTiposBonos(data.filter((t: TipoBono & { activo: boolean }) => t.activo));
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleEdit = (bono: BonoAsignado) => {
        setSelectedBono(bono);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este bono?")) return;

        try {
            const response = await fetch(`/api/bonos/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Error al eliminar");
            toast.success("Bono eliminado");
            fetchBonos();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al eliminar bono");
        }
    };

    const handleSave = () => {
        setIsDialogOpen(false);
        setSelectedBono(null);
        fetchBonos();
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Input
                    placeholder="Buscar por ticket o cliente..."
                    value={
                        (table.getColumn("ticketNumber")?.getFilterValue() as string) ?? ""
                    }
                    onChange={(e) =>
                        table.getColumn("ticketNumber")?.setFilterValue(e.target.value)
                    }
                    className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="cobrado">Cobrado</SelectItem>
                        <SelectItem value="no_cobrado">No Cobrado</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={() => {
                        setSelectedBono(null);
                        setIsDialogOpen(true);
                    }}
                    className="ml-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Bono
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
                <div className="text-sm text-muted-foreground">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                </div>
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

            <BonoDialog
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setSelectedBono(null);
                }}
                bono={selectedBono}
                onSave={handleSave}
                tiposBonos={tiposBonos}
            />
        </div>
    );
}
