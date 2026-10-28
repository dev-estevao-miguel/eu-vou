# Modelo de dados

Postgres no Supabase. Toda tabela tem RLS ligada; o cliente nunca usa a chave secreta.
Nomes em português, `snake_case`. Este documento é atualizado junto com as migrações:

| Migração                              | Conteúdo                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `20261026120000_nucleo`               | estrutura, perfis, vínculos, funções, convites, auditoria e configurações |
| `20261026150000_configuracao_inicial` | link de uso único para o primeiro administrador (C14)                     |
| `20261026180000_presencas`            | agenda, presenças, fotos privadas, extrato de pontos e ranking            |

Itens marcados com _(planejado)_ ainda não existem no banco.

## Hierarquia

```text
igrejas → congregacoes → campanhas
                       ↘ vinculos (pessoa ↔ congregação + grupo)
                       ↘ atividades → ocorrencias → presencas → lancamentos (mês da atividade)
```

Grupos: `jovens` e `adolescentes`. Grupo é participação, nunca cargo. O mês de cada presença e de cada lançamento é o
mês da atividade no horário de Recife (C13); a tabela de ciclos com situação de fechamento entra na Etapa 5.

## Tabelas

| Tabela                           | Conteúdo                                                                                                        | Observações                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `igrejas`                        | organização, `teste`                                                                                            | tudo abaixo de uma igreja de teste sai na limpeza                                               |
| `congregacoes`                   | nome, igreja, ativa                                                                                             |                                                                                                 |
| `campanhas`                      | congregação, nome, período, ativa                                                                               | uma ativa por congregação                                                                       |
| `perfis`                         | 1:1 com `auth.users`: usuário, nome completo, nome de exibição, WhatsApp, nascimento, avatar, situação, `teste` | contatos e nascimento só para quem a matriz permite; a pessoa altera só WhatsApp e avatar (C12) |
| `vinculos`                       | perfil, congregação, grupo, situação (`pendente`, `ativo`, `recusado`, `encerrado`), decisão, convite de origem | um vínculo vigente por pessoa; só `ativo` envia presença                                        |
| `funcoes`                        | perfil, função, escopo (congregação ou campanha), concessão e revogação                                         | só o admin concede; ninguém altera a própria                                                    |
| `convites`                       | hash do token, congregação, grupo, validade, revogação, total de cadastros                                      | o token aparece só no link                                                                      |
| `atividades`                     | modelo: título, tipo, público, pontos, dia da semana (ou data única), horários, local                           |                                                                                                 |
| `ocorrencias`                    | início e fim, público, **pontos (0–50)**, cancelamento com motivo                                               | o valor pertence à ocorrência                                                                   |
| `presencas`                      | perfil, ocorrência, grupo no momento, mês, situação, observação, decisão e motivo                               | **único (perfil, ocorrência)**                                                                  |
| `envios`                         | presença, caminho da foto, tamanho, tipo                                                                        | reenvio = novo envio na mesma presença (Etapa 4)                                                |
| `presenca_eventos`               | linha do tempo: enviada, aprovada, recusada, cancelada…; autor e motivo                                         | imutável                                                                                        |
| `lancamentos`                    | extrato: perfil, mês, presença, grupo, pontos (+/−), tipo, autor, motivo                                        | imutável; correção = novo lançamento                                                            |
| `auditoria`                      | quem fez, alvo, escopo, dados e justificativa                                                                   | ações sensíveis                                                                                 |
| `configuracoes`                  | contato de suporte, textos e parâmetros                                                                         | valores públicos saem por `config_publica()`                                                    |
| `privado.configuracao_inicial`   | hash e validade do link do primeiro administrador                                                               | fora da API                                                                                     |
| `ciclos` _(planejado)_           | campanha, mês, situação (`aberto`, `em_apuracao`, `encerrado`)                                                  | Etapa 5                                                                                         |
| `notificacoes` _(planejado)_     | avisos internos                                                                                                 | Etapa 4                                                                                         |
| `resultados_ciclo` _(planejado)_ | fotografia das três classificações no fechamento, com versão                                                    | Etapa 5                                                                                         |

## Garantias de integridade

- **Crédito único:** `decidir_presenca` muda a presença de `em_analise` para `aprovada` numa única transição
  (só a primeira decisão vale) e insere o lançamento. Um índice único parcial impede um segundo crédito da mesma
  presença mesmo em corrida ou nova tentativa — conferido no Supabase com 4 aprovações simultâneas.
- **Um registro por atividade:** a restrição única (perfil, ocorrência) impede uma segunda presença; duas atividades no
  mesmo dia são ocorrências diferentes, portanto não são duplicatas.
- **Somente aprovada soma:** os rankings somam apenas `lancamentos`; em análise, recusada ou cancelada não geram crédito.
- **Rastreabilidade:** nada é apagado; decisões ficam em `presenca_eventos` e `auditoria`. A revogação com lançamento
  negativo entra na Etapa 4.
- **Rankings** saem de uma função que devolve só posição, nome de exibição, avatar, grupo e pontos — nunca contato,
  nascimento ou comprovante.

## Fotos

- Bucket **privado** `comprovantes` (até 3 MB, JPEG/WebP), caminho `{perfil}/{ocorrencia}/{arquivo}.jpg`.
- Cada pessoa só envia para a própria pasta. A leitura do arquivo (link assinado de curta duração) só é liberada ao dono
  e a quem pode validar aquele grupo; ver a fila não dá acesso à imagem.
- Avatares _(planejado)_: bucket separado, também privado.
