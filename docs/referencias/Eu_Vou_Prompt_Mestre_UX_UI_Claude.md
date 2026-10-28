# Eu Vou — Prompt mestre de UX/UI para Claude
Versão 1.0 • 26/10/2026 • Documento de trabalho de Estevão Miguel

## Como utilizar

Copie o conteúdo entre INÍCIO DO PROMPT MESTRE e FIM DO PROMPT MESTRE para o Claude utilizado na criação do design. Se a ferramenta aceitar arquivos, anexe este documento e solicite a execução integral do prompt mestre. O prompt de logo ao final é separado e destinado ao GPT Imagens.

O nome Eu Vou é uma recomendação de trabalho. As alternativas são propostas criativas; disponibilidade de marca, domínio e nome em lojas não foi investigada. A paleta é uma proposta, não um manual oficial da IEADPE.

As regras identificadas como propostas preenchem lacunas do escopo para tornar o protótipo coerente. Devem aparecer no registro de decisões para revisão antes da implementação.

---

# INÍCIO DO PROMPT MESTRE

Atue como designer sênior de produto, especialista em UX/UI, aplicativos PWA, design de interação e sistemas de design. Desenvolva o projeto visual completo da plataforma Eu Vou, descrita abaixo.

Trate esta solicitação como um trabalho de produto real: transforme requisitos em arquitetura de informação, jornadas, telas de alta fidelidade, componentes reutilizáveis e protótipo navegável. A entrega deve ser visualmente consistente e suficientemente detalhada para uma futura implementação.

Esta etapa é dedicada ao design. Não implemente backend, autenticação real, banco de dados, integrações, envio de mensagens ou publicação. Caso sua ferramenta utilize código internamente para renderizar o protótipo, limite-o à apresentação e às interações simuladas com dados fictícios. Não apresente código de produção como entrega principal.

Use português brasileiro em toda a experiência. Execute o trabalho com as informações disponíveis; registre premissas e pendências, sem interromper o design para decisões reversíveis. Não invente contatos, credenciais, aprovação institucional, horários oficiais ou informações pessoais reais.

## 1. Visão do produto e critérios de sucesso

Eu Vou é uma plataforma PWA para incentivar a presença de jovens e adolescentes nas atividades da igreja, com agenda, registro de participação, comprovação por foto, aprovação pela liderança e rankings mensais.

A plataforma deve funcionar inicialmente em uma congregação, com estrutura visual preparada para outras congregações e igrejas. O contexto demonstrativo é Congregação Vila Demo.

O produto deve transmitir comunhão, acolhimento, compromisso e participação. Os pontos representam atividades registradas e aprovadas. A comunicação não deve associar pontuação a valor pessoal, qualidade da fé ou espiritualidade.

O ciclo principal é:

Cadastro → acesso individual → consulta da agenda → participação na atividade → envio de foto → análise da liderança → presença aprovada → crédito de pontos → ranking do mês → premiação.

Não confunda intenção de comparecer com presença comprovada. O nome Eu Vou expressa mobilização; a ação que gera análise deve se chamar Registrar presença. Uma eventual confirmação de interesse nunca concede pontos.

Considere como sucesso de UX:

- Um participante entende rapidamente qual atividade pode registrar.
- O envio exige poucos passos e funciona bem em celulares simples.
- O participante distingue pontos aprovados, pontos em análise e registros recusados.
- A liderança consegue avaliar uma presença com contexto suficiente.
- As três classificações mensais são transparentes e coerentes.
- Pessoas com menos participação podem ser acompanhadas de forma reservada e acolhedora.
- As permissões são claras e os contextos de congregação e grupo permanecem visíveis.

## 2. Nome, marca e créditos

Nome de trabalho recomendado: Eu Vou.
Assinatura sugerida: Presença que aproxima.
Descrição funcional: Atividades, presença e comunhão.

Mantenha o nome parametrizável, permitindo uma troca futura sem redesenhar o produto.

Apresente uma breve avaliação destas alternativas, sem abandonar o nome de trabalho durante a execução:

| Nome proposto | Intenção |
| --- | --- |
| Eu Vou | Mobilização, simplicidade e compromisso pessoal |
| Presentes | Presença e pertencimento |
| Em Comunhão | Convivência e propósito comunitário |
| Vamos Juntos | Convite coletivo à participação |

Não afirme que os nomes estão disponíveis ou registrados. Não transforme a avaliação de nomes em uma etapa que bloqueie as telas.

Utilize uma marca provisória tipográfica, com símbolo simples relacionado a encontro, caminho ou confirmação. Reserve versões horizontal, compacta, monocromática e ícone de aplicativo. A logo definitiva poderá ser criada posteriormente no GPT Imagens.

A referência cromática pretendida é a logo da IEADPE. Como o arquivo oficial e seu manual não foram fornecidos, use a paleta proposta da seção 14 e sinalize que os códigos aguardam conferência com o material oficial. Não copie o brasão institucional nem apresente Eu Vou como aplicativo oficial da IEADPE.

Crédito discreto nas telas de entrada e Sobre:
Design e desenvolvimento por Estevão Miguel.

Se for necessária uma versão em inglês, utilize:
Designed & Developed by Estevão Miguel.

Não inclua o crédito em todos os cartões ou em posições que disputem atenção com ações principais.

## 3. Organização, congregações e contexto

Estrutura conceitual:

Igreja ou organização → Congregação → Campanha → Ciclo mensal → Grupos e participantes.

Os grupos iniciais são Jovens e Adolescentes. Direção da União corresponde, neste escopo, à direção do grupo de Adolescentes; o nome exibido poderá ser configurado.

A campanha organiza atividades, desafios, regras e premiações. Os ciclos mensais preservam seu histórico.

Premissas propostas para o MVP:

