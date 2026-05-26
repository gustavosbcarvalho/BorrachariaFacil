# Roadmap — Borracharia Fácil

Este roadmap organiza a evolução do Borracharia Fácil com foco em uso real, celular, simplicidade operacional e segurança incremental.

O projeto não deve virar um ERP completo. A prioridade é resolver bem a rotina diária da borracharia piloto, manter o multi-tenant seguro e evoluir somente a partir de necessidades observadas em produção.

## Fase 1 — Implementar Agora

Objetivo: melhorar operação diária, segurança básica e UX do piloto.

### 1. Troca de senha

- Permitir usuário trocar a própria senha.
- Priorizar SYSTEM_ADMIN e usuários reais.
- Evitar dependência de senhas seedadas.

### 2. Editar serviço e despesa

- Permitir corrigir erro de lançamento.
- Preservar tenant scoping.
- Não permitir edição entre borracharias.

### 3. Placa do veículo no serviço

- Adicionar campo `vehicle_plate` nos serviços.
- Exibir nas listagens.
- Permitir buscar por placa.

### 4. Filtro por data e busca

- Filtros em serviços e despesas.
- Busca por placa, descrição, valor, tipo e cliente quando existir.

### 5. Feedback visual ao salvar

- Toast/snackbar ou mensagem clara.
- Sucesso e erro visíveis.
- UX mobile.

### 6. Limpeza de warnings do build

- Remover imports não usados.
- Manter `npm run build` limpo ou quase limpo.

## Fase 2 — Roadmap Curto

Objetivo: melhorar operação real após alguns dias de uso na borracharia piloto.

### 1. Fechamento diário de caixa

- Criar estrutura `daily_closings`.
- Total por dinheiro, pix, cartão e convênio.
- Total de despesas.
- Responsável pelo fechamento.

### 2. Exportar relatórios

- CSV inicialmente.
- PDF depois, se simples.
- Foco em contabilidade e conferência.

### 3. Alertas de convênio

- Vencimento próximo.
- Vencido.
- Total em aberto por empresa.

### 4. Cadastro simples de cliente

- Nome.
- Telefone.
- Observação.
- Relação futura com serviços.

### 5. Dashboard comparativo

- Mês atual x mês anterior.
- Entradas, despesas e saldo.

### 6. Observação/comprovante em pagamento de convênio

- Campo para número de comprovante.
- Banco.
- Observações.

## Fase 3 — Roadmap Longo

Objetivo: expansão SaaS e diferenciação comercial.

### 1. RLS real no Supabase

- Planejar com cuidado.
- Não quebrar Prisma.
- Compatível com multi-tenant.

### 2. Marketplace/localização pública

- Localizar borracharias próximas.
- Serviços públicos.
- Preços divulgados por quem autorizar.
- Unir demanda x oferta.

### 3. PWA/offline parcial

- Uso básico em conexão instável.
- Sincronização futura.

### 4. Controle de estoque simples

- Câmaras.
- Pneus.
- Entradas/saídas simples.

### 5. Monetização/planos

- FREE/BASIC/PRO.
- TRIAL/ACTIVE/SUSPENDED/CANCELLED.
- Preparar sem gateway inicialmente.

### 6. Integração de pagamento futura

- Stripe ou Pagar.me.
- Somente depois de validar produto.

### 7. Upload de comprovantes/fotos

- Notas fiscais.
- Despesas.
- Comprovantes.

### 8. Compartilhar recibo por WhatsApp

- Gerar resumo simples do serviço.
- Enviar para cliente.

### 9. Relatório por operador

- Produtividade.
- Valores lançados.
- Quantidade de serviços.

### 10. Dashboard global SYSTEM_ADMIN

- Borracharias ativas.
- Uso do sistema.
- Métricas gerais.
