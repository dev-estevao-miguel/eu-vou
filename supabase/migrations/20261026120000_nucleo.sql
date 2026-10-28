-- Eu Vou · Etapa 2 · Núcleo
-- Estrutura (igreja → congregação → campanha), perfis, vínculos, funções, convites,
-- auditoria e configurações. Toda tabela tem RLS; regras de permissão ficam no schema
-- `privado` (não exposto pela API). Alterações sensíveis só por funções que validam
-- a permissão no servidor e registram auditoria.

create extension if not exists pgcrypto with schema extensions;

-- Regras internas ficam fora dos schemas expostos pela API.
create schema privado;
grant usage on schema privado to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.grupo as enum ('jovens', 'adolescentes');
create type public.funcao as enum (
  'admin',
  'responsavel_congregacao',
  'direcao_campanha',
  'direcao_jovens',
  'direcao_adolescentes'
);
create type public.vinculo_situacao as enum ('pendente', 'ativo', 'recusado', 'encerrado');
create type public.perfil_situacao as enum ('ativo', 'desativado');

-- ---------------------------------------------------------------------------
-- Estrutura
-- ---------------------------------------------------------------------------
create table public.igrejas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(btrim(nome)) between 2 and 120),
  teste boolean not null default false,
  criado_em timestamptz not null default now()
);
comment on column public.igrejas.teste is
  'Dados fictícios da fase de validação. Tudo abaixo de uma igreja de teste é removido pelo script de limpeza.';

create table public.congregacoes (
  id uuid primary key default gen_random_uuid(),
  igreja_id uuid not null references public.igrejas (id) on delete cascade,
  nome text not null check (length(btrim(nome)) between 2 and 120),
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);
create index congregacoes_igreja_idx on public.congregacoes (igreja_id);

create table public.campanhas (
  id uuid primary key default gen_random_uuid(),
  congregacao_id uuid not null references public.congregacoes (id) on delete cascade,
  nome text not null check (length(btrim(nome)) between 2 and 120),
  inicio date not null,
  fim date,
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  check (fim is null or fim >= inicio)
);
-- Premissa do Lote 1: uma campanha ativa por congregação.
create unique index campanhas_uma_ativa on public.campanhas (congregacao_id) where ativa;

-- ---------------------------------------------------------------------------
-- Pessoas
-- ---------------------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  -- 3 a 30 caracteres: letras minúsculas, números, ponto e sublinhado; começa e termina com letra/número.
  usuario text not null unique check (usuario ~ '^[a-z0-9][a-z0-9._]{1,28}[a-z0-9]$'),
  nome_completo text not null check (length(btrim(nome_completo)) between 3 and 120),
  nome_exibicao text not null check (length(btrim(nome_exibicao)) between 2 and 40),
  -- Somente dígitos: DDD + número (10 ou 11 dígitos).
  whatsapp text not null check (whatsapp ~ '^[1-9][0-9]{9,10}$'),
  nascimento date not null check (nascimento > date '1900-01-01'),
  avatar_path text,
  situacao public.perfil_situacao not null default 'ativo',
  teste boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
comment on table public.perfis is 'Dados pessoais. Contato e nascimento só para quem a matriz permite; nunca em rankings.';

create table public.convites (
  id uuid primary key default gen_random_uuid(),
  -- Só o hash fica no banco; o token aparece uma única vez, no link gerado.
  token_hash bytea not null unique,
  congregacao_id uuid not null references public.congregacoes (id) on delete cascade,
  grupo public.grupo not null,
  criado_por uuid references public.perfis (id) on delete set null,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  revogado_em timestamptz,
  revogado_por uuid references public.perfis (id) on delete set null,
  cadastros integer not null default 0,
  check (expira_em > criado_em)
);
create index convites_escopo_idx on public.convites (congregacao_id, grupo);

