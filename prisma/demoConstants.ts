export const DEMO_SEED_VERSION = 1;

export const DEMO_BORRACHARIA = {
  name: "Borracharia Teste",
  cnpj: "99.999.999/0001-99",
  publicName: "Borracharia Teste",
  publicDescription: "Ambiente DEMO com dados ficticios para teste do sistema.",
} as const;

export const DEMO_CREDENTIALS = {
  admin: {
    label: "Admin demo",
    name: "Admin Demo",
    email: "admin.demo@borrachariafacil.com",
    password: "demo123",
  },
  operator: {
    label: "Operador demo",
    name: "Operador Demo",
    email: "operador.demo@borrachariafacil.com",
    password: "demo123",
  },
} as const;
