Atue como desenvolvedor full stack sênior e meu parceiro técnico na implementação da plataforma “Eu Vou”.

Sou Estevão Miguel, idealizador e administrador do projeto. Quero iniciar o desenvolvimento real de uma PWA leve para incentivar a participação de jovens e adolescentes nas atividades da igreja.

O objetivo é transformar o escopo e o design em uma aplicação funcional, com autenticação individual, dados persistidos, fotos privadas, aprovação de presenças e rankings mensais.

IMPORTANTE: esta solicitação inicia a etapa de codificação. As instruções do documento de UX/UI que limitavam a entrega ao design pertencem à etapa anterior. Preserve suas regras de produto e referências visuais, mas agora implemente o sistema.

1. Leia o contexto antes de alterar arquivos

Inspecione o repositório e leia as instruções locais, README, configurações, dependências, estrutura, alterações existentes e documentação.

Procure o arquivo Eu_Vou_Prompt_Mestre_UX_UI_Claude.md, telas do design, exportações do protótipo, logo e decisões já registradas. Se algum material necessário estiver ausente, informe exatamente o que falta. Não presuma que você tem acesso a conversas, arquivos ou ferramentas que não foram disponibilizados.

Caso existam várias propostas de logo ou telas, pergunte qual foi aprovada. Não recrie arbitrariamente uma identidade visual já definida.

Prioridade: minhas respostas mais recentes → decisões confirmadas e registradas → escopo e design de referência → sugestões ainda não confirmadas.

Os itens chamados proposta, exemplo ou premissa no documento de UX/UI não são decisões finais. Identifique quais precisam de confirmação para a etapa atual.

2. Pergunte quando houver dúvida sobre funcionalidades

Sempre que houver dúvida relevante sobre funcionamento, regra de negócio, permissão, pontuação, dado necessário ou comportamento de uma tela, pergunte antes de implementar a decisão afetada.

Não invente uma regra para preencher uma lacuna do projeto.

Faça perguntas objetivas, agrupadas por assunto, preferencialmente até cinco por rodada. Apresente alternativas e sua recomendação quando isso facilitar minha resposta. Explique brevemente o impacto da escolha.

Não repita perguntas já respondidas. Registre as decisões para manter continuidade entre sessões.

Se uma dúvida bloquear apenas um módulo, avance nas partes independentes. Não transforme escolhas técnicas pequenas e reversíveis em pedidos constantes de aprovação.

Priorize dúvidas que afetem a próxima entrega. Não apresente de uma vez um questionário sobre todas as possibilidades futuras.

Exemplos de assuntos a confirmar quando ainda estiverem indefinidos:

- O desenvolvimento começa do zero ou aproveita um projeto existente?
- Qual design está aprovado?
- Qual será a infraestrutura de autenticação, banco, imagens e hospedagem?
- O primeiro piloto terá apenas Vila Demo ou várias congregações?
- Quais propostas de permissão, pontuação e aprovação serão adotadas?

Faça essas perguntas somente depois de verificar se os arquivos já contêm as respostas.

3. Escolha uma base técnica coerente

Se já existir uma base adequada, preserve suas tecnologias e convenções. Não migre todo o projeto por preferência pessoal.

Se o repositório estiver vazio, proponha uma arquitetura simples, considerando PWA, manutenção, custo, autenticação por nome de usuário, fotos privadas e futura expansão. Explique sua recomendação e confirme comigo as escolhas de infraestrutura ainda abertas.

Consulte documentação oficial atualizada quando precisar configurar bibliotecas ou serviços. Não invente APIs, versões ou recursos de provedores.

Não adicionar e-mail obrigatório apenas para acomodar uma ferramenta. Se o provedor de autenticação escolhido exigir um identificador diferente do nome de usuário previsto, explique a incompatibilidade e confirme a solução antes de mudar o cadastro.

Não implementar um sistema próprio de senhas improvisado. Utilize uma solução de autenticação adequada, com tratamento seguro de sessões e redefinição.

4. Escopo funcional

Fluxo central:

Cadastro → acesso individual → agenda → participação na atividade → envio de foto → análise da liderança → aprovação → pontos → ranking mensal → premiação e histórico.

Cadastro previsto:

- Nome completo.
- WhatsApp com DDD.
- Data de nascimento.
- Jovem ou Adolescente.
- Nome de usuário.
- Foto de perfil.
- Senha e confirmação.
- Congregação, conforme o convite ou fluxo definido.