-- Vínculo = participação de uma pessoa em uma congregação e grupo. Não é cargo.
create table public.vinculos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  congregacao_id uuid not null references public.congregacoes (id) on delete cascade,
  grupo public.grupo not null,
  situacao public.vinculo_situacao not null default 'pendente',
  convite_id uuid references public.convites (id) on delete set null,
  decidido_por uuid references public.perfis (id) on delete set null,
  decidido_em timestamptz,
  motivo text,
  criado_em timestamptz not null default now(),
  check (situacao <> 'recusado' or length(btrim(motivo)) > 0)
);
-- Uma participação vigente (pendente ou ativa) por pessoa.
create unique index vinculos_um_vigente on public.vinculos (perfil_id) where situacao in ('pendente', 'ativo');
create index vinculos_escopo_idx on public.vinculos (congregacao_id, grupo, situacao);

-- Funções de liderança. Só o administrador concede; ninguém altera a própria.
create table public.funcoes (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  funcao public.funcao not null,
  congregacao_id uuid references public.congregacoes (id) on delete cascade,
  campanha_id uuid references public.campanhas (id) on delete cascade,
  concedida_por uuid references public.perfis (id) on delete set null,
  concedida_em timestamptz not null default now(),
  revogada_por uuid references public.perfis (id) on delete set null,
  revogada_em timestamptz,
  constraint funcoes_escopo check (
    case funcao
      when 'admin' then congregacao_id is null and campanha_id is null
      when 'direcao_campanha' then campanha_id is not null and congregacao_id is null
      else congregacao_id is not null and campanha_id is null
    end
  )
);
create unique index funcoes_unica_vigente on public.funcoes (
  perfil_id, funcao, coalesce(congregacao_id, campanha_id, '00000000-0000-0000-0000-000000000000'::uuid)
) where revogada_em is null;
create index funcoes_perfil_idx on public.funcoes (perfil_id) where revogada_em is null;

-- ---------------------------------------------------------------------------
-- Auditoria e configurações
-- ---------------------------------------------------------------------------
create table public.auditoria (
  id bigint generated always as identity primary key,
  ator_id uuid references public.perfis (id) on delete set null,
  acao text not null,
  alvo_tipo text not null,
  alvo_id uuid,
  congregacao_id uuid references public.congregacoes (id) on delete set null,
  dados jsonb not null default '{}'::jsonb,
  justificativa text,
  criado_em timestamptz not null default now()
);
create index auditoria_alvo_idx on public.auditoria (alvo_tipo, alvo_id);

create table public.configuracoes (
  chave text primary key,
  valor jsonb not null,
  publica boolean not null default false,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid references public.perfis (id) on delete set null
);
-- O número de suporte começa vazio: nunca um número inventado ou demonstrativo.
insert into public.configuracoes (chave, valor, publica) values
  ('suporte_whatsapp', 'null'::jsonb, true),
  ('nome_plataforma', '"Eu Vou"'::jsonb, true);

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------
create function privado.tocar_atualizado_em() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;
create trigger perfis_atualizado_em before update on public.perfis
  for each row execute function privado.tocar_atualizado_em();

-- ---------------------------------------------------------------------------
-- Regras de permissão
-- ---------------------------------------------------------------------------

-- A pessoa conectada tem a função, ativa, no escopo informado?
-- Para funções com escopo, p_congregacao é obrigatório. Direção da campanha vale
-- para a congregação da campanha, enquanto a campanha estiver ativa.
create function privado.tem_funcao(p_funcao public.funcao, p_congregacao uuid default null)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.funcoes f
    join public.perfis p on p.id = f.perfil_id and p.situacao = 'ativo'
    left join public.campanhas c on c.id = f.campanha_id
    where f.perfil_id = (select auth.uid())
      and f.revogada_em is null
      and f.funcao = p_funcao
      and (f.campanha_id is null or c.ativa)
      and (
        p_funcao = 'admin'
        or f.congregacao_id = p_congregacao
        or c.congregacao_id = p_congregacao
      )
  );
$$;

