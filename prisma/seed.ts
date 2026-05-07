import {
  PaymentFrequency,
  PaymentMethod,
  PaymentStatus,
  PlanName,
  PlanStatus,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_BORRACHARIA,
  DEMO_CREDENTIALS,
  DEMO_SEED_VERSION,
} from "./demoConstants";

const prisma = new PrismaClient();

const MERCOSUL_NAME = "Borracharia Mercosul - 61.539.497/0001-05";
const MERCOSUL_PUBLIC_NAME = "Borracharia Mercosul";
const MERCOSUL_CNPJ = "61.539.497/0001-05";
const OLD_PILOT_CNPJ = "00.000.000/0001-00";
const OLD_ADMIN_EMAIL = "admin@borracharia.com";
const MERCOSUL_ADMIN_EMAIL = "alexs2007@hotmail.com";
const MERCOSUL_OPERATOR_EMAIL = "felipealmeidafer55@gmail.com";

const DEMO_IDS = {
  companies: {
    transportadora: "seed-demo-company-transportadora",
    autoPecas: "seed-demo-company-auto-pecas",
    clienteAvulso: "seed-demo-company-cliente-avulso",
  },
  convenios: {
    mensal: "seed-demo-convenio-mensal",
    quinzenal: "seed-demo-convenio-quinzenal",
  },
  services: {
    trocaPneu: "seed-demo-service-troca-pneu-hoje",
    calibragem: "seed-demo-service-calibragem-hoje",
    convenioMensal: "seed-demo-service-convenio-mensal",
    convenioQuinzenal: "seed-demo-service-convenio-quinzenal",
    vulcanizacao: "seed-demo-service-vulcanizacao-mes",
    cortesia: "seed-demo-service-cortesia",
  },
  expenses: {
    materiais: "seed-demo-expense-materiais-hoje",
    cafe: "seed-demo-expense-cafe-hoje",
    aluguel: "seed-demo-expense-aluguel",
    combustivel: "seed-demo-expense-combustivel",
  },
} as const;

type SeedServiceType = {
  name: string;
  isPublic?: boolean;
  startingPrice?: string;
};

const DEFAULT_SERVICE_TYPES: SeedServiceType[] = [
  { name: "Troca de pneu" },
  { name: "Calibragem" },
  { name: "Remendo (câmara de ar)" },
  { name: "Remendo (pneu sem câmara)" },
  { name: "Balanceamento" },
  { name: "Alinhamento" },
  { name: "Troca de câmara de ar" },
  { name: "Vulcanização" },
  { name: "Conserto de roda" },
  { name: "Serviço avulso" },
];