- Uma campanha ativa por congregação.
- Cada participante pertence a uma congregação e a um grupo por ciclo.
- Ranking geral significa todos os participantes daquela campanha e congregação.
- Outras congregações não aparecem no ranking sem uma campanha conjunta explicitamente configurada no futuro.
- Um administrador global pode selecionar congregações; um participante comum permanece no seu contexto.
- O grupo de cada participante fica registrado no ciclo. Uma transferência passa a valer no próximo ciclo por padrão.
- Correções de grupo dentro de um ciclo exigem ação administrativa rastreável e recálculo explícito.
- Não inventar idade de corte entre Jovens e Adolescentes; essa regra ainda será definida pela organização.
- Crianças são uma possibilidade futura. Não incluir cadastro infantil ou gestão de responsáveis como fluxo ativo do MVP.

Não misture dados entre igrejas ou congregações. Mostre o contexto em filtros, cabeçalhos de gestão e confirmações de ações relevantes.

## 4. Perfis e matriz de permissões

Existem seis perfis. O acesso de participante e as permissões de liderança são conceitos separados: uma pessoa da direção também pode participar da campanha com as mesmas regras de pontuação.

### 4.1 Perfis

1. Administrador da plataforma: Estevão Miguel. Gerencia toda a plataforma, congregações, contas, permissões, textos, atividades, regras, desafios, validações e encerramentos.
2. Responsável pela congregação: consulta classificações e históricos da própria congregação e valida presenças dos dois grupos.
3. Direção da campanha: consulta classificações gerais, por grupo e históricas da campanha. Acesso de acompanhamento, sem aprovação por padrão.
4. Direção dos Jovens: cadastra e edita participantes do próprio grupo, gera convites, cria desafios para Jovens e valida registros desse grupo.
5. Direção dos Adolescentes/União: mesmas capacidades, restritas ao grupo de Adolescentes.
6. Participante: gerencia seu acesso e perfil permitido, consulta agenda e rankings da própria campanha, envia registros e acompanha sua evolução.

A permissão de validação do responsável pela congregação segue o escopo descrito. A direção da campanha permanece somente em consulta para resolver, de forma conservadora, a ambiguidade do termo direção.

### 4.2 Matriz obrigatória no documento de design

| Ação | Admin | Responsável da congregação | Direção da campanha | Direção dos Jovens | Direção dos Adolescentes | Participante |
| --- | --- | --- | --- | --- | --- | --- |
| Ver as três classificações e histórico | Todas | Própria congregação | Própria campanha | Própria campanha | Própria campanha | Própria campanha |
| Ver contatos e cadastro completo de terceiros | Todos | Própria congregação | Não | Próprio grupo | Próprio grupo | Não |
| Ver comprovantes privados | Todos | Própria congregação | Não | Próprio grupo | Próprio grupo | Apenas os próprios |
| Aprovar ou recusar registros | Todos | Própria congregação | Não | Próprio grupo | Próprio grupo | Não |
| Cadastrar e editar outros participantes | Todos | Não por padrão | Não | Próprio grupo | Próprio grupo | Não |
| Gerar convite de autocadastro | Todos | Não por padrão | Não | Próprio grupo | Próprio grupo | Não |
| Criar e administrar desafios | Todos | Não por padrão | Não | Apenas Jovens | Apenas Adolescentes | Não |
| Configurar agenda comum e pontos das atividades | Sim | Não | Não | Não | Não | Não |
| Alterar permissões e congregações | Sim | Não | Não | Não | Não | Não |
| Encerrar ou reabrir ciclo mensal | Sim | Não | Não | Não | Não | Não |
| Gerar redefinição de senha | Sim | Não | Não | Não | Não | Não |
| Alterar o próprio perfil permitido | Sim | Sim | Sim | Sim | Sim | Sim |

O acesso a rankings não concede acesso a telefones, nascimento, fotos de comprovação ou relatórios de baixa participação. A direção da campanha recebe relatórios agregados e classificações, sem dados de contato.

A gestão de participantes do próprio grupo inclui analisar solicitações de cadastro, ativar ou desativar vínculos e corrigir dados básicos. Não permite promover usuários a líderes, mudar sua congregação ou transferi-los para outro grupo.

Não permita autoatribuição de cargos no cadastro. O usuário escolhe Jovem ou Adolescente; papéis administrativos são atribuídos pelo administrador.

Nas telas, oculte ações sem permissão. Para links inacessíveis ou acesso direto, desenhe o estado Acesso restrito. Registre no handoff que a futura implementação deve verificar essas permissões também fora da interface.

Proposta de integridade: o próprio envio de uma liderança deve ser revisado por outro aprovador autorizado. Caso o administrador seja o único aprovador disponível, uma exceção deve exigir justificativa e ficar no histórico.

## 5. Cadastro, acesso e recuperação de senha

### 5.1 Cadastro do participante

Campos:

- Nome completo.
- Número de WhatsApp com DDD.
- Data de nascimento.
- Grupo: Jovem ou Adolescente.
- Nome de usuário.
- Foto de perfil, com câmera, galeria e visualização.
- Senha.
- Confirmação de senha.
- Congregação, preenchida pelo convite ou selecionada no cadastro aberto.
- Aceite das regras da campanha e ciência sobre uso dos dados e das fotos.

Projete o formulário em até três etapas curtas, com progresso, retorno e preservação dos campos.

O nome de usuário é único na plataforma, sem espaços e sem distinção entre letras maiúsculas e minúsculas. Mostre um exemplo. Não use o telefone como identificador exclusivo: irmãos podem compartilhar um número familiar.

Ofereça avatar provisório quando a foto de perfil ainda não estiver disponível. A foto de perfil e a foto de comprovação são elementos diferentes.

Proposta: novos cadastros aguardam aprovação do vínculo com a congregação e o grupo. Durante a espera, o usuário vê sua situação, ajuda e dados de cadastro; ainda não envia presenças nem entra no ranking.

Convites podem vincular congregação e grupo. Desenhe convite válido, expirado, revogado e já utilizado. Um convite nunca concede perfil administrativo.

Não exigir e-mail, CPF, endereço, conta Google ou informações não previstas neste escopo.

### 5.2 Login

- Nome de usuário.
- Senha com mostrar/ocultar.
- Entrar.
- Criar minha conta.
- Esqueci minha senha.
- Identidade do produto e indicação de contexto quando existir convite.

