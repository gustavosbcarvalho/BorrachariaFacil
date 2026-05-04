import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Usuários
  const adminPassword = await bcrypt.hash("admin123", 10);
  const operatorPassword = await bcrypt.hash("operador123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@borracharia.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@borracharia.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: "operador@borracharia.com" },
    update: {},
    create: {
      name: "Operador",
      email: "operador@borracharia.com",
      passwordHash: operatorPassword,
      role: Role.OPERATOR,
    },
  });

  console.log(`✅ Usuários criados: ${admin.email}, ${operator.email}`);

  // Tipos de serviço
  const serviceTypes = [
    "Troca de pneu",
    "Calibragem",
    "Remendo (câmara de ar)",
    "Remendo (pneu sem câmara)",
    "Balanceamento",
    "Alinhamento",
    "Troca de câmara de ar",
    "Vulcanização",
    "Conserto de roda",
    "Serviço avulso",
  ];

  for (const name of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`✅ ${serviceTypes.length} tipos de serviço criados`);

  // Categorias de despesa
  const categories = [
    "Materiais e peças",
    "Aluguel",
    "Água e energia",
    "Combustível",
    "Alimentação",
    "Equipamentos",
    "Manutenção",
    "Impostos e taxas",
    "Salários",
    "Outros",
  ];

  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`✅ ${categories.length} categorias de despesa criadas`);
  console.log("✅ Seed concluído!");
  console.log("");
  console.log("🔑 Credenciais de acesso:");
  console.log("   Admin:    admin@borracharia.com     / admin123");
  console.log("   Operador: operador@borracharia.com  / operador123");
  console.log("   ⚠️  Troque as senhas após o primeiro login!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