create function privado.eh_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.tem_funcao('admin');
$$;

create function privado.direcao_do_grupo(p_grupo public.grupo) returns public.funcao
language sql immutable set search_path = '' as $$
  select case p_grupo when 'jovens' then 'direcao_jovens'::public.funcao
                      else 'direcao_adolescentes'::public.funcao end;
$$;

-- C08: aprova vínculo — admin, Responsável, Direção da campanha e a direção do mesmo grupo.
create function privado.pode_aprovar_vinculo(p_congregacao uuid, p_grupo public.grupo) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.eh_admin()
      or privado.tem_funcao('responsavel_congregacao', p_congregacao)
      or privado.tem_funcao('direcao_campanha', p_congregacao)
      or privado.tem_funcao(privado.direcao_do_grupo(p_grupo), p_congregacao);
$$;

-- Matriz: "Ver contatos e cadastro completo de terceiros" — admin, Responsável, direção do grupo.
create function privado.pode_ver_cadastro(p_congregacao uuid, p_grupo public.grupo) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.eh_admin()
      or privado.tem_funcao('responsavel_congregacao', p_congregacao)
      or privado.tem_funcao(privado.direcao_do_grupo(p_grupo), p_congregacao);
$$;

-- Matriz: "Gerar convite de autocadastro" — admin e direção do próprio grupo.
create function privado.pode_gerar_convite(p_congregacao uuid, p_grupo public.grupo) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.eh_admin()
      or privado.tem_funcao(privado.direcao_do_grupo(p_grupo), p_congregacao);
$$;