Incluir estados de carregamento, campos inválidos, credenciais inválidas, conta aguardando análise, conta desativada e tentativas excessivas. Não revelar a existência de uma conta por mensagens de erro detalhadas.

### 5.3 Esqueci minha senha

Fluxo principal solicitado:

1. Usuário informa nome completo ou nome de usuário.
2. Informa Jovem ou Adolescente.
3. Informa a congregação, caso ela não esteja identificada.
4. Visualiza uma mensagem pronta.
5. Toca em Solicitar redefinição pelo WhatsApp.
6. O WhatsApp do administrador é aberto com a mensagem preenchida.
7. O próprio usuário confirma o envio dentro do WhatsApp.

Mensagem:

Paz do Senhor, irmão Estevão. Sou [NOME OU USUÁRIO], do grupo de [JOVENS OU ADOLESCENTES], da congregação [CONGREGAÇÃO]. Esqueci minha senha. O senhor poderia verificar para mim?

Destino configurável: [WHATSAPP_ADMIN_COM_DDI_E_DDD].
Não inventar o número do administrador.

Não solicitar a senha antiga na mensagem. Oferecer Copiar mensagem se o WhatsApp não abrir.

Abrir o WhatsApp não comprova que a mensagem foi enviada. Não mostrar Solicitação enviada ou criar um chamado fictício. Utilizar uma orientação como: Confira a mensagem e envie no WhatsApp para concluir o pedido.

Desenhe também o fluxo de conclusão: identidade verificada pelo administrador → link individual de redefinição → nova senha e confirmação → sucesso → retorno ao login. A validação de identidade precisa ocorrer antes de liberar o acesso; a mensagem recebida isoladamente não autoriza o reset.

O link de redefinição é de uso único e tem prazo de validade indicado. Mostrar link inválido, expirado e já utilizado. A administração nunca visualiza a senha atual.

A recuperação pelo WhatsApp é uma escolha inicial para uma operação pequena; mantenha a experiência preparada para uma recuperação automatizada futura, sem incluí-la como funcionalidade ativa.

## 6. Agenda e atividades

As atividades são ocorrências com data própria, mesmo quando surgem de uma programação recorrente.

Cada ocorrência deve apresentar:

- Título e tipo.
- Congregação e local.
- Data, início e término.
- Público: Jovens, Adolescentes ou ambos.
- Pontos possíveis.
- Janela para envio da presença.
- Regras de comprovação.
- Situação: prevista, disponível para registro, encerrada ou cancelada.
- Indicação se já existe um registro daquele participante.

A pontuação é da atividade, não do nome do dia da semana.

Preserve esta programação como exemplo inicial, sem apresentá-la como calendário oficial:

| Dia | Atividades ilustrativas | Pontuação de exemplo por atividade |
| --- | --- | --- |
| Segunda-feira | Ensaio do órgão de louvor | 0 |
| Terça-feira | Doutrina / Culto oficial | 20 |
| Quarta-feira | Oração / Culto oficial | 25 |
| Quinta-feira | Ensaio do órgão de louvor; estudo ou ensaio de adolescentes | 0 para cada ocorrência |
| Sexta-feira | Oração da mocidade | 30 |
| Sábado | COI; ensaio eletrônico | 0 para cada ocorrência |
| Domingo | Culto oficial | 45 |

Não expandir a sigla COI sem informação confirmada. Horários demonstrativos devem ser identificados como fictícios ou aparecer como Horário a definir.

Duas atividades no mesmo dia são duas ocorrências. O usuário só visualiza como elegíveis as atividades destinadas ao seu grupo.

Preserve 0 como valor permitido neste protótipo: registra participação, mas não soma pontos. Exiba Atividade sem pontuação. Como o projeto também prevê valorizar os ensaios, registre a necessidade de confirmar esses valores antes da campanha real. Não substitua os zeros por uma pontuação inventada.

Ao editar a agenda recorrente, diferencie Esta ocorrência de Próximas ocorrências. Alterações não devem reescrever silenciosamente registros antigos.

## 7. Pontuação e regras da campanha

Regras centrais:

- Cada atividade ou desafio tem pontuação inteira entre 0 e 50.
- O limite de 50 é por ocorrência ou desafio, não por mês.
- O total mensal pode ultrapassar 50.
- A mesma atividade vale a mesma quantidade de pontos para Jovens e Adolescentes.
- Apenas registros aprovados somam pontos.
- Registros pendentes aparecem separados, sem aumentar a classificação.
- Registros recusados, cancelados ou revogados não somam pontos.
- Uma pessoa recebe pontos uma única vez por ocorrência na mesma campanha.
- Um reenvio corrige o registro existente; não cria uma segunda pontuação.
- Atividades diferentes no mesmo dia podem pontuar individualmente.
- Foto, nota de quiz ou confirmação de interesse não aprovam presença automaticamente.
- Uma missão de comparecimento vinculada a uma atividade não pode repetir os pontos da mesma presença por padrão.

O saldo mensal deve ser explicado por um extrato legível: atividade, data, situação, pontos aprovados, ajustes e motivo.

A pontuação de uma ocorrência já publicada deve ficar preservada. Correções excepcionais exigem administrador, justificativa, comunicação do impacto e histórico. Não permitir que uma edição de configuração altere todo o passado sem aviso.

Não incluir compra de pontos, pontos por convidar pessoas, pagamentos, apostas ou perda automática de pontos por ausência.

Propostas para completar o protótipo:

- Envio a partir do encerramento da atividade.
- Prazo padrão de envio: até 24 horas após o término, configurável.
- Registros fora do prazo dependem de exceção administrativa justificada.
- O mês do registro é definido pela data da atividade na congregação, e não pela data da aprovação.
- Fuso demonstrativo: America/Recife; a configuração pertence à congregação.
- Metas pessoais, se exibidas, são informativas e não acrescentam pontos.

## 8. Registro de presença e aprovação

Desenhe um fluxo curto:

1. Abrir uma atividade elegível.
2. Tocar em Registrar presença.
3. Tirar uma foto ou anexar da galeria.
4. Conferir a imagem e, opcionalmente, acrescentar observação.
5. Confirmar o envio.
6. Receber a situação Em análise, com orientação sobre o que acontece depois.

