"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ValidarBono } from "./validar-bono";
import { ImportarExcel } from "./importar-excel";
import { ImportarUsuarios } from "./importar-usuarios";
import { GestionarTiposBonos } from "./gestionar-tipos-bonos";
import { ListaBonos } from "./lista-bonos";
import { ListaUsuarios } from "./lista-usuarios";
import { CrearUsuario } from "./crear-usuario";
import { signOut } from "next-auth/react";
import { LogOut, CheckCircle, Upload, List, Users, Tags } from "lucide-react";

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
}

export function BonosDashboard({ user }: { user: User }) {
    const isAdmin = user.role === "admin";
    const [activeTab, setActiveTab] = useState("validar");

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Bonos App</h2>
                    <p className="text-sm text-gray-600 mt-1">{user.name}</p>
                    <p className="text-xs text-gray-500">{isAdmin ? "Administrador" : "Usuario"}</p>
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    <button
                        onClick={() => setActiveTab("validar")}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === "validar"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Validar Bono
                    </button>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setActiveTab("importar")}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === "importar"
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Importar Bonos
                            </button>
                            <button
                                onClick={() => setActiveTab("lista")}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === "lista"
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <List className="mr-2 h-4 w-4" />
                                Lista de Bonos
                            </button>
                            <button
                                onClick={() => setActiveTab("tipos")}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === "tipos"
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <Tags className="mr-2 h-4 w-4" />
                                Tipos de Bonos
                            </button>
                            <button
                                onClick={() => setActiveTab("usuarios")}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === "usuarios"
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Usuarios
                            </button>
                            <button
                                onClick={() => setActiveTab("crear-usuario")}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === "crear-usuario"
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Crear Usuario
                            </button>
                            <button
                                onClick={() => setActiveTab("importar-usuarios")}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeTab === "importar-usuarios"
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Importar Usuarios
                            </button>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {activeTab === "validar" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Validar Bono</CardTitle>
                                <CardDescription>
                                    Busca un bono por DNI y valídalo como cobrado
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ValidarBono />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "importar" && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Importar Bonos desde Excel</CardTitle>
                                <CardDescription>
                                    Sube un archivo Excel con la lista de bonos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImportarExcel />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "lista" && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Bonos Asignados</CardTitle>
                                <CardDescription>
                                    Gestiona todos los bonos asignados a clientes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ListaBonos />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "tipos" && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestionar Tipos de Bonos</CardTitle>
                                <CardDescription>
                                    Crea y administra los diferentes tipos de bonos disponibles
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <GestionarTiposBonos />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "usuarios" && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Usuarios</CardTitle>
                                <CardDescription>
                                    Usuarios registrados en el sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ListaUsuarios />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "crear-usuario" && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Crear Nuevo Usuario</CardTitle>
                                <CardDescription>
                                    Registra un nuevo usuario en el sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CrearUsuario />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "importar-usuarios" && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Importar Usuarios desde Excel</CardTitle>
                                <CardDescription>
                                    Sube un archivo Excel o CSV con la lista de usuarios
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImportarUsuarios />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}