const DEMO_SERVICE_TYPES: SeedServiceType[] = [
  { name: "Troca de pneu", isPublic: true, startingPrice: "35.00" },
  { name: "Calibragem", isPublic: true, startingPrice: "10.00" },
  { name: "Remendo (câmara de ar)", isPublic: true, startingPrice: "25.00" },
  { name: "Remendo (pneu sem câmara)", isPublic: true, startingPrice: "40.00" },
  { name: "Balanceamento", isPublic: true, startingPrice: "45.00" },
  { name: "Alinhamento", isPublic: true, startingPrice: "90.00" },
  { name: "Troca de câmara de ar", isPublic: true, startingPrice: "55.00" },
  { name: "Vulcanização", isPublic: true, startingPrice: "80.00" },
  { name: "Conserto de roda", isPublic: false, startingPrice: "120.00" },
  { name: "Serviço avulso", isPublic: false },
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

function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function demoDate(daysFromToday: number, hour: number, minute = 0) {
  const date = addDays(new Date(), daysFromToday);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function requiredId(map: Map<string, string>, name: string) {
  const id = map.get(name);
  if (!id) throw new Error(`Seed inconsistente: item nao encontrado: ${name}`);
  return id;
}

async function createServiceTypes(
  borrachariaId: string,
  serviceTypes: SeedServiceType[] = DEFAULT_SERVICE_TYPES,
  resetExisting = false
) {
  const ids = new Map<string, string>();

  for (const serviceType of serviceTypes) {
    const record = await prisma.serviceType.upsert({
      where: {
        name_borrachariaId: {
          name: serviceType.name,
          borrachariaId,
        },
      },
      update: resetExisting
        ? {
            active: true,
            isPublic: serviceType.isPublic ?? false,
            startingPrice: serviceType.startingPrice ?? null,
          }
        : {},
      create: {
        name: serviceType.name,
        borrachariaId,
        isPublic: serviceType.isPublic ?? false,
        startingPrice: serviceType.startingPrice ?? null,
      },
    });
    ids.set(serviceType.name, record.id);
  }

  return ids;
}

async function createExpenseCategories(borrachariaId: string, resetExisting = false) {
  const ids = new Map<string, string>();

  for (const name of DEFAULT_CATEGORIES) {
    const record = await prisma.expenseCategory.upsert({
      where: { name_borrachariaId: { name, borrachariaId } },
      update: resetExisting ? { active: true } : {},
      create: { name, borrachariaId },
    });
    ids.set(name, record.id);
  }

  return ids;
}

async function createOrUpdateMercosul(trialEndsAt: Date) {
  const existingMercosul = await prisma.borracharia.findUnique({
    where: { cnpj: MERCOSUL_CNPJ },
  });

  const oldPilot = existingMercosul
    ? null
    : await prisma.borracharia.findFirst({
        where: {
          OR: [{ cnpj: OLD_PILOT_CNPJ }, { name: "Borracharia Piloto" }],
        },
      });

  const createData = {
    name: MERCOSUL_NAME,
    cnpj: MERCOSUL_CNPJ,
    address: "A definir",
    city: "A definir",
    state: "SP",
    zipCode: "00000-000",
    planStatus: PlanStatus.TRIAL,
    planName: PlanName.FREE,
    trialEndsAt,
    publicListingEnabled: false,
    publicName: MERCOSUL_PUBLIC_NAME,
    publicDescription: null,
    publicPhone: null,
    whatsappNumber: null,
    latitude: null,
    longitude: null,
    openingHours: Prisma.JsonNull,
    logoUrl: null,
    isDemo: false,
    demoSeedVersion: null,
    demoLastSeededAt: null,
  };

  const safeUpdateData = {
    name: MERCOSUL_NAME,
    cnpj: MERCOSUL_CNPJ,
    isDemo: false,
    demoSeedVersion: null,
    demoLastSeededAt: null,
  };

  if (existingMercosul) {
    return prisma.borracharia.update({
      where: { id: existingMercosul.id },
      data: safeUpdateData,
    });
  }

  if (oldPilot) {
    return prisma.borracharia.update({
      where: { id: oldPilot.id },
      data: safeUpdateData,
    });
  }

  return prisma.borracharia.upsert({
    where: { cnpj: MERCOSUL_CNPJ },
    update: safeUpdateData,
    create: createData,
  });
}

async function createOrUpdateMercosulAdmin(borrachariaId: string) {
  const oldAdmin = await prisma.user.findUnique({ where: { email: OLD_ADMIN_EMAIL } });
  const currentAdmin = await prisma.user.findUnique({
    where: { email: MERCOSUL_ADMIN_EMAIL },
  });

  if (currentAdmin && currentAdmin.borrachariaId && currentAdmin.borrachariaId !== borrachariaId) {
    throw new Error(
      `${MERCOSUL_ADMIN_EMAIL} ja pertence a outra borracharia. Resolva esse conflito antes de rodar o seed.`
    );
  }

  if (oldAdmin && currentAdmin && currentAdmin.id !== oldAdmin.id) {
    throw new Error(
      `Conflito: existem usuarios separados para ${OLD_ADMIN_EMAIL} e ${MERCOSUL_ADMIN_EMAIL}. Resolva manualmente antes de rodar o seed.`
    );
  }

  if (oldAdmin && (!currentAdmin || currentAdmin.id === oldAdmin.id)) {
    return prisma.user.update({
      where: { id: oldAdmin.id },
      data: {
        name: oldAdmin.name || "Administrador",
        email: MERCOSUL_ADMIN_EMAIL,
        role: Role.ADMIN,
        active: true,
        mustChangePassword: false,
        borrachariaId,
      },
    });
  }

  if (currentAdmin) {
    return prisma.user.update({
      where: { id: currentAdmin.id },
      data: {
        role: Role.ADMIN,
        active: true,
        mustChangePassword: false,
        borrachariaId,
      },
    });
  }

  const fallbackPassword = await bcrypt.hash("admin123", 10);
  return prisma.user.upsert({
    where: { email: MERCOSUL_ADMIN_EMAIL },
    update: {
      role: Role.ADMIN,
      active: true,
      mustChangePassword: false,
      borrachariaId,
    },
    create: {
      name: "Administrador",
      email: MERCOSUL_ADMIN_EMAIL,
      passwordHash: fallbackPassword,
      role: Role.ADMIN,
      active: true,
      mustChangePassword: false,
      borrachariaId,
    },
  });
}

async function createOrUpdateMercosulOperator(borrachariaId: string) {
  // Primeiro tenta encontrar o operador pelo email correto
  const byEmail = await prisma.user.findUnique({ where: { email: MERCOSUL_OPERATOR_EMAIL } });

  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { role: Role.OPERATOR, active: true, mustChangePassword: false, borrachariaId },
    });
  }

  // Fallback: encontra qualquer OPERATOR existente nesta borracharia e atualiza o email
  const existing = await prisma.user.findFirst({
    where: { borrachariaId, role: Role.OPERATOR },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { email: MERCOSUL_OPERATOR_EMAIL, role: Role.OPERATOR, active: true, mustChangePassword: false },
    });
  }

  // Cria novo operador se não existir nenhum
  const defaultPassword = await bcrypt.hash("operador123", 10);
  return prisma.user.upsert({
    where: { email: MERCOSUL_OPERATOR_EMAIL },
    update: { role: Role.OPERATOR, active: true, mustChangePassword: true, borrachariaId },
    create: {
      name: "Operador",
      email: MERCOSUL_OPERATOR_EMAIL,
      passwordHash: defaultPassword,
      role: Role.OPERATOR,
      active: true,
      mustChangePassword: true,
      borrachariaId,
    },
  });
}