A foto é uma evidência para revisão humana. Não afirmar que a plataforma confirma local, data ou identidade apenas pela imagem. Não exigir GPS, reconhecimento facial ou monitoramento contínuo.

Orientar o registro ao final da atividade, respeitando o culto e evitando enquadrar outras pessoas desnecessariamente. A foto não precisa obrigatoriamente ser uma selfie.

Proposta de mídia para orientar o design: aceitar uma foto por envio, mostrar formatos permitidos e tamanho máximo configurável. O protótipo pode apresentar limite inicial de 10 MB e explicar a otimização antes do envio; esses valores são propostas de implementação, não capacidades já existentes.

Projetar prévia, substituir foto, progresso, cancelar envio, formato incompatível, foto muito grande, permissão de câmera negada, falha de conexão e tentativa de envio duplicado.

A fila de aprovação precisa mostrar:

- Participante e grupo.
- Atividade, data e congregação.
- Horário do envio.
- Foto privada ampliável.
- Observação do participante.
- Pontuação que será creditada.
- Histórico de reenvios e decisões.
- Aprovar, Recusar e Solicitar ajuste.

Recusa e solicitação de ajuste exigem motivo objetivo e visível ao participante. Evitar textos acusatórios. Uma mensagem possível: Não foi possível confirmar esta atividade com a imagem enviada. Confira a data e envie uma nova foto.

Estados do registro:

- Rascunho neste dispositivo.
- Enviando.
- Em análise.
- Ajuste solicitado.
- Reenviado / em análise.
- Aprovado.
- Recusado.
- Cancelado pelo participante antes da aprovação.
- Aprovação revogada com justificativa.

Distinguir Envio fora do prazo de registro recusado. Não permitir que o participante altere um registro já aprovado sem revisão.

Ao aprovar, mostrar confirmação e atualização correspondente no extrato e na classificação. Se outro aprovador já decidiu, apresentar o resultado atual e impedir a repetição da ação.

Aprovação em lote fica fora do MVP; priorize revisão individual.

## 9. Rankings, empate e premiações

Existem três classificações do mesmo ciclo:

1. Geral: Jovens e Adolescentes.
2. Adolescentes.
3. Jovens.

Todas usam a mesma regra de pontuação. Os filtros alteram a população exibida, não recalculam o saldo de cada pessoa.

Cada visão deve apresentar:

- Congregação, campanha e mês.
- Estado do ciclo.
- Pódio dos três primeiros.
- Lista em ordem decrescente de pontos.
- Pontuação e posição do participante conectado em destaque.
- Separação entre pontos aprovados e pontos em análise.
- Acesso a Como funciona a pontuação.
- Indicação de empate quando necessário.
- Data da última atualização.

Premiação: três posições em cada classificação, até nove posições premiadas por mês. Proposta inicial: uma pessoa pode ser premiada no Geral e também no seu grupo. Portanto, não prometer nove pessoas distintas. Mostrar essa política nas regras e permitir sua confirmação antes do lançamento.

Critérios de desempate propostos, a publicar antes do ciclo:

1. Maior total de pontos aprovados.
2. Maior quantidade de cultos oficiais distintos com presença aprovada.
3. Maior quantidade total de atividades distintas com presença aprovada.
4. Persistindo empate em uma posição premiada, sorteio documentado pelo administrador.

Não usar ordem de cadastro, velocidade de envio ou ordem de aprovação como desempate.

Antes do encerramento, mostrar empate real, sem criar vencedor artificial. O sorteio precisa ser registrado com participantes empatados, responsável, data e resultado. A lista pode usar ordem alfabética apenas para apresentação enquanto o desempate estiver pendente.

Esse critério é uma proposta, não uma regra já confirmada pelo idealizador. Inclua-o no registro de decisões.

Se houver menos de três participantes elegíveis, mostrar apenas as posições existentes. Proposta: premiação exige ao menos um registro aprovado com pontuação positiva. Participantes com zero pontos permanecem na listagem, mas não recebem um prêmio por falta de concorrentes.

O ranking completo pode mostrar a ordem de participação aos membros autenticados da própria campanha. Não criar uma seção de piores participantes ou destaques negativos.

Para acompanhamento de quem participa menos, desenhar uma visão reservada à liderança autorizada, com filtros objetivos como Sem registros aprovados no período. A direção de grupo vê seu próprio grupo; o responsável vê sua congregação; a direção da campanha vê apenas indicadores agregados.

Mostrar apelido de exibição ou primeiro nome e inicial do sobrenome nas classificações, especialmente para adolescentes, com avatar opcional. Nunca expor WhatsApp, nascimento ou foto de comprovação na listagem.

## 10. Fechamento mensal e histórico

Ciclo de estados:

Aberto → Em apuração → Encerrado → Reaberto excepcionalmente, se necessário.

Proposta de calendário:

- Atividades pertencem ao mês em que aconteceram.
- No início do mês seguinte, o ciclo anterior fica em apuração.
- O prazo individual de envio da última atividade continua respeitado.
- Revisões podem acontecer até o terceiro dia do mês seguinte, às 23h59 no fuso da congregação.
- Após esse prazo, o administrador encerra o ciclo quando não houver pendências.
- A interface não encerra nem publica um resultado final fictício só porque a data passou.

Projetar um checklist de encerramento com registros pendentes, ajustes, empates, política de premiação e prévia das três classificações.

O fechamento gera uma fotografia do resultado final e de suas regras. O novo mês começa com zero ponto mensal, preservando meses anteriores.

Aprovação de uma atividade do último dia, realizada no mês seguinte durante a apuração, conta no mês da atividade.

Depois do encerramento, bloquear mudanças comuns. Reabertura exige administrador, justificativa, registro da alteração e republicação de uma nova versão do resultado. Não alterar silenciosamente premiados já publicados.

O histórico deve permitir selecionar mês e classificação e consultar pódio, pontuação final, regras vigentes e eventual revisão do resultado.

## 11. Desafios e evolução para quiz

