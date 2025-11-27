#!/bin/bash

# Script de despliegue rápido para Bono-TS
# Uso: ./deploy.sh [start|stop|restart|logs|status|backup]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instálalo primero."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor instálalo primero."
        exit 1
    fi

    print_success "Docker y Docker Compose están instalados"
}

# Verificar archivo .env
check_env() {
    if [ ! -f .env ]; then
        print_warning "Archivo .env no encontrado. Copiando desde .env.example..."
        cp .env.example .env
        print_warning "Por favor edita el archivo .env con tus valores antes de continuar."
        print_info "Especialmente cambia NEXTAUTH_SECRET usando: openssl rand -base64 32"
        exit 1
    fi
    print_success "Archivo .env encontrado"
}

# Iniciar aplicación
start() {
    print_info "Iniciando aplicación Bono-TS..."
    check_docker
    check_env

    print_info "Building y levantando contenedores..."
    docker-compose up -d --build

    print_info "Esperando que la aplicación esté lista..."
    sleep 10

    print_success "Aplicación iniciada!"
    print_info "Accede a: http://localhost:3070"
    print_info "Health check: http://localhost:3070/api/health"
    print_info ""
    print_info "Ver logs con: ./deploy.sh logs"
}

# Detener aplicación
stop() {
    print_info "Deteniendo aplicación Bono-TS..."
    docker-compose stop
    print_success "Aplicación detenida"
}

# Reiniciar aplicación
restart() {
    print_info "Reiniciando aplicación Bono-TS..."
    docker-compose restart
    print_success "Aplicación reiniciada"
    print_info "Ver logs con: ./deploy.sh logs"
}

# Ver logs
logs() {
    print_info "Mostrando logs (Ctrl+C para salir)..."
    docker-compose logs -f
}

# Ver estado
status() {
    print_info "Estado de los contenedores:"
    docker-compose ps
    echo ""
    print_info "Health check:"
    curl -s http://localhost:3070/api/health | json_pp 2>/dev/null || curl -s http://localhost:3070/api/health
}

# Backup de la base de datos
backup() {
    print_info "Creando backup de la base de datos..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T db pg_dump -U bono_user bono_db > "$BACKUP_FILE"
    print_success "Backup creado: $BACKUP_FILE"
}

# Actualizar aplicación
update() {
    print_info "Actualizando aplicación..."

    print_info "1. Creando backup..."
    backup

    print_info "2. Deteniendo contenedores..."
    docker-compose down

    print_info "3. Obteniendo últimos cambios..."
    if [ -d .git ]; then
        git pull
    else
        print_warning "No es un repositorio git, saltando git pull"
    fi

    print_info "4. Rebuilding y reiniciando..."
    docker-compose up -d --build

    print_success "Aplicación actualizada!"
    print_info "Ver logs con: ./deploy.sh logs"
}

# Limpiar todo (¡CUIDADO!)
clean() {
    print_warning "¡ATENCIÓN! Esto eliminará TODOS los datos incluyendo la base de datos."
    read -p "¿Estás seguro? Escribe 'SI' para continuar: " confirm

    if [ "$confirm" = "SI" ]; then
        print_info "Limpiando todo..."
        docker-compose down -v
        docker system prune -f
        print_success "Limpieza completada"
    else
        print_info "Operación cancelada"
    fi
}

# Mostrar ayuda
show_help() {
    echo "Script de despliegue para Bono-TS"
    echo ""
    echo "Uso: ./deploy.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start     - Iniciar la aplicación (build + up)"
    echo "  stop      - Detener la aplicación"
    echo "  restart   - Reiniciar la aplicación"
    echo "  logs      - Ver logs en tiempo real"
    echo "  status    - Ver estado de los contenedores"
    echo "  backup    - Crear backup de la base de datos"
    echo "  update    - Actualizar aplicación (backup + rebuild)"
    echo "  clean     - Limpiar todo (¡CUIDADO! Borra datos)"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./deploy.sh start"
    echo "  ./deploy.sh logs"
    echo "  ./deploy.sh backup"
}

# Main
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    update)
        update
        ;;
    clean)
        clean
        ;;
    help|*)
        show_help
        ;;
esac
