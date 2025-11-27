"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";

const bonoFormSchema = z.object({
    clientName: z.string().min(1, "El nombre del cliente es requerido"),
    ticketNumber: z.string().optional(),
    tipoBonoId: z.string().min(1, "El tipo de bono es requerido"),
    documentNumber: z.string().min(1, "El número de documento es requerido"),
    documentType: z.string().min(1, "El tipo de documento es requerido"),
    phoneNumber: z.string().min(1, "El número de teléfono es requerido"),
    status: z.enum(["cobrado", "no_cobrado", "activo", "inactivo"]),
    observations: z.string().optional(),
});

type BonoFormValues = z.infer<typeof bonoFormSchema>;

interface BonoAsignado {
    id: string;
    clientName: string;
    ticketNumber: string;
    tipoBonoId: string;
    status: string;
    documentNumber: string;
    documentType: string;
    phoneNumber: string;
    observations: string | null;
    tipoBono: {
        id: string;
        nombre: string;
    };
}

interface TipoBono {
    id: string;
    nombre: string;
}

interface BonoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    bono: BonoAsignado | null;
    tiposBonos: TipoBono[];
}

export function BonoDialog({
    isOpen,
    onClose,
    onSave,
    bono,
    tiposBonos,
}: BonoDialogProps) {
    const isEditing = !!bono;

    const form = useForm<BonoFormValues>({
        resolver: zodResolver(bonoFormSchema),
        defaultValues: {
            clientName: "",
            ticketNumber: "",
            tipoBonoId: "",
            documentNumber: "",
            documentType: "DNI",
            phoneNumber: "",
            status: "activo",
            observations: "",
        },
    });

    useEffect(() => {
        if (bono) {
            form.reset({
                clientName: bono.clientName,
                ticketNumber: bono.ticketNumber,
                tipoBonoId: bono.tipoBonoId,
                documentNumber: bono.documentNumber,
                documentType: bono.documentType,
                phoneNumber: bono.phoneNumber,
                status: bono.status as "cobrado" | "no_cobrado" | "activo" | "inactivo",
                observations: bono.observations || "",
            });
        } else {
            form.reset({
                clientName: "",
                ticketNumber: "",
                tipoBonoId: "",
                documentNumber: "",
                documentType: "DNI",
                phoneNumber: "",
                status: "activo",
                observations: "",
            });
        }
    }, [bono, form]);

    const onSubmit = async (data: BonoFormValues) => {
        try {
            const url = isEditing ? `/api/bonos/${bono.id}` : "/api/bonos";
            const method = isEditing ? "PATCH" : "POST";

            // Limpiar ticketNumber si está vacío para que no se envíe
            const payload = {
                ...data,
                ticketNumber: data.ticketNumber?.trim() || undefined,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Error al guardar el bono");
            }

            toast.success(
                isEditing ? "Bono actualizado correctamente" : "Bono creado correctamente"
            );
            onSave();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Error al guardar el bono";
            toast.error(errorMessage);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Bono" : "Crear Nuevo Bono"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica la información del bono asignado"
                            : "Completa los datos del nuevo bono asignado"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="clientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Cliente</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Juan Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ticketNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Ticket (opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="TKT-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tipoBonoId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Bono</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona tipo de bono" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {tiposBonos.map((tipo) => (
                                                    <SelectItem key={tipo.id} value={tipo.id}>
                                                        {tipo.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="documentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Documento</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DNI">DNI</SelectItem>
                                                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                                <SelectItem value="Cédula">Cédula</SelectItem>
                                                <SelectItem value="RUC">RUC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="documentNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Documento</FormLabel>
                                        <FormControl>
                                            <Input placeholder="12345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+51 999 999 999" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="activo">Activo</SelectItem>
                                                <SelectItem value="inactivo">Inactivo</SelectItem>
                                                <SelectItem value="cobrado">Cobrado</SelectItem>
                                                <SelectItem value="no_cobrado">No Cobrado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="observations"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observaciones</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notas adicionales..."
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {isEditing ? "Actualizar" : "Crear"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