No MVP, desafios simples complementam a agenda. Exemplos ilustrativos: participação em uma atividade especial ou missão de serviço comunitário definida pela liderança.

Um desafio tem:

- Título e descrição.
- Congregação e campanha.
- Público elegível.
- Início e término.
- Instruções e evidência solicitada.
- Pontuação de 0 a 50.
- Limite de uma conclusão pontuada por participante.
- Responsável pela análise.
- Situação: rascunho, publicado, encerrado ou cancelado.

Direções de grupo publicam somente para seu grupo. O administrador pode publicar para ambos.

O participante visualiza prazo, pontos, regras, sua situação e botão de participação. A evidência passa por análise humana. Um desafio não deve prometer pontos extras por uma presença que já foi contabilizada, salvo regra adicional explicitamente aprovada e publicada.

O mini quiz bíblico foi mencionado como possibilidade, mas suas regras não foram detalhadas. Trate-o como evolução opcional, claramente fora do MVP. Pode apresentar um conceito visual separado com pergunta, alternativas e resultado; não ligar notas do quiz ao ranking inicial nem permitir várias tentativas para acumular pontos.

Não substituir os fluxos de presença por um produto centrado em quiz.

## 12. Arquitetura de navegação e jornadas

Navegação do participante no celular: cinco destinos.

- Início.
- Agenda.
- Presenças.
- Ranking.
- Perfil.

Desafios aparecem em Início e em atalhos contextuais. Notificações ficam no topo. Evitar uma sexta aba na navegação inferior.

Quem possui cargo autorizado acessa Área da direção por um seletor claro. Esse seletor troca a interface, não concede permissões.

Na gestão, usar navegação compatível com o papel. No desktop, barra lateral. No celular, menu compacto com os destinos essenciais e Mais. A direção da campanha não recebe uma aba de validação vazia ou inacessível.

Documente as jornadas:

- Primeiro acesso por convite e cadastro aprovado.
- Cadastro sem convite e solicitação de vínculo.
- Login recorrente.
- Recuperação pelo WhatsApp e redefinição.
- Consulta de atividade e registro de presença.
- Registro em análise, solicitação de ajuste e reenvio.
- Aprovação e atualização de pontos.
- Consulta das três classificações.
- Consulta de resultado de mês encerrado.
- Cadastro de participante pela direção do grupo.
- Criação e participação em desafio do grupo.
- Revisão de presenças pela liderança.
- Encerramento mensal pelo administrador.
- Tentativa de acesso fora do grupo ou congregação.
- Operação com conexão instável.

Não depender de gestos escondidos, hover ou instruções longas para tarefas frequentes.

## 13. Inventário obrigatório de telas

Produza telas de alta fidelidade e variantes relevantes. Organize frames por módulo, distinguindo tela, variação de estado e adaptação de tamanho. Não apresente todas as variantes como novas páginas sem necessidade.

### A. Entrada e conta

A01. Entrada/login, com marca, campos, cadastro e recuperação.
A02. Cadastro em etapas, validações, seleção de grupo e foto.
A03. Convite de cadastro, com contexto e variantes inválidas.
A04. Conta aguardando análise, aprovada ou desativada.
A05. Recuperação: formulário, prévia da mensagem e orientação de envio.
A06. Redefinição: link válido, nova senha, sucesso e link expirado.

### B. Participante

P01. Início: saudação, congregação, pontos aprovados, pontos em análise, próxima atividade, minhas pendências e desafio em destaque.
P02. Agenda: alternância lista/calendário, filtro por tipo e detalhes do dia. No celular, iniciar pela lista.
P03. Detalhe da atividade: informações completas, público, pontos, prazo e Registrar presença.
P04. Envio de presença: foto, prévia, observação, conferência e resultado.
P05. Minhas presenças: filtros por mês/situação e detalhes com extrato e histórico.
P06. Solicitação de ajuste e reenvio, preservando o registro original.
P07. Ranking: Geral, Adolescentes e Jovens, pódio, lista e posição pessoal.
P08. Resultados anteriores: seletor de mês, resultado final e regras daquele ciclo.
P09. Desafios: lista, detalhe e envio de participação.
P10. Notificações: decisões sobre registros, desafios e encerramento mensal.
P11. Perfil: foto, nome, usuário, contato, grupo, congregação, segurança e ajuda.
P12. Sobre e regras: funcionamento, privacidade, créditos e instalação da PWA.

No perfil, distinguir informações editáveis diretamente das mudanças que exigem análise. Troca de grupo, congregação ou cargo não é uma edição livre.

### C. Gestão de congregação e grupo

G01. Visão geral: participação, presenças aprovadas, fila pendente, evolução mensal e atalhos permitidos.
G02. Fila de validação com filtros por grupo autorizado, data, atividade e situação.
G03. Detalhe de análise com evidência, histórico e decisão.
G04. Participantes: pesquisa, grupo, situação e ações permitidas.
G05. Detalhe do participante: dados autorizados, presenças, pontos e histórico.
G06. Novo participante/edição e geração de convite restrito ao grupo.
G07. Gestão de desafios do próprio grupo.
G08. Rank e histórico de gestão com filtros e dados agregados.
G09. Acompanhamento reservado de participação, sem rótulos negativos.
G10. Visão de acompanhamento da direção da campanha, somente consulta, sem contatos ou evidências privadas.

Os perfis compartilham componentes, mas as ações precisam respeitar a matriz. Não criar seis sistemas visuais diferentes.

### D. Administração da plataforma

AD01. Visão global com seletor de congregação e resumo operacional.
AD02. Congregações: lista, cadastro e edição de identidade/contexto.
AD03. Contas, perfis e permissões, com confirmação em mudanças sensíveis.
AD04. Agenda: atividades, recorrência e edição de ocorrências.
AD05. Campanha: descrição, período, regras, pontuação e premiações.
AD06. Desafios gerais e segmentação por grupo.
AD07. Fechamento mensal: pendências, empates, prévia e confirmação final.
AD08. Histórico de resultados e reabertura excepcional.
AD09. Suporte de acesso: localizar conta, indicar identidade verificada e gerar link de redefinição. Não simular leitura automática de conversas do WhatsApp.
AD10. Textos e configurações: nome da plataforma, assinatura, contato do suporte, regras e identidade visual permitida.
AD11. Histórico de ações: quem realizou a ação, escopo, data, alteração e justificativa.