-- Participa (vínculo ativo) ou exerce alguma função na congregação.
create function privado.atua_na_congregacao(p_congregacao uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.eh_admin()
      or exists (
        select 1 from public.vinculos v
        where v.perfil_id = (select auth.uid()) and v.congregacao_id = p_congregacao and v.situacao = 'ativo'
      )
      or privado.tem_funcao('responsavel_congregacao', p_congregacao)
      or privado.tem_funcao('direcao_campanha', p_congregacao)
      or privado.tem_funcao('direcao_jovens', p_congregacao)
      or privado.tem_funcao('direcao_adolescentes', p_congregacao);
$$;

-- Pode ver o cadastro completo desta pessoa (pelo vínculo vigente dela)?
create function privado.pode_ver_perfil(p_perfil uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.vinculos v
    where v.perfil_id = p_perfil
      and v.situacao in ('pendente', 'ativo')
      and privado.pode_ver_cadastro(v.congregacao_id, v.grupo)
  ) or privado.eh_admin();
$$;

create function privado.hash_token(p_token text) returns bytea
language sql immutable set search_path = '' as $$
  select extensions.digest(convert_to(p_token, 'UTF8'), 'sha256');
$$;

revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.igrejas enable row level security;
alter table public.congregacoes enable row level security;
alter table public.campanhas enable row level security;
alter table public.perfis enable row level security;
alter table public.convites enable row level security;
alter table public.vinculos enable row level security;
alter table public.funcoes enable row level security;
alter table public.auditoria enable row level security;
alter table public.configuracoes enable row level security;

-- Visitantes não autenticados não leem tabelas; o necessário sai por funções específicas.
revoke all on public.igrejas, public.congregacoes, public.campanhas, public.perfis, public.convites,
  public.vinculos, public.funcoes, public.auditoria, public.configuracoes from anon;

-- Igrejas, congregações e campanhas: quem atua na congregação lê; só o admin altera.
create policy igrejas_ler on public.igrejas for select to authenticated using (
  (select privado.eh_admin())
  or exists (select 1 from public.congregacoes c where c.igreja_id = igrejas.id and privado.atua_na_congregacao(c.id))
);
create policy igrejas_inserir on public.igrejas for insert to authenticated
  with check ((select privado.eh_admin()));
create policy igrejas_alterar on public.igrejas for update to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
create policy igrejas_excluir on public.igrejas for delete to authenticated
  using ((select privado.eh_admin()));

create policy congregacoes_ler on public.congregacoes for select to authenticated
  using (privado.atua_na_congregacao(id));
create policy congregacoes_inserir on public.congregacoes for insert to authenticated
  with check ((select privado.eh_admin()));
create policy congregacoes_alterar on public.congregacoes for update to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
create policy congregacoes_excluir on public.congregacoes for delete to authenticated
  using ((select privado.eh_admin()));

create policy campanhas_ler on public.campanhas for select to authenticated
  using (privado.atua_na_congregacao(congregacao_id));
create policy campanhas_inserir on public.campanhas for insert to authenticated
  with check ((select privado.eh_admin()));
create policy campanhas_alterar on public.campanhas for update to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
create policy campanhas_excluir on public.campanhas for delete to authenticated
  using ((select privado.eh_admin()));

-- Perfis: o próprio, ou quem pode ver o cadastro completo da pessoa.
create policy perfis_ler on public.perfis for select to authenticated
  using (id = (select auth.uid()) or privado.pode_ver_perfil(id));
-- A pessoa altera só os campos liberados (privilégio por coluna abaixo).
-- C12: o nome no ranking não é editável pela própria pessoa.
create policy perfis_editar_proprio on public.perfis for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke insert, update, delete on public.perfis from authenticated;
grant update (whatsapp, avatar_path) on public.perfis to authenticated;

-- Convites: só quem pode gerar convites daquele grupo; o hash do token nunca sai.
create policy convites_ler on public.convites for select to authenticated
  using (privado.pode_gerar_convite(congregacao_id, grupo));
revoke all on public.convites from authenticated;
grant select (id, congregacao_id, grupo, criado_por, criado_em, expira_em, revogado_em, revogado_por, cadastros)
  on public.convites to authenticated;

-- Vínculos: o próprio, ou quem pode aprová-lo. Alterações só por função.
create policy vinculos_ler on public.vinculos for select to authenticated
  using (perfil_id = (select auth.uid()) or privado.pode_aprovar_vinculo(congregacao_id, grupo));
revoke insert, update, delete on public.vinculos from authenticated;

-- Funções: a própria pessoa e o admin leem. Alterações só por função de admin.
create policy funcoes_ler on public.funcoes for select to authenticated
  using (perfil_id = (select auth.uid()) or (select privado.eh_admin()));
revoke insert, update, delete on public.funcoes from authenticated;

-- Auditoria: somente o admin lê; ninguém escreve diretamente.
create policy auditoria_ler on public.auditoria for select to authenticated
  using ((select privado.eh_admin()));
revoke insert, update, delete on public.auditoria from authenticated;

-- Configurações: admin lê e altera; valores públicos saem por config_publica().
create policy configuracoes_admin on public.configuracoes for all to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
revoke insert, delete on public.configuracoes from authenticated;

-- ---------------------------------------------------------------------------
-- Funções da API (RPC)
-- ---------------------------------------------------------------------------

-- Valores públicos (ex.: número de suporte para a recuperação de senha).
create function public.config_publica() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(chave, valor), '{}'::jsonb)
  from public.configuracoes where publica;
$$;
grant execute on function public.config_publica() to anon, authenticated;

-- Situação de um convite, para a tela de cadastro. Não expõe dados de pessoas.
create function public.consultar_convite(p_token text)
returns table (situacao text, congregacao text, igreja text, grupo public.grupo, expira_em timestamptz)
language sql stable security definer set search_path = '' as $$
  select
    case
      when cv.revogado_em is not null or not cg.ativa then 'revogado'
      when cv.expira_em <= now() then 'expirado'
      else 'valido'
    end,
    cg.nome, ig.nome, cv.grupo, cv.expira_em
  from public.convites cv
  join public.congregacoes cg on cg.id = cv.congregacao_id
  join public.igrejas ig on ig.id = cg.igreja_id
  where cv.token_hash = privado.hash_token(p_token);
