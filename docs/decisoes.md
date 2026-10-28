# Registro de decisões

Ordem de prioridade: respostas mais recentes do Estevão → decisões confirmadas aqui → Documento de design (Lote 1) →
propostas ainda não confirmadas.

## Confirmadas

| ID  | Decisão                                                                                                                                                                                                                                                                                                                                                                                                                                                | Data       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| C01 | **Infraestrutura:** Supabase (Postgres + RLS, Auth, Storage privado, Edge Functions) e Vercel para hospedar a PWA. Front-end React + TypeScript + Vite.                                                                                                                                                                                                                                                                                                | 26/10/2026 |
| C02 | **Login por nome de usuário.** O Supabase Auth exige e-mail; cada usuário recebe um _e-mail técnico interno_ derivado do nome de usuário, nunca exibido e nunca usado para envio. O cadastro não pede e-mail. A redefinição de senha é feita por link individual e com validade, gerado pelo administrador e entregue pelo WhatsApp.                                                                                                                   | 26/10/2026 |
| C03 | **Entrada de novos participantes:** convite gerado pela direção do grupo (define congregação e grupo) + o vínculo fica _em análise_ até ser aprovado; antes disso a pessoa não envia presenças (confirma D09).                                                                                                                                                                                                                                         | 26/10/2026 |
| C04 | **Permissões:** a matriz do Documento de design vale como está. Confirma D01 (Direção da campanha só consulta), D02 (Responsável valida os dois grupos da própria congregação) e D10 (envio de liderança revisado por outro aprovador; exceção do admin exige justificativa). Itens “Não por padrão” ficam desligados.                                                                                                                                 | 26/10/2026 |
| C05 | O projeto Supabase `<id-do-projeto-supabase>` é a **produção** e, **até a oficialização**, também o ambiente de testes (Estevão é o único usuário). Dados fictícios ficam isolados e marcados (igreja/congregação de teste, contas de teste identificadas) e serão removidos por script antes de entrar com dados reais. Migrações destrutivas continuam exigindo autorização específica. _Substitui a versão anterior desta decisão (26/10, mesma data)._ | 26/10/2026 |
| C06 | Migrações aplicadas pela **CLI do Supabase** (`npx supabase`); login e vínculo feitos pelo Estevão no terminal.                                                                                                                                                                                                                                                                                                                                        | 26/10/2026 |
| C07 | **Convite:** link compartilhável por grupo e congregação, com validade definida por quem gera (padrão 30 dias) e revogável a qualquer momento.                                                                                                                                                                                                                                                                                                         | 26/10/2026 |
| C08 | **Quem aprova o vínculo de um cadastro novo:** admin (todos), Responsável da congregação (os dois grupos da própria congregação), Direção da campanha (os dois grupos da própria campanha), Direção dos Jovens (somente quem se cadastrou como Jovem) e Direção dos Adolescentes/União (somente quem se cadastrou como Adolescente). Amplia a matriz apenas para vínculos: a Direção da campanha continua sem aprovar presenças (D01).                 | 26/10/2026 |
| C09 | Ao aprovar um cadastro, a Direção da campanha vê só o necessário: nome completo, usuário, grupo escolhido, idade e data do cadastro — sem WhatsApp e sem data de nascimento completa.                                                                                                                                                                                                                                                                  | 26/10/2026 |
| C10 | **Prazo de envio (confirma D03):** o registro abre no término da atividade e fecha 24 h depois. Fora do prazo, só com exceção do admin e justificativa.                                                                                                                                                                                                                                                                                                | 26/10/2026 |
| C11 | **Foto (confirma D11):** uma foto por envio; arquivo de até 10 MB, reduzido no celular para cerca de 1600 px antes do envio.                                                                                                                                                                                                                                                                                                                           | 26/10/2026 |
| C12 | **Nome no ranking (confirma D08):** primeiro nome + inicial do último sobrenome, gerado no cadastro. A pessoa não altera; só a direção.                                                                                                                                                                                                                                                                                                                | 26/10/2026 |
| C13 | **Mês do crédito:** os pontos entram no mês da **atividade**, não no da aprovação.                                                                                                                                                                                                                                                                                                                                                                     | 26/10/2026 |
| C14 | **Primeiro administrador pela tela do app:** link de configuração inicial (`/configurar/<token>`), de uso único, válido por 48 h, guardado só como hash. Não funciona se já existir administrador. Substitui a proposta “usuário com senha em branco”, que permitiria a qualquer visitante do endereço público virar administrador. O script `npm run criar-admin` continua como alternativa.                                                          | 26/10/2026 |

## Padrões adotados (podem ser corrigidos a qualquer momento)

- Lote 1 é a referência visual; a marca provisória (V + ponto vermelho) é usada até haver logo definitiva. Telas ainda
  não desenhadas seguem os mesmos componentes e passam por revisão.
- O modelo de dados suporta várias congregações desde o início; dados de teste usam só a Vila Demo fictícia.
- Pontuação configurável de 0 a 50 por ocorrência; os valores do calendário do protótipo entram apenas como dados de teste.
- Foto de perfil opcional, com iniciais como padrão.
- Data de nascimento registrada, sem regra automática de idade por grupo.
- Regras ainda não confirmadas ficam como **configuração**, não como código fixo.
- Primeiro administrador criado por script executado localmente pelo Estevão (senha digitada no terminal); nenhuma tela
  concede cargos.

## Propostas aguardando confirmação

| ID  | Proposta (Documento de design)                                                                    | Necessária na |
| --- | ------------------------------------------------------------------------------------------------- | ------------- |
| D12 | Ensaios e COI com 0 ponto até definição (a pontuação de cada atividade é configurável pelo admin) | Etapa 3       |
| —   | Troca de grupo vale a partir do próximo ciclo                                                     | Etapa 4       |
| D04 | Apuração até o 3º dia do mês seguinte, 23h59; encerramento manual sem pendências                  | Etapa 5       |
| D05 | Desempate: pontos → cultos oficiais distintos → atividades distintas → sorteio documentado        | Etapa 5       |
| D06 | Uma pessoa pode ser premiada no Geral e no seu grupo                                              | Etapa 5       |
| D07 | Premiação exige ao menos um registro aprovado com pontuação positiva                              | Etapa 5       |

## Pendências do idealizador (fora do código)

- Nome e logo definitivos; arquivo oficial da IEADPE para ajuste da paleta.
- Número de WhatsApp do administrador para a recuperação de senha (Etapa 4).
- Congregação(ões) do primeiro piloto.
- Regras etárias dos grupos.
- Política de exposição de nome/avatar e uso de imagens.
- **Autorização dos responsáveis pelos adolescentes e prazo de retenção das fotos** (dados de menores — resolver antes do piloto).
- O `Eu_Vou_Prompt_Mestre_UX_UI_Claude.md` foi adicionado ao projeto depois do início do desenvolvimento (hoje em
  `docs/referencias/`). A matriz usada até aqui é a do Documento de design; falta conferir o que já foi implementado
  contra esse briefing.
