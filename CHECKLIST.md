# Checklist de Testes Manuais — Celular

Teste com o celular em modo retrato (vertical). Cada item deve ser verificado antes de entregar o sistema ao usuário final.

---

## Antes de começar

- [ ] Abrir o link no **navegador do celular** (Chrome ou Safari)
- [ ] Verificar que a página carrega sem erro 404 ou tela branca
- [ ] Verificar que o layout ocupa a tela inteira (não está cortado)

---

## 1. Seleção de Borracharia e Login

- [ ] Ao abrir o site, aparece a tela de busca de borracharia
- [ ] Campo de busca está visível e responsivo ao toque
- [ ] Ao digitar, a lista de borracharias filtra corretamente
- [ ] Ao tocar na borracharia, avança para a tela de login
- [ ] O nome da borracharia aparece no topo da tela de login
- [ ] Botão "Toque para trocar" retorna para a seleção de borracharia
- [ ] Login com email/senha errados exibe mensagem de erro
- [ ] Login com **admin** funciona → redireciona para dashboard
- [ ] Login com **operador** funciona → redireciona para dashboard
- [ ] Login com email de outra borracharia é recusado (erro)
- [ ] **Acesso administrativo do sistema** → leva ao painel `/admin`

---

## 2. Persistência da Borracharia

- [ ] Fechar o navegador e reabrir → borracharia ainda está selecionada
- [ ] Na tela de login, ainda mostra o nome da borracharia anterior
- [ ] Botão "Trocar" limpa a seleção e volta para busca

---

## 3. Dashboard (Admin e Operador)

- [ ] Cards de "Hoje" aparecem com valores corretos
- [ ] Card "Entradas de hoje" mostra valor e contagem de serviços
- [ ] Card "Gastos de hoje" mostra valor correto
- [ ] Card "Saldo do dia" calcula corretamente
- [ ] Botão "Novo Serviço" está grande e clicável
- [ ] Botão "Nova Despesa" está grande e clicável
- [ ] **Admin:** cards do mês aparecem (Entradas, Gastos, Saldo)
- [ ] **Operador:** cards do mês NÃO aparecem
- [ ] **Admin:** links "Relatórios" e "Histórico de Serviços" aparecem
- [ ] **Operador:** esses links NÃO aparecem
- [ ] Alerta de serviços pendentes aparece quando há pendências

---

## 4. Lançar Serviço (Operador e Admin)

- [ ] Formulário abre ao tocar em "Novo Serviço"
- [ ] Data e hora preenchidos automaticamente com o momento atual
- [ ] Campo de tipo de serviço tem as opções corretas (ex: Troca de pneu)
- [ ] Campos de forma de pagamento: Dinheiro, PIX, Cartão são tocáveis
- [ ] Seleção de status: Pago, Pendente, Cortesia funcionam
- [ ] Campo de valor aceita números com vírgula/ponto no celular
- [ ] Botão "Salvar Serviço" funciona e volta para o dashboard
- [ ] Dashboard atualiza "Entradas de hoje" após salvar
- [ ] Salvar serviço como **Convênio** → aparece seletor de empresa
- [ ] Serviço de convênio fica com status Pendente no dashboard

---

## 5. Lançar Despesa (Operador e Admin)

- [ ] Formulário abre ao tocar em "Nova Despesa"
- [ ] Data preenchida automaticamente com hoje
- [ ] Categorias disponíveis (ex: Materiais e peças, Aluguel)
- [ ] Opções "Com nota" / "Sem nota" funcionam
- [ ] Formas de pagamento: Dinheiro, PIX, Cartão funcionam
- [ ] Botão "Salvar Despesa" funciona e volta para o dashboard
- [ ] Dashboard atualiza "Gastos de hoje" após salvar

---

## 6. Relatórios (Admin apenas)

