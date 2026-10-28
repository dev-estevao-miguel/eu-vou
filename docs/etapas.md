# Etapas e andamento

Atualizado em 26/10/2026.

| Etapa | Escopo                                                                                                      | Situação                                      |
| ----- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1     | Diagnóstico, decisões essenciais, ambiente local, base visual, estrutura                                    | **Concluída**                                 |
| 2     | Persistência, autenticação real, perfis, autorização, convite, cadastro e acesso                            | **Concluída** e publicada                     |
| 3     | Atividade → presença → foto privada → análise → aprovação → crédito único → três rankings                   | **Concluída** e publicada (pendências abaixo) |
| 4     | Participantes e convites, ajustes e reenvios, recuperação de senha, desafios simples, notificações internas | —                                             |
| 5     | Fechamento mensal, premiação, histórico, revisão da PWA, preparação do piloto                               | —                                             |

Fora do primeiro MVP: quiz, participação infantil, campanhas conjuntas, notificações push.

## Etapa 1 — concluída

- Projeto React + TypeScript + Vite com PWA (manifesto, ícones gerados da marca, service worker só com o shell
  estático e atualização confirmada pela pessoa).
- Tokens e componentes do Lote 1; catálogo em `/dev/componentes` (somente desenvolvimento).
- Verificado: typecheck, lint e build; catálogo no Edge em 390 e 360 px sem rolagem horizontal nem erros.

## Etapa 2 — o que está pronto

### Banco (`supabase/migrations/20261026120000_nucleo.sql`)

- Igrejas, congregações, campanhas, perfis, vínculos, funções, convites, auditoria e configurações, com RLS em todas.
- Regras de permissão no schema `privado` (fora da API): aprovação de vínculo (C08), cadastro completo (matriz),
  geração de convite (matriz), atuação na congregação.
- Funções: `criar_convite`, `revogar_convite`, `consultar_convite` (pública), `registrar_cadastro` (só a Edge
  Function), `listar_cadastros_pendentes` (C09), `decidir_vinculo` (transição atômica), `minha_conta`,
  `conceder_funcao`/`revogar_funcao` (admin, nunca a própria), `config_publica`.

### Edge Function `cadastro`

Valida convite e dados no servidor, cria a conta com o e-mail técnico (C02) e registra perfil + vínculo pendente;
desfaz a conta se o registro falhar.

### App

- Entrada (A01) com os estados: campos vazios, credenciais inválidas, muitas tentativas, sem conexão, conta
  desativada, sessão encerrada.
- Cadastro por convite em 2 etapas (grupo e congregação travados pelo convite).
- Conta em análise / cadastro recusado com motivo.
- Perfil básico (dados, área da direção, sair).
- Área da direção: cadastros pendentes (aprovar / recusar com motivo), convites (gerar, compartilhar no WhatsApp,
  cancelar) e funções (admin).
- Rotas protegidas por estado da conta; sem `.env.local`, as rotas protegidas mostram “configuração ausente”.

### Operação

- `npm run criar-admin`: cria o primeiro administrador (chave secreta só na sessão do terminal; senha oculta).
- `supabase/testes/estrutura-teste.sql`: igreja/congregação/campanha fictícias.
- `supabase/testes/limpar-dados-teste.sql`: remove tudo que é de teste e preserva os dados reais.

### Verificado

- 25 testes automáticos (`npm test`): 21 de banco rodando a migração real em Postgres (PGlite) com o ambiente Supabase
  simulado — acesso entre grupos e congregações, cadastro sem autoatribuição de cargo, convites, dados pessoais,
  decisões repetidas, perda de poder com campanha encerrada, limpeza dos dados de teste — e 4 das regras de cadastro.
- Edge Function verificada com `deno check`.
- Typecheck, lint e build sem erros. Tela de entrada conferida no Edge em 390 px.

### Aplicado no Supabase (26/10/2026)

- Migração `20261026120000_nucleo` aplicada no projeto `<id-do-projeto-supabase>` (banco estava vazio).
- Estrutura fictícia criada (“Igreja de teste” → “Vila Demo (teste)” → campanha de teste).
- `db advisors`: avisos de segurança só sobre funções chamáveis pela API — todas intencionais e com checagem de
  permissão interna; `rls_auto_enable` é o gatilho do próprio Supabase que liga RLS em tabelas novas. Desempenho:
  apenas informativos (chaves estrangeiras de auditoria sem índice — entram na próxima migração).
- Teste pela API pública como visitante: configurações públicas ok; perfis, `registrar_cadastro` e `criar_convite`
  negados.

- Edge Function `cadastro` publicada (autorizada pelo Estevão): valida dados no servidor, recusa convite inexistente,
  responde ao preflight CORS; `verify_jwt` desligado como previsto.