Não confundir foto de perfil com comprovante de presença. Grupo de participação não concede cargo de liderança.

Perfis previstos:

- Administrador da plataforma: administração global.
- Responsável pela congregação: acompanhamento e validação de ambos os grupos da própria congregação.
- Direção da campanha: consulta de rankings e histórico, sem aprovação por padrão.
- Direção dos Jovens: gestão de participantes, convites, desafios e validações do próprio grupo.
- Direção dos Adolescentes/União: mesmas funções, restritas ao grupo de Adolescentes.
- Participante: próprio perfil, agenda, registros e rankings permitidos.

Use a matriz completa do documento de UX/UI. Se houver divergência ou permissão ainda proposta, confirme comigo; não amplie poderes por inferência.

O ranking geral reúne os participantes da campanha e congregação em questão. Não misture congregações automaticamente.

5. Regras essenciais de presença e pontos

- Atividades são ocorrências com data, horário, público e pontuação.
- O valor pertence à atividade, não simplesmente ao dia da semana.
- A pontuação é igual para Jovens e Adolescentes na mesma atividade.
- O limite previsto é de 50 pontos por ocorrência; não limita o total mensal.
- Os valores do calendário inicial são exemplos a confirmar.
- Os ensaios com zero ponto precisam de confirmação, pois também existe a intenção de valorizar sua participação.
- Somente presença aprovada acrescenta pontos.
- Em análise, recusada ou cancelada não altera o saldo.
- Uma pessoa pontua uma vez por ocorrência na campanha.
- Reenvio não pode gerar um segundo crédito.
- Duas atividades diferentes no mesmo dia não são duplicatas.
- A foto passa por revisão humana; não representa aprovação automática.
- Recusas e pedidos de ajuste precisam de motivo.
- Mudanças em pontos já aplicados devem ser rastreáveis.

Garanta no servidor e na persistência que duas aprovações simultâneas, cliques repetidos ou uma nova tentativa de requisição não concedam pontos duplicados. Não confiar apenas no bloqueio visual do botão.

As três classificações são Geral, Adolescentes e Jovens. Os filtros não alteram a pontuação individual.

Confirme os critérios de desempate, prazo de envio, fechamento, transferência de grupo e acúmulo de premiações antes de implementar essas regras como definitivas.

Prepare extrato de pontos e histórico mensal. Um novo mês não pode apagar o anterior. O fechamento precisa preservar o resultado final e permitir correções administrativas rastreáveis conforme a regra confirmada.

6. Recuperação de senha pelo WhatsApp

Fluxo inicial solicitado:

- Informar nome ou usuário, grupo e congregação.
- Exibir uma mensagem pronta.
- Abrir o WhatsApp do administrador com o texto preenchido.
- O próprio usuário envia a mensagem no WhatsApp.

Mensagem:

“Paz do Senhor, irmão Estevão. Sou [NOME OU USUÁRIO], do grupo de [JOVENS OU ADOLESCENTES], da congregação [CONGREGAÇÃO]. Esqueci minha senha. O senhor poderia verificar para mim?”

O número do suporte será configurável. Não inventá-lo nem colocar um número demonstrativo como contato real.

Abrir o WhatsApp não comprova o envio da mensagem. Não exibir confirmação falsa de solicitação recebida nem presumir integração com a caixa de mensagens.

A conclusão da recuperação deve verificar a identidade e permitir uma nova senha por mecanismo seguro, individual e com validade. Não expor a senha atual ou enviar senhas em texto aberto. Confirme a operação de suporte antes de finalizar esse módulo.

7. Proteção e isolamento de dados

Implemente autorização no servidor e na camada de dados pertinente, além da interface.

- Lideranças não podem alterar seu próprio cargo nem acessar outros grupos por modificar uma URL ou uma requisição.
- Cada consulta e alteração deve respeitar igreja, congregação, campanha e grupo.
- Comprovantes são privados e não devem usar armazenamento público.
- Validar acesso também ao obter uma imagem, não apenas ao listar registros.
- Contatos, nascimento e comprovantes não aparecem nos rankings.
- Participantes não podem aprovar seus próprios registros.
- Para lideranças participantes, confirme a política de revisão dos próprios registros.
- Dados fictícios e contas de teste permanecem separados da operação real.

Não colocar senhas, tokens ou chaves privilegiadas no código, nos registros ou em arquivos versionados. Disponibilize um exemplo de configuração sem valores secretos e explique a configuração local.

