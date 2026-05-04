# Deploy — Borracharia Fácil

Guia completo para configurar o banco de dados no Supabase, rodar migrations, seed, e publicar na Vercel.

---

## Pré-requisitos

- Conta criada em [supabase.com](https://supabase.com)
- Conta criada em [vercel.com](https://vercel.com)
- Node.js 18+ instalado localmente
- Repositório no GitHub (recomendado para integração com Vercel)

---

## 1. Configurar o Supabase

### 1.1 Criar projeto

1. Acesse [app.supabase.com](https://app.supabase.com) → **New Project**
2. Escolha nome (ex: `borracharia-facil`), região (South America – São Paulo) e defina uma senha forte para o banco
3. Aguarde o projeto inicializar (~2 min)

### 1.2 Obter as connection strings

1. No painel do projeto → **Settings** → **Database**
2. Role até a seção **Connection string**
3. Selecione a aba **URI**

Você vai precisar de **duas** strings:

| Variável | Como obter | Para quê |
|---|---|---|
| `DATABASE_URL` | URI com `?pgbouncer=true` na porta **6543** | Queries em runtime (Vercel) |
| `DIRECT_URL` | URI na porta **5432** (sem pgbouncer) | Migrations e seed |

A URL de pooling fica assim:
```
postgresql://postgres:[SENHA]@db.[REF].supabase.co:6543/postgres?pgbouncer=true
```

A URL direta fica assim:
```
postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres
```

---

## 2. Configurar variáveis locais

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env com suas URLs reais do Supabase
```

Conteúdo do `.env`:

```env
DATABASE_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cole-aqui-uma-string-aleatoria-segura"
```

Para gerar o `NEXTAUTH_SECRET`:
```bash
# Opção 1 — OpenSSL (Linux/Mac/WSL)
openssl rand -base64 32

# Opção 2 — Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 3. Rodar a migration

```bash
# Cria as tabelas no banco Supabase
npx prisma migrate dev --name init
```

Se preferir sem histórico de migration (mais simples):
```bash
npx prisma db push
```

> Use `migrate dev` para desenvolvimento com histórico versionado.
> Use `db push` para prototipação rápida.

---

## 4. Rodar o seed

```bash
npm run db:seed
```

Isso cria:
- Usuário **admin**: `admin@borracharia.com` / `admin123`
- Usuário **operador**: `operador@borracharia.com` / `operador123`
- 10 tipos de serviço
- 10 categorias de despesa

> ⚠️ **Troque as senhas após o primeiro login!**

---

## 5. Testar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e faça login com as credenciais do seed.

---

## 6. Publicar na Vercel

### 6.1 Subir o código para o GitHub

```bash
git init
git add .
git commit -m "feat: borracharia facil MVP"
git branch -M main
git remote add origin https://github.com/gustavosbcarvalho/BorrachariaFacil.git
git push -u origin main
```

### 6.2 Importar projeto na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import** no repositório `borracharia-facil`
3. Framework Preset: **Next.js** (detectado automaticamente)
4. Clique em **Environment Variables** e adicione:

| Chave | Valor |
|---|---|
| `DATABASE_URL` | URL com pgbouncer (porta 6543) |
| `DIRECT_URL` | URL direta (porta 5432) |
| `NEXTAUTH_SECRET` | String aleatória gerada no passo 2 |
| `NEXTAUTH_URL` | URL do seu deploy (ex: `https://borracharia.vercel.app`) |

> ⚠️ O `NEXTAUTH_URL` deve ser a URL **final** do deploy. Se mudar o domínio, atualize essa variável.

5. Clique em **Deploy**

### 6.3 Rodar migration em produção (uma vez)

Após o deploy, rode a migration apontando para o banco de produção:

```bash
# No terminal local, com as variáveis de produção no .env
npx prisma migrate deploy

# E o seed (apenas uma vez)
npm run db:seed
```

Ou configure no Supabase via **SQL Editor** se preferir.

---

## 7. Domínio personalizado (opcional)

1. Na Vercel → projeto → **Settings** → **Domains**
2. Adicione seu domínio
3. Atualize o `NEXTAUTH_URL` para o novo domínio e faça redeploy

---

## 8. Checklist de testes manuais pelo celular

### Login
- [ ] Abre a URL no navegador do celular
- [ ] Tela de login aparece corretamente
- [ ] Login com credenciais erradas mostra erro
- [ ] Login com admin funciona → redireciona para dashboard
- [ ] Login com operador funciona → redireciona para dashboard
- [ ] Botão sair funciona

### Dashboard
- [ ] Cards de hoje aparecem (mesmo zerados)
- [ ] Botões "Novo Serviço" e "Nova Despesa" estão visíveis e grandes
- [ ] Admin vê cards do mês e links de Relatórios/Histórico
- [ ] Operador NÃO vê relatórios nem histórico

### Serviços (operador)
- [ ] Formulário abre corretamente
- [ ] Campos de seleção de pagamento e status são tocáveis
- [ ] Data/hora preenchida automaticamente
- [ ] Salvar volta para o dashboard
- [ ] Card "Entradas de hoje" atualiza

### Despesas (operador)
- [ ] Formulário abre corretamente
- [ ] Opções de "Com nota" / "Sem nota" funcionam
- [ ] Salvar volta para o dashboard

### Relatórios (admin)
- [ ] Aba "Hoje" mostra dados corretos
- [ ] Aba "Semana" e "Mês" funcionam
- [ ] Totais batem com o que foi lançado

### Configurações (admin)
- [ ] Lista de tipos de serviço aparece
- [ ] Adicionar novo tipo de serviço funciona
- [ ] Ativar/desativar tipo funciona
- [ ] Mesmo para categorias de despesa

---

## Estrutura de custos (free tiers)

| Serviço | Free tier | Limite |
|---|---|---|
| Vercel | Hobby (gratuito) | 100 GB bandwidth/mês, deploys ilimitados |
| Supabase | Free | 500 MB banco, 50k req/mês, 2 projetos |

Para o porte de uma borracharia pequena, esses limites são **mais que suficientes**.

---

## Comandos úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção (verificar erros)
npm run db:seed      # Popular banco com dados iniciais
npx prisma studio    # Interface visual do banco (local)
npx prisma migrate dev --name <nome>  # Nova migration
```