async function createOrUpdateDemoBorracharia() {
  const existingDemoWithoutCnpj = await prisma.borracharia.findFirst({
    where: {
      cnpj: null,
      name: DEMO_BORRACHARIA.name,
      isDemo: true,
    },
  });

  const data = {
    name: DEMO_BORRACHARIA.name,
    cnpj: DEMO_BORRACHARIA.cnpj,
    address: "Rua Demo, 123",
    city: "Demo",
    state: "SP",
    zipCode: "00000-999",
    timezone: "America/Sao_Paulo",
    active: true,
    planStatus: PlanStatus.TRIAL,
    planName: PlanName.FREE,
    trialEndsAt: addDays(new Date(), 30),
    subscriptionNotes:
      "AMBIENTE DEMO/TESTE. Dados ficticios, isolados e preparados para reset/reseed.",
    publicListingEnabled: false,
    publicName: DEMO_BORRACHARIA.publicName,
    publicDescription: DEMO_BORRACHARIA.publicDescription,
    publicPhone: "(11) 99999-0000",
    whatsappNumber: "5511999990000",
    latitude: null,
    longitude: null,
    openingHours: {
      monday: "08:00-18:00",
      tuesday: "08:00-18:00",
      wednesday: "08:00-18:00",
      thursday: "08:00-18:00",
      friday: "08:00-18:00",
      saturday: "08:00-12:00",
      sunday: "closed",
    },
    logoUrl: null,
    isDemo: true,
    demoSeedVersion: DEMO_SEED_VERSION,
    demoLastSeededAt: new Date(),
  };

  if (existingDemoWithoutCnpj) {
    return prisma.borracharia.update({
      where: { id: existingDemoWithoutCnpj.id },
      data,
    });
  }

  return prisma.borracharia.upsert({
    where: { cnpj: DEMO_BORRACHARIA.cnpj },
    update: data,
    create: data,
  });
}