- [ ] Aba "Hoje" exibe dados corretos
- [ ] Aba "Semana" exibe dados do período correto
- [ ] Aba "Mês" exibe dados do mês atual
- [ ] "Total recebido", "Gastos" e "Saldo" batem com o lançado
- [ ] "Entradas por forma de pagamento" lista Dinheiro, PIX, Cartão
- [ ] "Serviços executados" lista tipos com contagem
- [ ] "Gastos por categoria" lista categorias com valores
- [ ] "Gastos com NF" e "Sem NF" aparecem se houver dados
- [ ] Serviços pendentes mostram valor a receber

---

## 7. Histórico de Serviços (Admin apenas)

- [ ] Lista os serviços do dia/semana
- [ ] Cada card mostra: tipo, valor, forma de pagamento, status, data
- [ ] Status PENDENTE mostra botão "Marcar como Pago"
- [ ] Ao tocar em "Marcar como Pago", status atualiza
- [ ] Botão "Excluir" solicita confirmação antes de deletar
- [ ] Após excluir, serviço some da lista e dashboard atualiza

---

## 8. Convênios (Admin apenas)

- [ ] Acessível via Configurações → Convênios
- [ ] "Novo Convênio" abre formulário de cadastro
- [ ] Periodicidade Semanal/Quinzenal/Mensal funcionam
- [ ] Convênio criado aparece na lista
- [ ] Ao registrar serviço com Convênio, aparece a empresa cadastrada
- [ ] Serviço de convênio fica com status "Pendente" e valor em aberto
- [ ] Botão "Registrar Pagamento" abre tela de liquidação
- [ ] Tela de liquidação mostra serviços pendentes em ordem de data (mais antigos primeiro)
- [ ] Mostra total em aberto
- [ ] Ao informar valor e salvar:
  - [ ] Serviços mais antigos ficam com status "Pago"
  - [ ] Se valor não cobre tudo: último serviço fica "Parcial"
  - [ ] Dashboard atualiza
- [ ] Data do próximo pagamento avança conforme periodicidade

---

## 9. Configurações (Admin apenas)

- [ ] Lista tipos de serviço da borracharia
- [ ] "Adicionar" novo tipo funciona
- [ ] Toggle Ativo/Inativo funciona (inativo some do formulário de serviço)
- [ ] Lista categorias de despesa
- [ ] "Adicionar" nova categoria funciona
- [ ] Toggle Ativo/Inativo funciona (inativo some do formulário de despesa)

---

## 10. Painel Admin do Sistema (SYSTEM_ADMIN)

- [ ] Login via "Acesso administrativo" funciona
- [ ] `/admin` lista borracharias cadastradas
- [ ] "Nova Borracharia" cria uma borracharia com dados e usuário admin
- [ ] Tipos e categorias padrão são criados automaticamente
- [ ] Editar dados de uma borracharia funciona
- [ ] Ativar/Desativar borracharia funciona
- [ ] Adicionar usuário à borracharia funciona
- [ ] Ativar/Desativar usuário funciona
- [ ] SYSTEM_ADMIN NÃO vê dashboard, serviços, despesas de borracharia

---

## 11. Segurança (verificações básicas)

- [ ] Acessar `/dashboard` sem login redireciona para `/login`
- [ ] Operador não consegue acessar `/reports` (redireciona para dashboard)
- [ ] Operador não consegue acessar `/settings` (redireciona para dashboard)
- [ ] SYSTEM_ADMIN não consegue acessar `/dashboard` (redireciona para `/admin`)
- [ ] Dados de uma borracharia não aparecem para usuário de outra borracharia
- [ ] Botão "Sair" desloga corretamente e volta para seleção de borracharia

---

## 12. Usabilidade mobile

- [ ] Todos os botões têm tamanho mínimo de toque confortável
- [ ] Teclado numérico aparece ao tocar em campos de valor
- [ ] A navegação inferior (BottomNav) está sempre visível
- [ ] Não há scroll horizontal em nenhuma tela
- [ ] Textos não estão cortados nas telas menores
- [ ] O site pode ser "instalado" como PWA (ícone na tela inicial)

---

## Resultado esperado

Todos os itens marcados = sistema pronto para uso em produção pela borracharia real validada.