### E. Estados compartilhados

Criar estados reutilizáveis para:

- Carregamento.
- Lista vazia.
- Sem atividade na data.
- Sem pontos no período.
- Nenhum resultado para os filtros.
- Sem conexão.
- Envio interrompido.
- Câmera indisponível.
- Prazo encerrado.
- Atividade cancelada.
- Registro duplicado.
- Acesso restrito.
- Sessão expirada.
- Confirmação de saída com rascunho.
- Sucesso, erro e alerta.
- Ranking em apuração.
- Resultado encerrado.
- Empate ainda não resolvido.

## 14. Direção visual e sistema de design

Crie uma estética jovem, organizada e acolhedora, compatível com o ambiente da igreja. Use linguagem visual contemporânea com discrição.

Priorizar:

- Fundos claros, boa leitura e espaços bem distribuídos.
- Azul como base da marca e navegação.
- Vermelho como acento de identidade, com uso controlado.
- Cartões com hierarquia de conteúdo e bordas discretas.
- Cantos moderadamente arredondados.
- Ícones simples de uma única família.
- Tipografia legível, como Inter ou equivalente com suporte ao português.
- Números de pontuação fáceis de comparar.
- Pódio elegante, sem transformar toda a interface em uma disputa.
- Microinterações curtas e opcionais.

Evitar: excesso de gradientes, roxo como cor dominante, telas neon, troféus gigantes, aparência de cassino, fundos fotográficos pesados, excesso de sombras, personagens infantis como padrão ou decoração religiosa genérica ocupando espaço funcional.

Paleta proposta, sujeita à logo oficial:

| Token | Cor inicial | Uso |
| --- | --- | --- |
| Marca principal | #143A66 | Cabeçalhos, navegação e ações de marca |
| Azul de ação | #1E56A0 | Ação primária e links |
| Vermelho de marca | #C8333D | Acentos e detalhes da identidade |
| Fundo | #F6F8FC | Áreas de base |
| Superfície | #FFFFFF | Cartões e formulários |
| Texto principal | #172033 | Leitura principal |
| Texto secundário | #566579 | Conteúdo de apoio |
| Borda suave | #DCE3ED | Separadores e contornos não essenciais |
| Sucesso | #166534 | Aprovação, acompanhado de texto/ícone |
| Atenção | #92400E | Pendências, acompanhado de texto/ícone |
| Erro | #B42318 | Erros e recusa, acompanhado de texto/ícone |

Esses códigos são escolhas de design propostas. Não chamá-los de códigos oficiais da IEADPE.

Definir também pares de cor de texto/fundo e contornos de foco. Borda suave não deve ser o único sinal de identificação de um campo quando não houver contraste suficiente.

Sistema de medidas:

- Escala de espaçamento baseada em 4 e 8.
- Margens mobile de 16 a 20 px.
- Texto de formulário preferencialmente com 16 px.
- Alvos de toque preferenciais de pelo menos 44 × 44 px.
- Ícones funcionais em torno de 20 a 24 px.
- Escala tipográfica consistente para título, seção, texto, legenda e números.
- Estados de foco, pressionado, selecionado, desabilitado, carregando e erro.

Documentar botões, campos, seletor de grupo, avatar, abas, filtro por mês, cartão de atividade, pontuação, status, pódio, item do ranking, tabela, cartão de aprovação, envio de foto, modal, painel lateral, notificação, alerta e estado vazio.

Criar o tema claro completo. Se houver tempo, apresentar uma amostra de tema escuro como evolução; não duplicar todo o trabalho antes de concluir o tema principal.

## 15. Acessibilidade, responsividade e PWA

Usar WCAG 2.2 nível AA como referência de design. A conformidade integral depende também de implementação e testes posteriores; não declarar certificação com base apenas nos frames.

Especificar:

- Contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande.
- Contraste adequado para controles e indicadores essenciais.
- Foco visível e navegação por teclado.
- Rótulos persistentes em formulários.
- Mensagens de erro vinculadas ao campo.
- Situações identificadas por texto e ícone, além da cor.
- Ampliação de texto sem perda de conteúdo.
- Ordem de leitura coerente.
- Descrições acessíveis para imagens funcionais.
- Respeito à preferência de reduzir animações.

Frames de referência: mobile de 390 px, variação compacta de 360 px, tablet de 768 px e desktop de 1440 px.

Desenhar todos os fluxos essenciais no celular. Adaptar as telas principais de gestão para desktop e, quando relevante, tablet. Não esticar o layout mobile para preencher o monitor.

Na PWA:

- Prever ícone de aplicativo, tela de abertura e aparência instalada.
- Projetar orientação de instalação com opção Agora não.
- Apresentar instruções adequadas à plataforma, sem supor que todos os navegadores oferecem o mesmo botão.
- Manter a experiência de uso no navegador quando a instalação não ocorrer.
- Não depender de notificações push no MVP; notificações internas são suficientes.
- Dar prioridade a redes lentas e aparelhos Android de entrada.
- Evitar mídias pesadas e gráficos decorativos.

Sem conexão, permitir visualizar apenas o conteúdo já disponível e preparar um rascunho de presença. Não conceder pontos nem afirmar envio concluído offline. O rascunho deve aparecer como Salvo neste dispositivo. Ao reconectar, solicitar confirmação de envio.

No MVP, não prometer envio silencioso em segundo plano. Dados privados em cache e fotos temporárias precisam de regras de limpeza e proteção no handoff; não manter comprovantes disponíveis depois da saída da conta.

## 16. Dados pessoais e cuidado no uso de imagens

Desenhar proteção de dados como parte do fluxo:

