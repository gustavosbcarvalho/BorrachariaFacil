import { PrismaClient, Role, PlanStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_SERVICE_TYPES = [
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

const DEFAULT_CATEGORIES = [
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

async function createServiceTypes(borrachariaId: string) {
  for (const name of DEFAULT_SERVICE_TYPES) {
    await prisma.serviceType.upsert({
      where: { name_borrachariaId: { name, borrachariaId } },
      update: {},
      create: { name, borrachariaId },
    });
  }
}

async function createExpenseCategories(borrachariaId: string) {
  for (const name of DEFAULT_CATEGORIES) {
    await prisma.expenseCategory.upsert({
      where: { name_borrachariaId: { name, borrachariaId } },
      update: {},
      create: { name, borrachariaId },
    });
  }
}

async function main() {
  console.log("🌱 Iniciando seed multi-tenant...\n");

  // ─── 1. SYSTEM_ADMIN ─────────────────────────────────────────────────────
  const sysAdminPassword = await bcrypt.hash("sysadmin123", 10);
  const sysAdmin = await prisma.user.upsert({
    where: { email: "gustavo.sbcarvalho@gmail.com" },
    update: {},
    create: {
      name: "Gustavo (Admin Sistema)",
      email: "gustavo.sbcarvalho@gmail.com",
      passwordHash: sysAdminPassword,
      role: Role.SYSTEM_ADMIN,
      borrachariaId: null,
    },
  });
  console.log(`✅ SYSTEM_ADMIN: ${sysAdmin.email}`);
  console.log("   ⚠️  Troque a senha em produção!\n");

  // ─── 2. Borracharia Piloto ────────────────────────────────────────────────
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  const pilot = await prisma.borracharia.upsert({
    where: { cnpj: "00.000.000/0001-00" },
    update: {},
    create: {
      name: "Borracharia Piloto",
      cnpj: "00.000.000/0001-00",
      address: "A definir",
      city: "A definir",
      state: "SP",
      zipCode: "00000-000",
      planStatus: PlanStatus.TRIAL,
      trialEndsAt,
    },
  });
  console.log(`✅ Borracharia Piloto: ${pilot.id}`);

  // ─── 3. Usuários da Borracharia Piloto ───────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10);
  const operatorPassword = await bcrypt.hash("operador123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@borracharia.com" },
    update: { borrachariaId: pilot.id },
    create: {
      name: "Administrador",
      email: "admin@borracharia.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      borrachariaId: pilot.id,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: "operador@borracharia.com" },
    update: { borrachariaId: pilot.id },
    create: {
      name: "Operador",
      email: "operador@borracharia.com",
      passwordHash: operatorPassword,
      role: Role.OPERATOR,
      borrachariaId: pilot.id,
    },
  });
  console.log(`✅ Usuários: ${admin.email}, ${operator.email}`);

  // ─── 4. Migrar users órfãos → Borracharia Piloto ─────────────────────────
  const orphanUsers = await prisma.user.updateMany({
    where: {
      borrachariaId: null,
      role: { not: Role.SYSTEM_ADMIN },
    },
    data: { borrachariaId: pilot.id },
  });
  if (orphanUsers.count > 0)
    console.log(`🔄 ${orphanUsers.count} usuário(s) migrado(s) para borracharia piloto`);

  // ─── 5. Tipos de serviço ──────────────────────────────────────────────────
  // Migrar registros sem borracharia_id
  const orphanTypes = await prisma.serviceType.findMany({
    where: { borrachariaId: null },
  });
  for (const t of orphanTypes) {
    // Evita conflito com @@unique([name, borrachariaId])
    const exists = await prisma.serviceType.findFirst({
      where: { name: t.name, borrachariaId: pilot.id },
    });
    if (exists) {
      await prisma.serviceType.delete({ where: { id: t.id } });
    } else {
      await prisma.serviceType.update({
        where: { id: t.id },
        data: { borrachariaId: pilot.id },
      });
    }
  }

  // Garantir que a borracharia tem todos os tipos padrão
  await createServiceTypes(pilot.id);
  console.log(`✅ Tipos de serviço configurados para borracharia piloto`);

  // ─── 6. Categorias de despesa ─────────────────────────────────────────────
  const orphanCats = await prisma.expenseCategory.findMany({
    where: { borrachariaId: null },
  });
  for (const c of orphanCats) {
    const exists = await prisma.expenseCategory.findFirst({
      where: { name: c.name, borrachariaId: pilot.id },
    });
    if (exists) {
      await prisma.expenseCategory.delete({ where: { id: c.id } });
    } else {
      await prisma.expenseCategory.update({
        where: { id: c.id },
        data: { borrachariaId: pilot.id },
      });
    }
  }

  await createExpenseCategories(pilot.id);
  console.log(`✅ Categorias de despesa configuradas para borracharia piloto`);

  // ─── 7. Migrar serviços e despesas órfãos ─────────────────────────────────
  const orphanServices = await prisma.service.updateMany({
    where: { borrachariaId: null },
    data: { borrachariaId: pilot.id },
  });
  if (orphanServices.count > 0)
    console.log(`🔄 ${orphanServices.count} serviço(s) migrado(s)`);

  const orphanExpenses = await prisma.expense.updateMany({
    where: { borrachariaId: null },
    data: { borrachariaId: pilot.id },
  });
  if (orphanExpenses.count > 0)
    console.log(`🔄 ${orphanExpenses.count} despesa(s) migrada(s)`);

  // ─── 8. Corrigir amount_paid / amount_due em serviços existentes ──────────
  // Serviços PAID sem amount_paid definido: amount_paid = amount, amount_due = 0
  await prisma.$executeRaw`
    UPDATE services
    SET amount_paid = amount, amount_due = 0
    WHERE payment_status = 'PAID'
      AND amount_paid = 0
      AND payment_method != 'CONVENIO'
  `;

  // Serviços PENDING sem amount_due definido
  await prisma.$executeRaw`
    UPDATE services
    SET amount_paid = 0, amount_due = amount
    WHERE payment_status = 'PENDING'
      AND amount_due = 0
  `;

  console.log(`✅ Campos amount_paid/amount_due sincronizados`);

  console.log("\n✅ Seed concluído!\n");
  console.log("🔑 Credenciais:");
  console.log("   SYSTEM_ADMIN: gustavo.sbcarvalho@gmail.com / sysadmin123");
  console.log("   Admin:        admin@borracharia.com         / admin123");
  console.log("   Operador:     operador@borracharia.com      / operador123");
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
