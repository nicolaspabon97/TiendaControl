# 🛒 TiendaControl - Sistema Inteligente de Inventario y Ventas

Sistema web comercial para tiendas de barrio en Colombia.

## 🚀 Pasos para ejecutar en Visual Studio Code

1. Descomprime el archivo `.zip`.
2. Abre la carpeta `tiendacontrol` en Visual Studio Code (**Archivo > Abrir carpeta**).
3. Abre una terminal (`Ctrl + ~`) y ejecuta:
   ```bash
   npm install
   ```
4. Levanta la base de datos PostgreSQL con Docker:
   ```bash
   docker-compose up -d
   ```
5. Corre las migraciones de Prisma:
   ```bash
   npm run db:migrate
   ```
6. Inicia el proyecto en modo desarrollo:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```
7. Abre en tu navegador: `http://localhost:3000`