- Fotos de comprovação são privadas.
- Uma comprovação não vira foto de perfil nem publicação.
- Participantes visualizam somente seus próprios comprovantes.
- Outros acessos seguem a matriz de permissões.
- Contatos e nascimento não aparecem em rankings.
- A exposição de nome e avatar no ranking deve ser explicada no cadastro.
- Não criar perfil público indexável de adolescentes.
- Não incluir feed social, comentários públicos ou chat privado no MVP.
- Mostrar informações simples sobre finalidade de uso e como solicitar correção ou exclusão.
- Prever uma tela administrativa para configurar prazos de retenção das imagens, sem inventar um prazo obrigatório.
- Se houver exigência de autorização de responsável para adolescentes, reservar o estado e a informação necessária, condicionados à política que será definida para a operação.
- A eventual participação de crianças exige um desenho específico posterior.

Não redigir um termo jurídico definitivo nem afirmar conformidade legal automática. Utilize textos provisórios de informação e registre as políticas que precisam ser definidas antes do lançamento.

## 17. Textos e tom da interface

Use português correto, simples e respeitoso.

Preferir:

- Sua presença faz a diferença.
- Que bom ter você com a gente.
- Registrar presença.
- Enviar para análise.
- Presença em análise.
- Presença aprovada.
- Você recebeu 45 pontos.
- Confira o motivo e envie um ajuste.
- O mês está em apuração.
- Resultado do mês.
- Cada participação conta.
- Ainda não há presenças aprovadas neste mês.

Evitar:

- Você está ficando para trás.
- Últimos colocados.
- Sua fé vale pontos.
- Você perdeu sua sequência.
- Exposição de ausências ou comparações humilhantes.

O ranking deve ser claramente apresentado como participação registrada na campanha, sem medir aspectos que a plataforma não observa.

Não usar textos de preenchimento genéricos. Criar exemplos realistas e identificá-los como fictícios.

## 18. Dados demonstrativos coerentes

Use Congregação Vila Demo e campanha fictícia Presença que aproxima — Outubro/2026.

Participante de referência: Ana Clara M., grupo Adolescentes, 250 pontos aprovados e um envio separado de 45 pontos em análise. A pontuação exibida no ranking continua sendo 250.

Base demonstrativa do mês:

| Participante fictício | Grupo | Pontos aprovados |
| --- | --- | --- |
| Lucas M. | Jovens | 285 |
| Ana Clara M. | Adolescentes | 250 |
| Mateus A. | Jovens | 240 |
| Júlia S. | Adolescentes | 225 |
| Sara O. | Jovens | 220 |
| Davi L. | Adolescentes | 205 |
| Beatriz C. | Jovens | 180 |
| Samuel R. | Adolescentes | 165 |
| João P. | Jovens | 120 |
| Ester F. | Adolescentes | 95 |
| Rebeca T. | Jovens | 45 |
| Daniel B. | Adolescentes | 0 |

Pódios esperados com essa base:

- Geral: Lucas M., Ana Clara M. e Mateus A.
- Jovens: Lucas M., Mateus A. e Sara O.
- Adolescentes: Ana Clara M., Júlia S. e Davi L.

Não alterar os pontos de uma pessoa entre as três visões. Não somar os 45 pontos em análise de Ana antes da aprovação.

Ao simular a aprovação desse envio, Ana passa a 295 pontos, supera Lucas no Geral e permanece em primeiro no grupo de Adolescentes. Atualize todas as telas conectadas desse cenário.

O extrato detalhado que você criar precisa reproduzir os totais apresentados, utilizando combinações possíveis da tabela de pontos e atividades disponíveis. Não invente valores que não existam nas regras.

Use avatares por iniciais ou ilustrações neutras. Não utilizar fotos reais de menores. Telefones e nascimento podem aparecer mascarados nas demonstrações de gestão; não criar números que pareçam contatos de suporte reais.

Crie também um pequeno cenário separado de empate para demonstrar o fluxo de fechamento, sem modificar silenciosamente a base principal.

## 19. Priorização e limites

MVP visual completo:

- Cadastro individual e convite.
- Aprovação de vínculo.
- Login e recuperação pelo WhatsApp.
- Perfil.
- Agenda e ocorrências.
- Registro de presença com foto.
- Análise, decisão e reenvio.
- Pontuação e extrato.
- Três rankings mensais.
- Premiação e histórico.
- Gestão por perfil e grupo.
- Desafios simples.
- Encerramento mensal.
- Contexto de congregação.
- Notificações internas.
- Experiência PWA e estados de conexão.

Evoluções opcionais, separadas do MVP:

- Quiz bíblico.
- Participação infantil e gestão de responsáveis.
- Campanhas conjuntas entre congregações.
- Recuperação automatizada.
- Notificações push.
- Exportação de relatórios.
- Temas adicionais.
- Formas complementares de comprovação, se forem necessárias.

Não adicionar e-commerce, assinatura paga, doações, mural público, inteligência artificial de análise de fotos, rastreamento ou funcionalidades alheias ao objetivo.

## 20. Entregáveis e sequência de execução

Organize o trabalho em páginas ou seções equivalentes:

00 — Visão e decisões.
01 — Identidade.
02 — Sistema de design.
03 — Entrada e conta.
04 — Participante.
05 — Gestão.
06 — Administração.
07 — Estados e responsividade.
08 — Protótipo.
09 — Handoff.

Entregue:

1. Síntese do produto e premissas adotadas.
2. Avaliação curta do nome e direção de marca.
3. Arquitetura de informação e matriz de permissões.
4. Jornadas com início, decisão, resultado e exceções.
5. Sistema de design com tokens e componentes.
6. Telas de alta fidelidade do inventário.
7. Protótipo com ligações e estados coerentes.
8. Adaptações de layout.
9. Handoff visual, incluindo comportamento e regras por componente/tela.
10. Registro de decisões propostas e pendências de negócio.

Comece materializando cinco telas para estabelecer o padrão: login, início do participante, envio de presença, ranking e análise de uma presença. Em seguida, conclua o inventário e as variações. Não encerre a entrega nas cinco primeiras telas ou apenas em um plano escrito.