async function seedDemoTenant(borrachariaId: string) {
  const [adminPassword, operatorPassword] = await Promise.all([
    bcrypt.hash(DEMO_CREDENTIALS.admin.password, 10),
    bcrypt.hash(DEMO_CREDENTIALS.operator.password, 10),
  ]);

  const [admin, operator] = await Promise.all([
    prisma.user.upsert({
      where: { email: DEMO_CREDENTIALS.admin.email },
      update: {
        name: DEMO_CREDENTIALS.admin.name,
        passwordHash: adminPassword,
        role: Role.ADMIN,
        active: true,
        mustChangePassword: false,
        borrachariaId,
      },
      create: {
        name: DEMO_CREDENTIALS.admin.name,
        email: DEMO_CREDENTIALS.admin.email,
        passwordHash: adminPassword,
        role: Role.ADMIN,
        active: true,
        mustChangePassword: false,
        borrachariaId,
      },
    }),
    prisma.user.upsert({
      where: { email: DEMO_CREDENTIALS.operator.email },
      update: {
        name: DEMO_CREDENTIALS.operator.name,
        passwordHash: operatorPassword,
        role: Role.OPERATOR,
        active: true,
        mustChangePassword: false,
        borrachariaId,
      },
      create: {
        name: DEMO_CREDENTIALS.operator.name,
        email: DEMO_CREDENTIALS.operator.email,
        passwordHash: operatorPassword,
        role: Role.OPERATOR,
        active: true,
        mustChangePassword: false,
        borrachariaId,
      },
    }),
  ]);

  const [serviceTypes, categories] = await Promise.all([
    createServiceTypes(borrachariaId, DEMO_SERVICE_TYPES, true),
    createExpenseCategories(borrachariaId, true),
  ]);

  const [transportadora, autoPecas, clienteAvulso] = await Promise.all([
    prisma.company.upsert({
      where: { id: DEMO_IDS.companies.transportadora },
      update: {
        borrachariaId,
        name: "Transportadora Demo Ltda",
        cnpj: "11.111.111/0001-11",
        contactName: "Marina Demo",
        phone: "(11) 91111-1111",
        active: true,
      },
      create: {
        id: DEMO_IDS.companies.transportadora,
        borrachariaId,
        name: "Transportadora Demo Ltda",
        cnpj: "11.111.111/0001-11",
        contactName: "Marina Demo",
        phone: "(11) 91111-1111",
      },
    }),
    prisma.company.upsert({
      where: { id: DEMO_IDS.companies.autoPecas },
      update: {
        borrachariaId,
        name: "Auto Peças Exemplo",
        cnpj: "22.222.222/0001-22",
        contactName: "Carlos Teste",
        phone: "(11) 92222-2222",
        active: true,
      },
      create: {
        id: DEMO_IDS.companies.autoPecas,
        borrachariaId,
        name: "Auto Peças Exemplo",
        cnpj: "22.222.222/0001-22",
        contactName: "Carlos Teste",
        phone: "(11) 92222-2222",
      },
    }),
    prisma.company.upsert({
      where: { id: DEMO_IDS.companies.clienteAvulso },
      update: {
        borrachariaId,
        name: "Cliente Avulso Demo",
        contactName: "Joao Cliente",
        phone: "(11) 93333-3333",
        active: true,
      },
      create: {
        id: DEMO_IDS.companies.clienteAvulso,
        borrachariaId,
        name: "Cliente Avulso Demo",
        contactName: "Joao Cliente",
        phone: "(11) 93333-3333",
      },
    }),
  ]);

  const [convenioMensal, convenioQuinzenal] = await Promise.all([
    prisma.convenio.upsert({
      where: { id: DEMO_IDS.convenios.mensal },
      update: {
        borrachariaId,
        companyId: transportadora.id,
        companyName: transportadora.name,
        paymentFrequency: PaymentFrequency.MONTHLY,
        nextPaymentDate: addDays(new Date(), 12),
        active: true,
        notes: "DEMO - convenio mensal para frota.",
        deletedAt: null,
      },
      create: {
        id: DEMO_IDS.convenios.mensal,
        borrachariaId,
        companyId: transportadora.id,
        companyName: transportadora.name,
        paymentFrequency: PaymentFrequency.MONTHLY,
        nextPaymentDate: addDays(new Date(), 12),
        active: true,
        notes: "DEMO - convenio mensal para frota.",
      },
    }),
    prisma.convenio.upsert({
      where: { id: DEMO_IDS.convenios.quinzenal },
      update: {
        borrachariaId,
        companyId: autoPecas.id,
        companyName: autoPecas.name,
        paymentFrequency: PaymentFrequency.BIWEEKLY,
        nextPaymentDate: addDays(new Date(), 7),
        active: true,
        notes: "DEMO - convenio quinzenal.",
        deletedAt: null,
      },
      create: {
        id: DEMO_IDS.convenios.quinzenal,
        borrachariaId,
        companyId: autoPecas.id,
        companyName: autoPecas.name,
        paymentFrequency: PaymentFrequency.BIWEEKLY,
        nextPaymentDate: addDays(new Date(), 7),
        active: true,
        notes: "DEMO - convenio quinzenal.",
      },
    }),
  ]);

  const demoServices = [
    {
      id: DEMO_IDS.services.trocaPneu,
      userId: operator.id,
      borrachariaId,
      serviceTypeId: requiredId(serviceTypes, "Troca de pneu"),
      description: "Pneu dianteiro - cliente avulso",
      vehiclePlate: "ABC1D23",
      amount: 45,
      amountPaid: 45,
      amountDue: 0,
      paymentMethod: PaymentMethod.PIX,
      paymentStatus: PaymentStatus.PAID,
      convenioId: null,
      convenioPaymentId: null,
      notes: "DEMO - movimento de hoje.",
      occurredAt: demoDate(0, 9, 15),
      deletedAt: null,
    },
    {
      id: DEMO_IDS.services.calibragem,
      userId: operator.id,
      borrachariaId,
      serviceTypeId: requiredId(serviceTypes, "Calibragem"),
      description: "Calibragem completa",
      vehiclePlate: "TES1E23",
      amount: 12,
      amountPaid: 12,
      amountDue: 0,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PAID,
      convenioId: null,
      convenioPaymentId: null,
      notes: null,
      occurredAt: demoDate(0, 11, 30),
      deletedAt: null,
    },
    {
      id: DEMO_IDS.services.convenioMensal,
      userId: admin.id,
      borrachariaId,
      serviceTypeId: requiredId(serviceTypes, "Balanceamento"),
      description: `Servico em convenio - ${transportadora.name}`,
      vehiclePlate: "TRK8A10",
      amount: 110,
      amountPaid: 0,
      amountDue: 110,
      paymentMethod: PaymentMethod.CONVENIO,
      paymentStatus: PaymentStatus.PENDING,
      convenioId: convenioMensal.id,
      convenioPaymentId: null,
      notes: "DEMO - pendente para aparecer no dashboard.",
      occurredAt: demoDate(0, 14, 10),
      deletedAt: null,
    },
    {
      id: DEMO_IDS.services.convenioQuinzenal,
      userId: operator.id,
      borrachariaId,
      serviceTypeId: requiredId(serviceTypes, "Remendo (pneu sem câmara)"),
      description: `Servico em convenio - ${autoPecas.name}`,
      vehiclePlate: "DEM0F15",
      amount: 65,
      amountPaid: 0,
      amountDue: 65,
      paymentMethod: PaymentMethod.CONVENIO,
      paymentStatus: PaymentStatus.PENDING,
      convenioId: convenioQuinzenal.id,
      convenioPaymentId: null,
      notes: null,
      occurredAt: demoDate(-2, 15, 45),
      deletedAt: null,
    },
    {
      id: DEMO_IDS.services.vulcanizacao,
      userId: admin.id,
      borrachariaId,
      serviceTypeId: requiredId(serviceTypes, "Vulcanização"),
      description: `Atendimento recorrente - ${clienteAvulso.name}`,
      vehiclePlate: "RUN5T90",
      amount: 95,
      amountPaid: 95,
      amountDue: 0,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.PAID,
      convenioId: null,
      convenioPaymentId: null,
      notes: null,
      occurredAt: demoDate(-8, 10, 20),
      deletedAt: null,
    },
    {
      id: DEMO_IDS.services.cortesia,
      userId: admin.id,
      borrachariaId,
      serviceTypeId: requiredId(serviceTypes, "Serviço avulso"),
      description: "Cortesia de teste",
      vehiclePlate: "DEMO000",
      amount: 20,
      amountPaid: 20,
      amountDue: 0,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.COURTESY,
      convenioId: null,
      convenioPaymentId: null,
      notes: "DEMO - cortesia nao entra como receita.",
      occurredAt: demoDate(-1, 16, 0),
      deletedAt: null,
    },
  ];

  for (const service of demoServices) {
    const { id, ...serviceData } = service;
    await prisma.service.upsert({
      where: { id },
      update: serviceData,
      create: service,
    });
  }

  const demoExpenses = [
    {
      id: DEMO_IDS.expenses.materiais,
      userId: admin.id,
      borrachariaId,
      categoryId: requiredId(categories, "Materiais e peças"),
      description: "Compra de remendos e valvulas",
      amount: 78.5,
      paymentMethod: PaymentMethod.PIX,
      hasReceipt: true,
      notes: "DEMO - despesa de hoje.",
      occurredAt: demoDate(0, 8, 40),
      deletedAt: null,
    },
    {
      id: DEMO_IDS.expenses.cafe,
      userId: operator.id,
      borrachariaId,
      categoryId: requiredId(categories, "Alimentação"),
      description: "Cafe da equipe",
      amount: 24,
      paymentMethod: PaymentMethod.CASH,
      hasReceipt: false,
      notes: null,
      occurredAt: demoDate(0, 12, 5),
      deletedAt: null,
    },
    {
      id: DEMO_IDS.expenses.aluguel,
      userId: admin.id,
      borrachariaId,
      categoryId: requiredId(categories, "Aluguel"),
      description: "Aluguel do ponto",
      amount: 1200,
      paymentMethod: PaymentMethod.PIX,
      hasReceipt: true,
      notes: null,
      occurredAt: demoDate(-5, 9, 0),
      deletedAt: null,
    },
    {
      id: DEMO_IDS.expenses.combustivel,
      userId: admin.id,
      borrachariaId,
      categoryId: requiredId(categories, "Combustível"),
      description: "Combustivel para atendimento externo",
      amount: 150,
      paymentMethod: PaymentMethod.CARD,
      hasReceipt: true,
      notes: null,
      occurredAt: demoDate(-3, 18, 20),
      deletedAt: null,
    },
  ];

  for (const expense of demoExpenses) {
    const { id, ...expenseData } = expense;
    await prisma.expense.upsert({
      where: { id },
      update: expenseData,
      create: expense,
    });
  }

  return { admin, operator };
}