$$;
revoke execute on function public.consultar_convite(text) from public;
grant execute on function public.consultar_convite(text) to anon, authenticated, service_role;

-- Gera um link de convite para um grupo. O token é devolvido só agora.
create function public.criar_convite(p_congregacao uuid, p_grupo public.grupo, p_dias integer default 30)
returns table (id uuid, token text, expira_em timestamptz)
language plpgsql volatile security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_token text;
  v_id uuid;
  v_expira timestamptz;
begin
  if not privado.pode_gerar_convite(p_congregacao, p_grupo) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_dias is null or p_dias < 1 or p_dias > 90 then
    raise exception 'validade_invalida' using errcode = '22023';
  end if;
  v_token := rtrim(translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/', '-_'), '=');
  v_expira := now() + make_interval(days => p_dias);
  insert into public.convites (token_hash, congregacao_id, grupo, criado_por, expira_em)
  values (privado.hash_token(v_token), p_congregacao, p_grupo, auth.uid(), v_expira)
  returning convites.id into v_id;
  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, congregacao_id, dados)
  values (auth.uid(), 'convite_criado', 'convite', v_id, p_congregacao,
          jsonb_build_object('grupo', p_grupo, 'expira_em', v_expira));
  return query select v_id, v_token, v_expira;
end;
$$;
revoke execute on function public.criar_convite(uuid, public.grupo, integer) from public, anon;
grant execute on function public.criar_convite(uuid, public.grupo, integer) to authenticated;

create function public.revogar_convite(p_convite uuid) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  v public.convites;
begin
  select * into v from public.convites where id = p_convite;
  if not found or not privado.pode_gerar_convite(v.congregacao_id, v.grupo) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  update public.convites set revogado_em = now(), revogado_por = auth.uid()
  where id = p_convite and revogado_em is null;
  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, congregacao_id)
  values (auth.uid(), 'convite_revogado', 'convite', p_convite, v.congregacao_id);
end;
$$;
revoke execute on function public.revogar_convite(uuid) from public, anon;
grant execute on function public.revogar_convite(uuid) to authenticated;

-- Conclui o autocadastro. Chamada somente pela Edge Function `cadastro` (chave secreta),
-- depois que ela cria o usuário no Auth. Grupo e congregação vêm do convite.
create function public.registrar_cadastro(
  p_usuario_id uuid,
  p_token text,
  p_usuario text,
  p_nome_completo text,
  p_nome_exibicao text,
  p_whatsapp text,
  p_nascimento date
) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_convite public.convites;
  v_teste boolean;
  v_vinculo uuid;
begin
  select cv.* into v_convite
  from public.convites cv
  join public.congregacoes cg on cg.id = cv.congregacao_id
  where cv.token_hash = privado.hash_token(p_token)
    and cv.revogado_em is null and cv.expira_em > now() and cg.ativa
  for update of cv;
  if not found then
    raise exception 'convite_invalido' using errcode = '22023';
  end if;

  select ig.teste into v_teste
  from public.congregacoes cg join public.igrejas ig on ig.id = cg.igreja_id
  where cg.id = v_convite.congregacao_id;

  insert into public.perfis (id, usuario, nome_completo, nome_exibicao, whatsapp, nascimento, teste)
  values (p_usuario_id, p_usuario, btrim(p_nome_completo), btrim(p_nome_exibicao), p_whatsapp, p_nascimento, v_teste);

  insert into public.vinculos (perfil_id, congregacao_id, grupo, convite_id)
  values (p_usuario_id, v_convite.congregacao_id, v_convite.grupo, v_convite.id)
  returning id into v_vinculo;

  update public.convites set cadastros = cadastros + 1 where id = v_convite.id;

  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, congregacao_id, dados)
  values (p_usuario_id, 'cadastro_por_convite', 'vinculo', v_vinculo, v_convite.congregacao_id,
          jsonb_build_object('grupo', v_convite.grupo, 'convite_id', v_convite.id));
  return v_vinculo;