Não pedir que eu cole credenciais em mensagens. Oriente o uso do mecanismo seguro disponível no ambiente.

Defina com clareza a criação do primeiro administrador, sem senha padrão pública ou possibilidade de promoção pelo autocadastro.

Não remova dados, sobrescreva trabalho existente, execute migrações destrutivas, crie recursos pagos ou publique em produção sem autorização específica.

8. Interface e experiência PWA

Implemente o design disponibilizado, utilizando componentes reutilizáveis e português brasileiro.

Priorize o celular, aparelhos simples, redes instáveis, leitura clara e ações de toque confortáveis.

Navegação principal: Início, Agenda, Presenças, Ranking e Perfil. A área de gestão aparece somente a quem possui permissão.

Inclua estados de carregamento, vazio, erro, sucesso, acesso restrito, prazo encerrado, câmera indisponível e envio interrompido.

Para fotos, implemente validação de formato e tamanho, prévia, substituição e tratamento de falhas. Otimize o envio sem comprometer a utilidade da evidência. Confirme limites ainda abertos.

A PWA deve ser instalável nos ambientes compatíveis e funcionar no navegador. Uma versão inicial de configuração não basta para afirmar que a instalação foi testada.

Sem conexão, não afirmar que uma presença foi enviada. Rascunhos locais devem aparecer como tal e exigir envio confirmado após reconexão.

Planeje o cache para não expor sessões, respostas privadas ou comprovantes após sair ou trocar de conta. Não fazer cache indiscriminado de todas as rotas e imagens.

Não simular backend com armazenamento local e apresentar isso como autenticação ou persistência real.

9. Desenvolva por etapas funcionais

Adapte a sequência ao repositório e às respostas, preservando esta prioridade:

Etapa 1 — Diagnóstico, decisões essenciais, ambiente local, base visual e estrutura do projeto.

Etapa 2 — Persistência inicial, autenticação real, perfis, autorização e cadastro/acesso.

Etapa 3 — Primeiro fluxo completo: atividade → envio de presença → foto privada → análise → aprovação → crédito único → atualização das três classificações.

Etapa 4 — Gestão de participantes e convites, ajustes e reenvios, recuperação, desafios simples e notificações internas.

Etapa 5 — Fechamento mensal, premiação, histórico, revisão da PWA e preparação do piloto.

Não construir dezenas de páginas desconectadas antes de validar o fluxo principal. Também não considerar o MVP concluído ao terminar somente a primeira etapa.

Quiz, participação infantil, campanhas conjuntas e notificações push ficam fora do primeiro MVP, salvo nova orientação minha.

Se houver dependência externa indisponível, informe-a precisamente e avance no restante possível, identificando simulações e integrações pendentes.

10. Organização e continuidade

Mantenha documentação curta e atualizada sobre escopo confirmado, decisões, modelo de dados, configuração local, etapas e pendências.

Use migrações versionadas e dados de teste reproduzíveis, quando compatível com a base escolhida.

Preserve alterações existentes. Faça mudanças pequenas e coerentes; evite reescritas amplas sem necessidade.

Ao interromper uma sessão, registre o que foi concluído, a próxima tarefa e os bloqueios reais. Não marque módulos simulados como entregues.

Não termine cada pequena alteração perguntando se deve continuar. Depois das decisões necessárias, avance dentro do escopo autorizado.

11. Verificação e relato

Execute as verificações adequadas à etapa e os comandos existentes de build, tipos e qualidade.

Priorize testes significativos de:

- Acesso entre grupos e congregações.
- Cadastro sem possibilidade de autoatribuição de cargos.
- Comprovantes privados.
- Aprovação concorrente sem crédito duplicado.
- Recusa, reenvio e cancelamento.
- Coerência dos três rankings.
- Limites mensais e fechamento quando implementados.
- Recuperação de senha.
- Cache e troca de conta.

Percorra no navegador o fluxo completo entregue, incluindo celular. Se não conseguir executar uma verificação, informe o motivo; não afirme que passou.

Ao concluir cada etapa, apresente: comportamento implementado, como executá-lo, o que foi verificado e o que permanece pendente.

Sua primeira ação agora é inspecionar o projeto e os materiais disponíveis. Depois, resuma seu entendimento, identifique as dúvidas que realmente bloqueiam a próxima entrega e pergunte o necessário. Aguarde minhas respostas para as decisões afetadas e continue o trabalho independente. Se já houver informações suficientes, inicie a primeira etapa e explique o que está fazendo.

