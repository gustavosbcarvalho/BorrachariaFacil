# Deploy — Borracharia Fácil

Guia completo para configurar o banco de dados no Supabase, rodar migrations, seed e publicar na Vercel.

---

## Visão geral da arquitetura

```
SYSTEM_ADMIN (gustavo.sbcarvalho@gmail.com)
  └── /admin — gerencia borracharias e usuários
        └── Borracharia A → usuarios, servicos, despesas, convenios
        └── Borracharia B → ...
```

---

## Pré-requisitos

- Conta criada em [supabase.com](https://supabase.com)
- Conta criada em [vercel.com](https://vercel.com)
- Node.js 18+ instalado localmente
- Repositório no GitHub: `github.com/gustavosbcarvalho/BorrachariaFacil`

---

## 1. Configurar o Supabase

### 1.1 Connection strings

Acesse: **app.supabase.com → projeto → Settings → Database → Connection string**

Você precisa de **duas** URLs:

| Variável | Aba no Supabase | Porta | Para quê |
|---|---|---|---|
| `DATABASE_URL` | **Transaction Pooler** | **6543** + `?pgbouncer=true` | Queries em runtime (Vercel) — suporta muitas conexões |
| `DIRECT_URL` | **Session Pooler** | **5432** | Migrations e seed — máx 15 conexões |

> **Por que Transaction Pooler para DATABASE_URL?**
> O Vercel cria funções serverless independentes por request. Sem o Transaction Pooler,
> cada função abre uma conexão no Session Pooler (limite: 15), que esgota rapidamente
> com múltiplos usuários ou páginas que fazem várias queries em paralelo.

Formato:
```
# DATABASE_URL — Transaction Pooler (porta 6543)
postgresql://postgres.SEU_REF:[SENHA]@aws-1-REGIAO.pooler.supabase.com:6543/postgres?pgbouncer=true

# DIRECT_URL — Session Pooler (porta 5432)
postgresql://postgres.SEU_REF:[SENHA]@aws-1-REGIAO.pooler.supabase.com:5432/postgres
```

> **Atenção:** A senha pode ter `/` — codifique como `%2F` na URL.
> Ex: `senha2j/3WU` → `senha2j%2F3WU`

---

## 2. Configurar variáveis locais

```bash
cp .env.example .env
```

Edite `.env`:

```env
DATABASE_URL="postgresql://postgres.SEU_REF:SENHA@aws-1-REGIAO.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.SEU_REF:SENHA@aws-1-REGIAO.pooler.supabase.com:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-com-node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
```

---

## 3. Rodar migrations

```bash
# Aplica todas as migrations pendentes (init + multi_tenant)
npx prisma migrate deploy
```

Esperado:
```
2 migrations found in prisma/migrations
All migrations have been successfully applied.
```

---

## 4. Rodar o seed

```bash
npm run db:seed
```

O seed cria:
- **SYSTEM_ADMIN:** `gustavo.sbcarvalho@gmail.com` / `sysadmin123`
- **Borracharia Mercosul - 61.539.497/0001-05** com tipos de serviço e categorias padrão
- **Admin Mercosul:** `alexs2007@hotmail.com` / senha atual
- **Borracharia Teste** com dados fictícios DEMO, serviços, despesas, convênios, clientes, tipos e categorias
- **Admin demo:** `admin.demo@borrachariafacil.com` / `demo123`
- **Operador demo:** `operador.demo@borrachariafacil.com` / `demo123`

> ⚠️ **Troque todas as senhas após o primeiro login!**

---

## 5. Testar localmente

```bash
npm run dev
```

Fluxo de teste:
1. Acesse `http://localhost:3000`
2. Abra "Ambiente de Demonstração"
3. Use o botão "Entrar no ambiente de demonstração"
4. Para acessar o painel admin: use "Acesso administrativo do sistema" no login

---

## 6. Publicar na Vercel

### 6.1 Importar o projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe `gustavosbcarvalho/BorrachariaFacil`
3. Framework Preset: **Next.js** (obrigatório — se aparecer "Other", corrigir em Settings)

### 6.2 Variáveis de ambiente na Vercel

Adicione as 4 variáveis em **Settings → Environment Variables**:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | URL do Session Pooler Supabase |
| `DIRECT_URL` | Mesma URL |
| `NEXTAUTH_URL` | URL do deploy (ex: `https://borrachariafacil.vercel.app`) |
| `NEXTAUTH_SECRET` | String aleatória segura (hex de 64 chars) |

> **Importante:** `NEXTAUTH_URL` deve ser exatamente a URL final do deploy, sem barra no final.

### 6.3 Deploy

Clique em **Deploy**. O build roda:
```
prisma generate && next build
```

O `prisma generate` garante que o Prisma Client usa o schema correto.

### 6.4 Rodar migrations em produção

Após o deploy, com as variáveis de produção no `.env` local:

```bash
npx prisma migrate deploy
npm run db:seed
```

---

## 7. Configurar a Borracharia Mercosul (SYSTEM_ADMIN)

1. Acesse `https://borrachariafacil.vercel.app`
2. Clique em **"Acesso administrativo do sistema"**
3. Login: `gustavo.sbcarvalho@gmail.com` / `sysadmin123`
4. Vá em **/admin → Borracharias**
5. Clique em **"Borracharia Mercosul - 61.539.497/0001-05"** para revisar os dados reais (endereço, cidade, CEP, etc.)
6. O administrador configurado é `alexs2007@hotmail.com`; mantenha o operador existente sem alterar senha.

---

## 8. Adicionar nova borracharia (futuro)

1. Login como SYSTEM_ADMIN → `/admin`
2. **Nova Borracharia** → preencha dados + usuário admin inicial
3. Tipos de serviço e categorias padrão são criados automaticamente
4. O operador/admin da borracharia pode personalizar depois em **Configurações**

---

## 9. Checklist de testes manuais pelo celular

Ver arquivo [CHECKLIST.md](CHECKLIST.md)

---

## Comandos úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção (verificar erros)
npm run build

# Migrations
npx prisma migrate deploy      # aplica migrations pendentes
npx prisma migrate status      # verifica estado das migrations

# Dados
npm run db:seed                # popula banco inicial
npx prisma studio              # interface visual do banco (local)
```

---

## Estrutura de custos (free tiers)

| Serviço | Free tier | Limite |
|---|---|---|
| Vercel | Hobby (gratuito) | 100 GB bandwidth/mês |
| Supabase | Free | 500 MB banco, 50k req/mês, 2 projetos |

Para uma borracharia pequena esses limites são mais que suficientes.