end;
$$;
revoke execute on function public.registrar_cadastro(uuid, text, text, text, text, text, date) from public, anon, authenticated;
grant execute on function public.registrar_cadastro(uuid, text, text, text, text, text, date) to service_role;

-- Cadastros aguardando aprovação no escopo de quem consulta.
-- C09: WhatsApp e nascimento só para quem pode ver o cadastro completo; os demais veem a idade.
create function public.listar_cadastros_pendentes()
returns table (
  vinculo_id uuid,
  perfil_id uuid,
  nome_completo text,
  usuario text,
  grupo public.grupo,
  congregacao_id uuid,
  congregacao text,
  idade integer,
  whatsapp text,
  nascimento date,
  criado_em timestamptz
)
language sql stable security definer set search_path = '' as $$
  select v.id, p.id, p.nome_completo, p.usuario, v.grupo, v.congregacao_id, cg.nome,
         extract(year from age(current_date, p.nascimento))::integer,
         case when privado.pode_ver_cadastro(v.congregacao_id, v.grupo) then p.whatsapp end,
         case when privado.pode_ver_cadastro(v.congregacao_id, v.grupo) then p.nascimento end,
         v.criado_em
  from public.vinculos v
  join public.perfis p on p.id = v.perfil_id
  join public.congregacoes cg on cg.id = v.congregacao_id
  where v.situacao = 'pendente'
    and p.id <> (select auth.uid())
    and privado.pode_aprovar_vinculo(v.congregacao_id, v.grupo)
  order by v.criado_em;
$$;
revoke execute on function public.listar_cadastros_pendentes() from public, anon;
grant execute on function public.listar_cadastros_pendentes() to authenticated;

-- Aprova ou recusa um vínculo pendente. A transição é atômica: só a primeira decisão vale.
create function public.decidir_vinculo(p_vinculo uuid, p_aprovar boolean, p_motivo text default null)
returns public.vinculo_situacao
language plpgsql volatile security definer set search_path = '' as $$
declare
  v public.vinculos;
  v_nova public.vinculo_situacao;
begin
  select * into v from public.vinculos where id = p_vinculo;
  if not found or not privado.pode_aprovar_vinculo(v.congregacao_id, v.grupo) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if v.perfil_id = auth.uid() then
    raise exception 'proprio_vinculo' using errcode = '42501';
  end if;
  if not p_aprovar and (p_motivo is null or length(btrim(p_motivo)) = 0) then
    raise exception 'motivo_obrigatorio' using errcode = '22023';
  end if;

  v_nova := case when p_aprovar then 'ativo'::public.vinculo_situacao else 'recusado'::public.vinculo_situacao end;
  update public.vinculos
  set situacao = v_nova, decidido_por = auth.uid(), decidido_em = now(),
      motivo = case when p_aprovar then null else btrim(p_motivo) end
  where id = p_vinculo and situacao = 'pendente';
  if not found then
    raise exception 'ja_decidido';
  end if;

  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, congregacao_id, dados, justificativa)
  values (auth.uid(), case when p_aprovar then 'vinculo_aprovado' else 'vinculo_recusado' end,
          'vinculo', p_vinculo, v.congregacao_id, jsonb_build_object('grupo', v.grupo, 'perfil_id', v.perfil_id),
          case when p_aprovar then null else btrim(p_motivo) end);
  return v_nova;
end;
$$;
revoke execute on function public.decidir_vinculo(uuid, boolean, text) from public, anon;
grant execute on function public.decidir_vinculo(uuid, boolean, text) to authenticated;

