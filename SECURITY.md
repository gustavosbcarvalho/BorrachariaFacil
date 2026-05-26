# Security Notes

Este documento registra a postura atual de seguranca do Borracharia Facil e a
estrategia futura para Row Level Security (RLS) no Supabase.

## Arquitetura atual

- O banco Supabase e usado como PostgreSQL gerenciado.
- O app acessa o banco pelo backend Next.js usando Prisma.
- A autenticacao e feita com NextAuth usando credenciais.
- O frontend nao usa `@supabase/supabase-js`, Supabase Auth, Supabase Storage ou
  chamadas diretas ao banco.
- As telas client-side chamam endpoints Next.js ou Server Actions.
- O isolamento multi-tenant atual e aplicado no backend usando `borrachariaId`
  na sessao e filtros Prisma.

### Fluxo de acesso a dados

- Server Components leem dados com Prisma no servidor.
- Server Actions em `src/app/actions/*` fazem criacao, atualizacao e exclusao
  com validacao de sessao.
- O endpoint publico `GET /api/borracharias` usa Prisma no servidor e retorna
  apenas borracharias ativas com `id`, `name`, `city` e `state`, para permitir a
  selecao da borracharia na tela de login.

## Variaveis e chaves

- `DATABASE_URL` e `DIRECT_URL` sao variaveis server-side e nao devem receber o
  prefixo `NEXT_PUBLIC_`.
- `service_role` ou qualquer chave equivalente de administracao do Supabase nao
  deve existir no frontend, em componentes React, em rotas client-side, no
  `next.config.ts` via `env`, nem em arquivos commitados.
- Atualmente o projeto nao tem variaveis `NEXT_PUBLIC_SUPABASE_*` e nao usa
  cliente Supabase no navegador.
- Arquivos `.env*` locais devem permanecer fora do Git.

## Resultado da revisao atual

- Nao foi encontrado uso direto de Supabase no browser.
- Nao foi encontrado pacote `@supabase/supabase-js` no projeto.
- Nao foi encontrada `service_role key` no codigo versionado.
- Nao foi encontrada exposicao de `DATABASE_URL` para o frontend.
- Prisma esta concentrado em codigo de servidor: Server Components, Server
  Actions, API routes e helpers de autenticacao.

## Por que RLS ainda nao foi ativado

Os alertas do Supabase sao importantes, mas ativar RLS de forma imediata pode
quebrar o MVP se as policies forem criadas antes de ajustar a forma como o
Prisma informa o tenant atual ao banco.

O Prisma esta usando conexao direta/pooler com PostgreSQL. Diferente do fluxo
Supabase client + JWT no browser, o banco nao recebe automaticamente o usuario
NextAuth nem o `borrachariaId` da sessao. Se RLS for ativado sem uma estrategia
de contexto de tenant, queries legitimas do backend podem passar a retornar zero
linhas ou falhar.

Por isso, neste momento RLS fica planejado como defesa em profundidade, nao como
mudanca imediata de comportamento.

## Riscos atuais

- O isolamento entre tenants depende da disciplina do codigo backend em sempre
  filtrar por `borrachariaId`.
- Novas queries Prisma podem esquecer o filtro de tenant se nao seguirem os
  padroes existentes.
- IDs enviados por formularios precisam continuar sendo validados no backend
  para garantir que pertencem ao tenant da sessao.
- Um vazamento de `DATABASE_URL`, `DIRECT_URL` ou credenciais administrativas
  daria acesso direto ao banco fora das protecoes da aplicacao.
- Como RLS ainda nao esta ativo, ele ainda nao protege contra bugs futuros em
  queries server-side.

## Tabelas candidatas a RLS

As seguintes tabelas devem receber RLS quando a estrategia estiver pronta:

- `services`
- `expenses`
- `users`
- `convenios`
- `companies`
- `borracharias`

Tabelas relacionadas que provavelmente tambem precisarao de politicas depois:

- `service_types`
- `expense_categories`
- `convenio_payments`

## Estrategia futura compativel com Prisma multi-tenant

1. Criar um papel de banco especifico da aplicacao, sem permissao de owner,
   superuser ou bypass de RLS, para ser usado pelo `DATABASE_URL` em runtime.
2. Definir uma forma padronizada de informar o tenant atual para cada operacao
   Prisma, por exemplo uma transacao que execute `set_config` com o
   `borrachariaId` da sessao antes das queries da requisicao.
3. Criar policies que comparem `borracharia_id` com o tenant definido na sessao
   do banco.
4. Tratar casos especiais:
   - `SYSTEM_ADMIN` precisa de policies separadas ou caminho administrativo
     controlado.
   - `borracharias` tem leitura publica limitada para a tela de login.
   - registros globais/publicos devem ser modelados explicitamente, evitando
     `NULL` ambiguo em `borracharia_id`.
5. Adicionar testes de regressao multi-tenant antes de ativar RLS em producao.
6. Ativar RLS primeiro em ambiente de staging, validar login, CRUD principal,
   relatorios, convenios e administracao.
7. So depois criar uma migration de producao para habilitar RLS.

## Politicas esperadas por tabela

- `services`: usuarios do tenant podem ler/criar/atualizar somente registros com
  `borracharia_id` igual ao tenant atual; exclusao logica segue a mesma regra.
- `expenses`: mesmas regras de tenant de `services`.
- `users`: usuarios comuns podem ler dados minimos do proprio tenant; alteracoes
  administrativas ficam restritas a admins do tenant ou `SYSTEM_ADMIN`.
- `convenios`: acesso restrito ao tenant dono; pagamentos associados devem
  herdar a restricao pelo convenio.
- `companies`: acesso restrito ao tenant dono.
- `borracharias`: leitura publica deve ser limitada aos campos necessarios para
  login/listagem; leitura completa e escrita devem ser administrativas.

## Guardrails antes de ativar RLS

- Manter Prisma fora de Client Components.
- Manter `DATABASE_URL`, `DIRECT_URL` e segredos sem prefixo `NEXT_PUBLIC_`.
- Nao usar `service_role` no frontend.
- Validar no servidor que IDs recebidos por formulario pertencem ao
  `borrachariaId` da sessao.
- Evitar novas queries sem filtro de tenant em areas autenticadas.
- Nao ativar RLS manualmente no painel Supabase sem migration revisada e testada.