- App publicado na Vercel em **<https://<seu-app>.vercel.app>** (autorizado): rotas do app, manifesto, service
  worker e cabeçalhos de segurança conferidos; nenhum `.env` enviado (conferido com `--dry`) e nenhuma chave secreta
  no JavaScript publicado; página de convite consultando o Supabase real, sem erros no console.

- Administrador criado pelo link de configuração inicial (C14): 1 admin ativo, link consumido, conta real
  (`teste = false`), auditoria registrada, nenhuma conta órfã. **O Supabase Auth aceita o domínio técnico
  `contas.euvou.invalid`.**
- Cadastro por convite de ponta a ponta no app publicado (Edge, 390 px), com a conta fictícia `teste.jovem1`
  (Jovens · Vila Demo (teste)): validação dos campos, cadastro pela Edge Function, entrada automática, tela “em
  análise”; antes da aprovação `/inicio` volta para a análise e `/gestao` mostra “Acesso restrito”; sem erros.

### Não verificado ainda

- Aprovação de `teste.jovem1` pelo painel do admin e entrada como participante ativo.
- Instalação da PWA em celular real.
- Decisões simultâneas reais (o PGlite tem uma conexão só; a garantia vem do `update … where situacao = 'pendente'`).

### Pendências conhecidas da Etapa 2

- Foto de perfil no cadastro (precisa do bucket privado de avatares; entra junto com o Storage da Etapa 3).
- Pessoa que já tem conta abrindo um convite (hoje é redirecionada para a própria área).
- Edição de WhatsApp e nome de exibição no perfil.
- Otimizações de tamanho: ícones só com os pesos usados (~80 KB) e cliente Supabase sem tempo real (~55 KB).
- Limite de cadastros por convite / proteção contra abuso do link (hoje: validade, cancelamento e aprovação obrigatória).

## Etapa 3 — o que está pronto

### Banco (`supabase/migrations/20261026180000_presencas.sql`)

- Atividades (modelo) e ocorrências (data, horário e pontos próprios), geradas no horário de Recife.
- Presenças com **um registro por pessoa e ocorrência**, envios (fotos), linha do tempo e **extrato imutável** de pontos.
- Bucket **privado** `comprovantes` (até 3 MB, JPEG/WebP); cada pessoa só envia para a própria pasta; a foto só
  abre para o dono e para quem pode validar aquele grupo.
- Funções: `criar_atividade`, `alterar_pontos_atividade`, `cancelar_ocorrencia` (admin), `minha_agenda`,
  `registrar_presenca` (janela C10), `fila_validacao`, `decidir_presenca` (transição atômica + crédito único),
  `ranking` (três visões, sem dados pessoais), `minhas_presencas`.
- Limpeza dos testes: `npm run limpar-fotos-teste -- --confirmar` (fotos, pela API do Storage) e depois
  `supabase/testes/limpar-dados-teste.sql`.

### App

- Participante: Início (P01), Agenda (P02), Atividade (P03), Registrar presença com foto reduzida, progresso e
  cancelamento (P04), Minhas presenças com extrato mensal (P05), Ranking Geral/Adolescentes/Jovens (P07).
- Direção: Validação com fila, foto privada por link temporário, aprovar e recusar com motivo (G02/G03).
- Admin: Agenda (cadastrar atividade semanal ou única, alterar pontos futuros, cancelar ocorrência) e Congregações
  (igrejas, congregações, campanhas).

### Verificado

- 51 testes automáticos (19 novos da Etapa 3) rodando as migrações reais em Postgres (PGlite).
- No app publicado, de ponta a ponta, com contas fictícias: registrar presença com foto (reduzida de 2400 para 1600 px),
  “em análise” sem somar, Direção dos Jovens abre a foto privada e aprova, saldo 45 → 1º no ranking → extrato.
- **Concorrência real no Supabase:** 4 aprovações simultâneas do mesmo registro (2 aprovadores × 2 cliques) →
  1 sucesso, 3 “já decidido”, 1 único lançamento. Nova tentativa de registro → “já registrada”.
- Acesso restrito: participante na área da direção; Direção dos Jovens na Agenda do admin.

### Pendências (Etapas 4 e 5)

- Solicitar ajuste e reenvio de foto; exceção do admin para envio fora do prazo; revogação de aprovação.
- Rascunho da foto salvo no aparelho quando a conexão cai (hoje a foto fica só na tela).
- Calendário mensal na agenda; notificações internas; desafios.
- Fechamento mensal, desempate (D05), premiação e histórico.
- Auditoria das inclusões diretas em igrejas/congregações/campanhas.

## Bloqueios atuais

1. No painel do Supabase (Authentication): desligar o cadastro público, definir senha mínima de 8 caracteres,
   colocar `https://<seu-app>.vercel.app` como Site URL e, se disponível no plano, ativar a proteção contra senhas
   vazadas.