-- Tudo o que o app precisa saber sobre a conta conectada, em uma chamada.
create function public.minha_conta() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'perfil', (
      select jsonb_build_object(
        'id', p.id, 'usuario', p.usuario, 'nome_completo', p.nome_completo, 'nome_exibicao', p.nome_exibicao,
        'whatsapp', p.whatsapp, 'nascimento', p.nascimento, 'avatar_path', p.avatar_path,
        'situacao', p.situacao, 'teste', p.teste)
      from public.perfis p where p.id = (select auth.uid())
    ),
    'vinculo', (
      select jsonb_build_object(
        'id', v.id, 'situacao', v.situacao, 'grupo', v.grupo, 'motivo', v.motivo,
        'congregacao_id', cg.id, 'congregacao', cg.nome,
        'campanha', (select jsonb_build_object('id', ca.id, 'nome', ca.nome)
                     from public.campanhas ca where ca.congregacao_id = cg.id and ca.ativa))
      from public.vinculos v join public.congregacoes cg on cg.id = v.congregacao_id
      where v.perfil_id = (select auth.uid())
      order by (v.situacao in ('pendente', 'ativo')) desc, v.criado_em desc
      limit 1
    ),
    'funcoes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id, 'funcao', f.funcao,
        'congregacao_id', coalesce(f.congregacao_id, ca.congregacao_id),
        'congregacao', cg.nome, 'campanha_id', f.campanha_id, 'campanha', ca.nome) order by f.funcao)
      from public.funcoes f
      left join public.campanhas ca on ca.id = f.campanha_id
      left join public.congregacoes cg on cg.id = coalesce(f.congregacao_id, ca.congregacao_id)
      where f.perfil_id = (select auth.uid()) and f.revogada_em is null and (f.campanha_id is null or ca.ativa)
    ), '[]'::jsonb)
  );
$$;
revoke execute on function public.minha_conta() from public, anon;
grant execute on function public.minha_conta() to authenticated;

-- Administração de funções. Ninguém concede ou revoga a própria função.
create function public.conceder_funcao(
  p_perfil uuid, p_funcao public.funcao, p_congregacao uuid default null, p_campanha uuid default null
) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if not privado.eh_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_perfil = auth.uid() then
    raise exception 'propria_funcao' using errcode = '42501';
  end if;
  insert into public.funcoes (perfil_id, funcao, congregacao_id, campanha_id, concedida_por)
  values (p_perfil, p_funcao, p_congregacao, p_campanha, auth.uid())
  returning id into v_id;
  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, congregacao_id, dados)
  values (auth.uid(), 'funcao_concedida', 'funcao', v_id,
          coalesce(p_congregacao, (select congregacao_id from public.campanhas where id = p_campanha)),
          jsonb_build_object('perfil_id', p_perfil, 'funcao', p_funcao, 'campanha_id', p_campanha));
  return v_id;
end;
$$;
revoke execute on function public.conceder_funcao(uuid, public.funcao, uuid, uuid) from public, anon;
grant execute on function public.conceder_funcao(uuid, public.funcao, uuid, uuid) to authenticated;

create function public.revogar_funcao(p_funcao_id uuid, p_justificativa text) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  f public.funcoes;
begin
  if not privado.eh_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  select * into f from public.funcoes where id = p_funcao_id and revogada_em is null;
  if not found then
    raise exception 'nao_encontrada' using errcode = 'P0002';
  end if;
  if f.perfil_id = auth.uid() then
    raise exception 'propria_funcao' using errcode = '42501';
  end if;
  if p_justificativa is null or length(btrim(p_justificativa)) = 0 then
    raise exception 'justificativa_obrigatoria' using errcode = '22023';
  end if;
  update public.funcoes set revogada_em = now(), revogada_por = auth.uid() where id = p_funcao_id;
  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, dados, justificativa)
  values (auth.uid(), 'funcao_revogada', 'funcao', p_funcao_id,
          jsonb_build_object('perfil_id', f.perfil_id, 'funcao', f.funcao), btrim(p_justificativa));
end;
$$;
revoke execute on function public.revogar_funcao(uuid, text) from public, anon;
grant execute on function public.revogar_funcao(uuid, text) to authenticated;
