#!/bin/sh
set -e

echo "🚀 Iniciando aplicación..."

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que PostgreSQL esté listo..."
until node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => { console.log('✅ PostgreSQL está listo'); client.end(); process.exit(0); })
  .catch(() => { process.exit(1); });
" 2>/dev/null; do
  echo "   PostgreSQL no está listo aún, esperando..."
  sleep 2
done

# Ejecutar migraciones de Prisma
echo "📦 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy || {
  echo "⚠️  Las migraciones fallaron, pero continuando..."
}

# Ejecutar seed si es la primera vez (opcional)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Ejecutando seed de base de datos..."
  npm run db:seed || {
    echo "⚠️  El seed falló, pero continuando..."
  }
fi

echo "✅ Aplicación lista para iniciar"
echo ""

# Ejecutar el comando pasado al contenedor
exec "$@"