async function main() {
  console.log("🌱 Iniciando seed multi-tenant...\n");

  const trialEndsAt = addDays(new Date(), 30);

  const sysAdminPassword = await bcrypt.hash("sysadmin123", 10);
  const sysAdmin = await prisma.user.upsert({
    where: { email: "gustavo.sbcarvalho@gmail.com" },
    update: {
      role: Role.SYSTEM_ADMIN,
      active: true,
      mustChangePassword: false,
      borrachariaId: null,
    },
    create: {
      name: "Gustavo (Admin Sistema)",
      email: "gustavo.sbcarvalho@gmail.com",
      passwordHash: sysAdminPassword,
      role: Role.SYSTEM_ADMIN,
      active: true,
      mustChangePassword: false,
      borrachariaId: null,
    },
  });
  console.log(`✅ SYSTEM_ADMIN: ${sysAdmin.email}`);

  const mercosul = await createOrUpdateMercosul(trialEndsAt);
  console.log(`✅ Mercosul: ${mercosul.name}`);

  const mercosulAdmin = await createOrUpdateMercosulAdmin(mercosul.id);
  const mercosulOperator = await createOrUpdateMercosulOperator(mercosul.id);
  console.log(`✅ Admin Mercosul:    ${mercosulAdmin.email}`);
  console.log(`✅ Operador Mercosul: ${mercosulOperator.email}`);

  await createServiceTypes(mercosul.id);
  await createExpenseCategories(mercosul.id);
  console.log("✅ Tipos de servico e categorias configurados para Mercosul");

  const demo = await createOrUpdateDemoBorracharia();
  const demoUsers = await seedDemoTenant(demo.id);
  console.log(`✅ ${demo.name}: dados DEMO sincronizados por upsert`);
  console.log(`   Admin demo:    ${demoUsers.admin.email}`);
  console.log(`   Operador demo: ${demoUsers.operator.email}`);

  console.log("\n✅ Seed concluido!\n");
  console.log("🔑 Credenciais:");
  console.log("   SYSTEM_ADMIN:    gustavo.sbcarvalho@gmail.com      / sysadmin123");
  console.log(`   Admin Mercosul:  ${MERCOSUL_ADMIN_EMAIL.padEnd(30)} / senha atual`);
  console.log(
    `   Admin demo:      ${DEMO_CREDENTIALS.admin.email.padEnd(30)} / ${DEMO_CREDENTIALS.admin.password}`
  );
  console.log(
    `   Operador demo:   ${DEMO_CREDENTIALS.operator.email.padEnd(30)} / ${DEMO_CREDENTIALS.operator.password}`
  );
  console.log("   ⚠️  Credenciais demo sao apenas para navegacao/teste.");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
