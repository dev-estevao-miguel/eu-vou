# Eu Vou

PWA que incentiva a participação de jovens e adolescentes nas atividades da igreja: agenda → presença com foto → validação da liderança → pontos → ranking mensal.

<p>
  <a href="https://euvou.tscbr.com.br"><img alt="Acessar Eu Vou" src="https://img.shields.io/badge/VER%20PROJETO-euvou.tscbr.com.br-2ea44f?style=for-the-badge&logo=googlechrome&logoColor=white"/></a>
</p>

<p>
  <img alt="Status" src="https://img.shields.io/badge/status-piloto-10bfe1?style=flat-square"/>
  <img alt="React" src="https://img.shields.io/badge/React-19-1f2334?style=flat-square&logo=react&logoColor=61DAFB"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-1f2334?style=flat-square&logo=typescript&logoColor=3178C6"/>
  <img alt="Vite" src="https://img.shields.io/badge/Vite-PWA-1f2334?style=flat-square&logo=vite&logoColor=646CFF"/>
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-RLS-1f2334?style=flat-square&logo=supabase&logoColor=3ECF8E"/>
  <img alt="Dados" src="https://img.shields.io/badge/dados-100%25%20fict%C3%ADcios-10bfe1?style=flat-square"/>
</p>

> **Versão pública com dados de demonstração.** Congregação, pessoas e contas usadas nos testes e na documentação são fictícias ("Congregação Vila Demo", "Admin Demo"). Nenhum dado de participante, foto ou credencial real faz parte deste repositório.

## O problema

Em muitas congregações, a participação dos jovens nas atividades semanais é acompanhada de memória ou em listas de papel. A liderança não sabe quem está se afastando, os próprios jovens não veem o resultado do seu compromisso e qualquer campanha de incentivo depende de alguém somar presenças à mão no fim do mês.

Planilhas compartilhadas resolvem pouco: expõem dados pessoais de menores, não comprovam a presença e não separam o que cada responsável pode ver. Faltava algo leve, que rodasse no celular de qualquer jovem, sem instalação pela loja, e que respeitasse a hierarquia da igreja.

O Eu Vou registra a presença com uma foto de comprovação, deixa a liderança validar, transforma a participação em pontos e mostra um ranking mensal, com cada perfil vendo apenas o que lhe cabe.

## O que faz

- **Agenda** de atividades semanais e únicas por grupo e congregação.
- **Registro de presença com foto**, armazenada em bucket privado.
- **Validação pela liderança** e pontuação configurável por atividade.
- **Ranking mensal** por grupo, com campanhas.
- **Convites** por link, com validade e revogação, que já definem grupo e congregação.
- **Permissões por papel** (administrador, responsável da congregação, direção do grupo, participante) garantidas por RLS no banco.
- **PWA** instalável, com aviso de nova versão e cache apenas dos arquivos estáticos.

## Capturas

A interface pode ser conferida pelo protótipo aprovado em [`docs/referencias/prototipo-lote-1`](docs/referencias/prototipo-lote-1), com dados fictícios.

## Stack

| Camada         | Escolha                                                                               |
| -------------- | ------------------------------------------------------------------------------------- |
| Interface      | React 19 + TypeScript + Vite, PWA (`vite-plugin-pwa`)                                 |
| Rotas          | React Router                                                                          |
| Ícones / fonte | Phosphor (`@phosphor-icons/react`), Inter (empacotada, sem CDN)                       |
| Back-end       | Supabase: Postgres com RLS, Auth, Storage privado, Edge Functions                     |
| Hospedagem     | Vercel (estático)                                                                     |
| Testes         | Vitest (unidade e banco, com as migrações rodando no PGlite); Playwright (ponta a ponta) |
| Formatação     | Prettier, ESLint e EditorConfig                                                       |

Decisões e motivos: [docs/decisoes.md](docs/decisoes.md). Como contribuir: [CONTRIBUTING.md](CONTRIBUTING.md).

## Como executar

Requisitos: Node 24+ e npm.

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a chave publicável do Supabase
npm run dev                  # http://localhost:5173
```

O **catálogo de componentes** fica em `/dev/componentes` e serve para conferir a base visual com o protótipo. Ele só
existe em desenvolvimento e não entra no build de produção.

### Variáveis de ambiente

Só vão para o navegador os valores públicos (`VITE_*`). A chave secreta do Supabase (`sb_secret_…`) **nunca** entra no
código nem em variáveis `VITE_*`: ela fica nos segredos das Edge Functions e, apenas para os scripts locais
(`criar-admin`, `limpar-fotos-teste`), em `SUPABASE_SECRET_KEY` no `.env.local`, que é ignorado pelo Git.

### Supabase (CLI)

A CLI está instalada como dependência de desenvolvimento (`npx supabase …`). O login e o vínculo com um projeto são
feitos **por você, no terminal** — as credenciais ficam na sua máquina:

```bash
npx supabase login                          # abre o navegador para autorizar
npx supabase link --project-ref <ref>       # pede a senha do banco no terminal
npx supabase db push                        # aplica supabase/migrations no projeto vinculado
```

### Comandos

| Comando                      | O que faz                                                           |
| ---------------------------- | ------------------------------------------------------------------- |
| `npm run dev`                | Servidor de desenvolvimento                                         |
| `npm run build`              | Checagem de tipos + build de produção (gera o service worker)       |
| `npm run preview`            | Serve o build para testar a PWA                                     |
| `npm run typecheck`          | Somente checagem de tipos                                           |
| `npm run lint`               | ESLint                                                              |
| `npm test`                   | Testes de unidade e de banco (Vitest + PGlite)                      |
| `npm run format`             | Aplica a formatação padrão (Prettier)                               |
| `npm run format:check`       | Confere a formatação sem alterar arquivos                           |
| `npm run verificar`          | Formatação, lint, testes e build — rode antes de integrar na `main` |
| `npm run icons`              | Regenera os ícones da PWA a partir de `public/logo.svg`             |
| `npm run criar-admin`        | Alternativa por terminal para criar o primeiro administrador        |
| `npm run limpar-fotos-teste` | Lista (ou apaga, com `-- --confirmar`) as fotos das contas de teste |

### Estrutura

```text
src/
  app/              rotas, layouts, guardas de acesso, conta conectada, aviso de nova versão
  components/ui/    componentes reutilizáveis (botões, campos, tags, painéis…)
  components/       componentes de domínio (bloco de pontuação, cartão de atividade)
  pages/            telas (participante/, gestao/, entrada, cadastro…)
  lib/              clientes, regras de datas, agenda, fotos e consultas
  styles/           tokens do design, base e camada de componentes
supabase/
  migrations/       migrações SQL versionadas
  functions/        Edge Functions (cadastro, configurar-admin) e regras compartilhadas
  testes/           estrutura fictícia e limpeza dos dados de teste
tests/              testes de unidade e de banco (PGlite com o ambiente Supabase simulado)
scripts/            scripts locais de operação
docs/               decisões, modelo de dados, etapas e pendências
  referencias/      briefings e o protótipo aprovado (Lote 1), guardados como recebidos
```

### PWA e privacidade

O service worker guarda em cache **apenas** os arquivos estáticos do app. Respostas da API, fotos de comprovação e
avatares nunca são armazenados por ele, para não ficarem expostos depois de sair da conta ou trocar de usuário.
Novas versões aparecem com o aviso “Nova versão disponível” e só são aplicadas quando a pessoa toca em **Atualizar**.

## Escopo da versão pública

- Código completo do app, migrações, Edge Functions, testes e documentação.
- Identificadores sensíveis do ambiente de produção, como o projeto Supabase, permanecem substituídos por marcadores. O endereço público oficial da demonstração é **https://euvou.tscbr.com.br**.
- Dados de teste usam a congregação fictícia **Vila Demo**. Não acompanham o repositório: `.env*`, fotos e qualquer dado de participante.
- O Eu Vou não é um aplicativo oficial da IEADPE e não usa a marca da instituição.

## Licença

[MIT](LICENSE)

---

Desenvolvido por **Estevão dos Santos** · [github.com/dev-estevao-miguel](https://github.com/dev-estevao-miguel)
