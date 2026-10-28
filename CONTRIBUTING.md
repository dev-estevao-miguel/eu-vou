# Como contribuir

## Preparação

1. Node 24+ e npm. Rode `npm install`.
2. Copie `.env.example` para `.env.local` e preencha. O `.env.local` é ignorado pelo Git e **nunca** deve ser commitado.

## Fluxo de trabalho

- `main` é a linha estável: tudo nela compila, passa nos testes e pode ser publicado.
- Para cada mudança, crie uma branch curta a partir da `main`, no formato `tipo/descricao-curta`
  (ex.: `feat/reenvio-de-foto`, `fix/prazo-de-envio`, `docs/manual-da-direcao`).
- Antes de integrar na `main`, rode:

```bash
npm run format     # aplica a formatação padrão (Prettier)
npm run verificar  # formatação, lint, testes e build
```

## Mensagens de commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/), escrito em português:

```text
tipo(escopo): descrição curta no presente

Corpo opcional explicando o porquê da mudança. Cite as decisões
registradas em docs/decisoes.md quando houver (ex.: C10, D05).
```

- Descrição em letra minúscula, no presente (“adiciona”, “corrige”), sem ponto final, com até ~72 caracteres.
- Um assunto por commit. Não misture formatação com mudança de comportamento.

| Tipo       | Quando usar                                     |
| ---------- | ----------------------------------------------- |
| `feat`     | nova funcionalidade                             |
| `fix`      | correção de defeito                             |
| `docs`     | só documentação                                 |
| `style`    | só formatação, sem mudar comportamento          |
| `refactor` | reorganização de código sem mudar comportamento |
| `perf`     | melhoria de desempenho                          |
| `test`     | testes                                          |
| `build`    | build, dependências ou publicação               |
| `ci`       | automações de integração contínua               |
| `chore`    | manutenção do repositório                       |
| `revert`   | desfaz um commit anterior                       |

Escopos usados até aqui: `ui`, `auth`, `admin`, `db`, `presencas`, `gestao`, `scripts`, `deploy`, `repo`.

## Banco de dados

- Toda mudança de esquema é uma **migração nova** em `supabase/migrations` (`npx supabase migration new nome`).
- Nunca edite uma migração já aplicada no Supabase: crie outra que faça a correção.
- Antes de aplicar: `npm test` (os testes de banco rodam as migrações num Postgres local, o PGlite) e
  `npx supabase db push --linked --dry-run`.

## Segurança

- Segredos ficam só no `.env.local` e nos segredos das Edge Functions, nunca no código.
- Tudo que começa com `VITE_` vai para o navegador: nunca coloque chave secreta nessas variáveis.
- Dados fictícios ficam numa igreja marcada como teste e saem pela limpeza descrita em `docs/etapas.md`.