Se houver limite da ferramenta, trabalhe em lotes preservando a identidade, os componentes e os identificadores das telas. Informe de forma objetiva o que foi efetivamente desenhado e o que ainda falta. Não declare um protótipo navegável se apenas textos ou imagens estáticas foram produzidos.

Não afirmar que criou arquivos em Figma ou outra ferramenta sem tê-los criado. Se o ambiente não permitir desenhar ou conectar telas, entregue o máximo que ele realmente suportar e indique essa limitação.

As decisões de implementação de autenticação, armazenamento e integrações ficam para a etapa de codificação. O handoff pode apontar requisitos de comportamento e proteção, sem escolher uma arquitetura técnica não solicitada.

## 21. Verificação do protótipo e critérios de aceite

Antes de concluir, percorra visualmente os seguintes cenários:

1. Um adolescente se cadastra e não consegue selecionar um papel de liderança.
2. Um convite do grupo de Jovens não concede acesso à gestão de Adolescentes.
3. Um cadastro aguardando análise recebe orientação clara.
4. Um participante encontra uma atividade elegível e envia uma foto.
5. O envio fica em análise sem aumentar sua pontuação.
6. A direção de Adolescentes visualiza e aprova somente seu grupo.
7. A direção de Jovens não consegue abrir o comprovante de um adolescente por link direto.
8. O responsável pela congregação valida os dois grupos da própria congregação.
9. A direção da campanha consulta resultados sem acessar contatos, fotos privadas ou aprovação.
10. O administrador consegue revisar registros de todos os grupos e selecionar congregações.
11. Uma recusa apresenta motivo e um ajuste pode ser reenviado sem duplicar pontos.
12. A aprovação dos 45 pontos de Ana altera 250 para 295 em todos os locais corretos.
13. Uma atividade de 0 ponto registra presença sem alterar o saldo.
14. O limite de 50 pontos por ocorrência não limita a soma mensal.
15. Duas atividades distintas no mesmo dia não são confundidas com duplicidade.
16. O ranking geral e os dois filtros de grupo mantêm os mesmos saldos individuais.
17. Um empate não cria um premiado arbitrário.
18. O ciclo não encerra com análises ou desempates pendentes.
19. Uma aprovação durante a apuração mantém a atividade no mês correto.
20. O novo mês inicia com zero sem apagar resultados encerrados.
21. Uma mudança de grupo não reescreve silenciosamente o ciclo anterior.
22. O pedido de recuperação abre o WhatsApp sem afirmar que a mensagem já foi enviada.
23. A administração verifica a identidade antes de liberar a redefinição.
24. Uma falha de conexão mantém um rascunho, sem confirmar presença.
25. O layout de 360 px permite concluir a tarefa sem rolagem horizontal.
26. O uso de teclado, foco, contraste e mensagens não depende apenas de cor.
27. Nenhum ranking mostra WhatsApp, nascimento ou foto de comprovação.
28. A interface identifica claramente dados fictícios e regras ainda propostas.

Termine com um resumo objetivo da entrega real e uma lista curta do que o idealizador precisa confirmar antes da implementação:

- Nome e logo definitivos.
- Arquivo oficial da IEADPE para ajuste cromático.
- Número de WhatsApp do administrador.
- Igreja/congregação e organização do primeiro piloto.
- Valores dos ensaios e das atividades hoje exemplificadas com zero.
- Regras etárias dos grupos.
- Critérios de desempate.
- Acúmulo de premiação no Geral e no grupo.
- Janela de envio e calendário de apuração.
- Política de exposição do nome/avatar e uso de imagens.
- Eventuais autorizações de responsáveis e prazo de retenção.
- Confirmação das permissões propostas onde havia ambiguidade.

A ausência dessas confirmações não impede o protótipo com os padrões propostos. Deve impedir apenas que essas escolhas sejam tratadas como decisões finais do produto.

# FIM DO PROMPT MESTRE

---

## Prompt separado para futura criação da logo no GPT Imagens

Este prompt é opcional e não solicita geração de imagem nesta conversa. Substitua o nome e anexe a referência oficial se essas escolhas mudarem.

Crie uma proposta de identidade visual para uma plataforma PWA chamada “Eu Vou”, que incentiva jovens e adolescentes a participar de cultos, ensaios e atividades da igreja.

A ideia central é presença, encontro, comunhão e compromisso pessoal. A marca deve ser jovem, acolhedora, clara e respeitosa, com acabamento profissional e boa legibilidade em um celular simples.

Desenvolva um símbolo original e um logotipo com o texto exato “Eu Vou”. Explore de forma sutil a combinação de um caminho ou movimento de encontro com um sinal de confirmação, sem parecer aplicativo de transporte, turismo, venda de ingressos ou campanha política.

Use azul profundo, vermelho como acento e branco. Referências cromáticas propostas: azul #143A66 e vermelho #C8333D. Esses códigos não são um manual oficial da IEADPE. Se houver uma logo oficial anexada, utilize-a somente como referência cromática, sem copiar seu brasão ou sua composição.

Composição simples, poucos elementos, formas geométricas limpas e aparência adequada para futura vetorização. O símbolo precisa continuar reconhecível em 24 px e em um ícone de aplicativo. Evite degradês, sombras, efeitos 3D, fotografia, mockups, chamas genéricas, troféus e excesso de símbolos religiosos.

Entregue uma composição horizontal do símbolo com “Eu Vou”, em fundo transparente, com margens generosas. Não inclua slogan, legendas, marcas-d'água ou textos adicionais. O arquivo gerado será uma referência raster para posterior refinamento e vetorização; não o apresente como arquivo vetorial.

## Referências consultadas e limites

- Portal institucional da IEADPE: (link externo removido)
- Referência visual de logomarca encontrada em página de congregação: (link externo removido)
- W3C — WCAG 2.2, referência rápida: https://www.w3.org/WAI/WCAG22/quickref/
- W3C — Contraste mínimo: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

A referência visual localizada não substitui um manual oficial. Os códigos hexadecimais e demais escolhas de produto deste documento são propostas de design, não valores extraídos ou homologados pela IEADPE. Este documento prepara o trabalho visual; ele não constitui implementação, aprovação institucional ou revisão jurídica.

