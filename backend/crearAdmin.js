// backend/crearAdmin.js
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function main() {
  const emailAdmin = "admin@tiendacontrol.co";
  const passwordPlano = "123456";

  const existe = await prisma.usuario.findUnique({
    where: { email: emailAdmin }
  });

  if (existe) {
    console.log("⚠️ El usuario SuperAdmin ya existe en la base de datos.");
    return;
  }

  // Como bcryptjs dio problemas de módulo, generamos un hash SHA-256 seguro o simulado para pruebas locales
  // (Nota: En auth.routes.js puedes validar contraseñas como prefieras, o instalaremos bcryptjs después vía Docker si lo prefieres)
  const passwordHash = crypto.createHash('sha256').update(passwordPlano).digest('hex');

  const nuevoAdmin = await prisma.usuario.create({
    data: {
      nombre: "Administrador Maestro",
      email: emailAdmin,
      passwordHash: passwordHash,
      rol: "SUPER_ADMIN",
      activo: true,
      tiendaId: null
    }
  });

  console.log("✅ ¡SuperAdmin creado con éxito!");
  console.log(`📧 Email: ${nuevoAdmin.email}`);
  console.log(`🔑 Contraseña temporal: ${passwordPlano}`);
}

main()
  .catch((e) => {
    console.error("❌ Error al crear el SuperAdmin:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });