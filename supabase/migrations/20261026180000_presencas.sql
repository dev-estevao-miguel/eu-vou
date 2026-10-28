-- Eu Vou · Etapa 3 · Agenda, presenças com foto privada, validação, pontos e ranking.
-- Decisões: C10 (janela de envio: do término até 24 h), C11 (uma foto reduzida), C12 (nome no
-- ranking), C13 (mês da atividade), D10 (ninguém valida o próprio registro).

create type public.atividade_tipo as enum ('culto', 'oracao', 'ensaio', 'estudo', 'outra');
create type public.publico_alvo as enum ('todos', 'jovens', 'adolescentes');
create type public.presenca_situacao as enum (
  'em_analise', 'ajuste_solicitado', 'aprovada', 'recusada', 'cancelada', 'revogada'
);

-- ---------------------------------------------------------------------------
-- Agenda: a atividade é o modelo; cada ocorrência tem data, horário e pontos próprios.
-- ---------------------------------------------------------------------------
create table public.atividades (
  id uuid primary key default gen_random_uuid(),
  congregacao_id uuid not null references public.congregacoes (id) on delete cascade,
  titulo text not null check (length(btrim(titulo)) between 2 and 80),
  tipo public.atividade_tipo not null,
  publico public.publico_alvo not null default 'todos',
  pontos smallint not null check (pontos between 0 and 50),
  local text check (local is null or length(local) <= 120),
  dia_semana smallint check (dia_semana between 0 and 6), -- nulo = atividade em data única
  data_inicio date not null,
  data_fim date not null,
  hora_inicio time not null,
  hora_fim time not null,
  ativa boolean not null default true,
  criado_por uuid references public.perfis (id) on delete set null,
  criado_em timestamptz not null default now(),
  check (data_fim >= data_inicio and data_fim <= data_inicio + 400),
  check (hora_fim > hora_inicio)
);
create index atividades_congregacao_idx on public.atividades (congregacao_id);
create index atividades_criado_por_idx on public.atividades (criado_por);

create table public.ocorrencias (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references public.atividades (id) on delete cascade,
  congregacao_id uuid not null references public.congregacoes (id) on delete cascade,
  titulo text not null,
  tipo public.atividade_tipo not null,
  publico public.publico_alvo not null,
  pontos smallint not null check (pontos between 0 and 50),
  local text,
  inicio timestamptz not null,
  fim timestamptz not null,
  cancelada_em timestamptz,
  motivo_cancelamento text,
  unique (atividade_id, inicio),
  check (fim > inicio)
);
create index ocorrencias_agenda_idx on public.ocorrencias (congregacao_id, inicio);

-- ---------------------------------------------------------------------------
-- Presenças, envios (fotos), linha do tempo e extrato de pontos
-- ---------------------------------------------------------------------------
create table public.presencas (
  id uuid primary key default gen_random_uuid(),
  ocorrencia_id uuid not null references public.ocorrencias (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  congregacao_id uuid not null references public.congregacoes (id) on delete cascade,
  grupo public.grupo not null,
  mes date not null, -- C13: primeiro dia do mês da atividade (America/Recife)
  situacao public.presenca_situacao not null default 'em_analise',
  observacao text check (observacao is null or length(observacao) <= 200),
  decidido_por uuid references public.perfis (id) on delete set null,
  decidido_em timestamptz,
  motivo text,
  criado_em timestamptz not null default now(),
  -- Uma pessoa registra uma única vez cada ocorrência.
  unique (perfil_id, ocorrencia_id),
  check (situacao not in ('recusada', 'ajuste_solicitado') or length(btrim(motivo)) > 0)
);
create index presencas_fila_idx on public.presencas (congregacao_id, grupo, situacao);
create index presencas_pessoa_mes_idx on public.presencas (perfil_id, mes);
create index presencas_ocorrencia_idx on public.presencas (ocorrencia_id);
create index presencas_decidido_por_idx on public.presencas (decidido_por);

create table public.envios (
  id uuid primary key default gen_random_uuid(),
  presenca_id uuid not null references public.presencas (id) on delete cascade,
  foto_path text not null unique,
  tamanho integer check (tamanho > 0),
  tipo_mime text,
  criado_em timestamptz not null default now()
);
create index envios_presenca_idx on public.envios (presenca_id);

create table public.presenca_eventos (
  id bigint generated always as identity primary key,
  presenca_id uuid not null references public.presencas (id) on delete cascade,
  tipo text not null,
  ator_id uuid references public.perfis (id) on delete set null,
  motivo text,
  criado_em timestamptz not null default now()
);
create index presenca_eventos_presenca_idx on public.presenca_eventos (presenca_id);
create index presenca_eventos_ator_idx on public.presenca_eventos (ator_id);

-- Extrato imutável: só presença aprovada gera crédito; correções são novos lançamentos.
create table public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  congregacao_id uuid not null references public.congregacoes (id) on delete cascade,
  grupo public.grupo not null,
  mes date not null,
  presenca_id uuid references public.presencas (id) on delete cascade,
  pontos smallint not null,
  tipo text not null check (tipo in ('credito_presenca', 'estorno', 'ajuste_admin')),
  motivo text,
  criado_por uuid references public.perfis (id) on delete set null,
  criado_em timestamptz not null default now()
);
-- Garantia final contra crédito duplicado (cliques repetidos, aprovadores simultâneos, nova tentativa).
create unique index lancamentos_credito_unico on public.lancamentos (presenca_id) where tipo = 'credito_presenca';
create index lancamentos_ranking_idx on public.lancamentos (congregacao_id, mes);
create index lancamentos_pessoa_idx on public.lancamentos (perfil_id, mes);
create index lancamentos_criado_por_idx on public.lancamentos (criado_por);

-- Índices de chaves estrangeiras apontados pelo verificador do Supabase (núcleo).
create index auditoria_ator_idx on public.auditoria (ator_id);
create index auditoria_congregacao_idx on public.auditoria (congregacao_id);
create index configuracoes_atualizado_por_idx on public.configuracoes (atualizado_por);
create index convites_criado_por_idx on public.convites (criado_por);
create index convites_revogado_por_idx on public.convites (revogado_por);
create index funcoes_campanha_idx on public.funcoes (campanha_id);
create index funcoes_concedida_por_idx on public.funcoes (concedida_por);
create index funcoes_congregacao_idx on public.funcoes (congregacao_id);
create index funcoes_revogada_por_idx on public.funcoes (revogada_por);
create index vinculos_convite_idx on public.vinculos (convite_id);
create index vinculos_decidido_por_idx on public.vinculos (decidido_por);

-- ---------------------------------------------------------------------------
-- Regras de permissão
-- ---------------------------------------------------------------------------

-- Matriz: aprovar/recusar registros — admin, Responsável da congregação e direção do próprio grupo.
-- A Direção da campanha não valida (D01).
create function privado.pode_validar_presenca(p_congregacao uuid, p_grupo public.grupo) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.eh_admin()
      or privado.tem_funcao('responsavel_congregacao', p_congregacao)
      or privado.tem_funcao(privado.direcao_do_grupo(p_grupo), p_congregacao);
$$;
revoke execute on function privado.pode_validar_presenca(uuid, public.grupo) from public, anon;
grant execute on function privado.pode_validar_presenca(uuid, public.grupo) to authenticated, service_role;

create function privado.mes_de(p_momento timestamptz) returns date
language sql stable set search_path = '' as $$
  select date_trunc('month', p_momento at time zone 'America/Recife')::date;
$$;
grant execute on function privado.mes_de(timestamptz) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.atividades enable row level security;
alter table public.ocorrencias enable row level security;
alter table public.presencas enable row level security;
alter table public.envios enable row level security;
alter table public.presenca_eventos enable row level security;
alter table public.lancamentos enable row level security;

revoke all on public.atividades, public.ocorrencias, public.presencas, public.envios,
  public.presenca_eventos, public.lancamentos from anon;
revoke insert, update, delete on public.atividades, public.ocorrencias, public.presencas, public.envios,
  public.presenca_eventos, public.lancamentos from authenticated;

create policy atividades_ler on public.atividades for select to authenticated
  using (privado.atua_na_congregacao(congregacao_id));
create policy ocorrencias_ler on public.ocorrencias for select to authenticated
  using (privado.atua_na_congregacao(congregacao_id));
create policy presencas_ler on public.presencas for select to authenticated
  using (perfil_id = (select auth.uid()) or privado.pode_validar_presenca(congregacao_id, grupo));
create policy envios_ler on public.envios for select to authenticated using (
  exists (select 1 from public.presencas p where p.id = envios.presenca_id
          and (p.perfil_id = (select auth.uid()) or privado.pode_validar_presenca(p.congregacao_id, p.grupo)))
);
create policy presenca_eventos_ler on public.presenca_eventos for select to authenticated using (
  exists (select 1 from public.presencas p where p.id = presenca_eventos.presenca_id
          and (p.perfil_id = (select auth.uid()) or privado.pode_validar_presenca(p.congregacao_id, p.grupo)))
);
create policy lancamentos_ler on public.lancamentos for select to authenticated
  using (perfil_id = (select auth.uid()) or privado.pode_validar_presenca(congregacao_id, grupo));

-- ---------------------------------------------------------------------------
-- Fotos de comprovação: bucket PRIVADO. Caminho: {perfil}/{ocorrencia}/{arquivo}.jpg
-- Ler a lista não dá acesso à imagem: a leitura do arquivo também passa pela permissão.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comprovantes', 'comprovantes', false, 3145728, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy comprovantes_enviar_proprio on storage.objects for insert to authenticated with check (
  bucket_id = 'comprovantes' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy comprovantes_ler on storage.objects for select to authenticated using (
  bucket_id = 'comprovantes' and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.envios e join public.presencas p on p.id = e.presenca_id
      where e.foto_path = objects.name and privado.pode_validar_presenca(p.congregacao_id, p.grupo)
    )
  )
);

-- ---------------------------------------------------------------------------
-- Funções da API
-- ---------------------------------------------------------------------------

-- Admin: cria atividade e gera as ocorrências (semanal ou data única), no horário de Recife.
create function public.criar_atividade(
  p_congregacao uuid,
  p_titulo text,
  p_tipo public.atividade_tipo,
  p_publico public.publico_alvo,
  p_pontos integer,
  p_local text,
  p_dia_semana integer,
  p_data_inicio date,
  p_data_fim date,
  p_hora_inicio time,
  p_hora_fim time
) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_id uuid;
  v_fim date := case when p_dia_semana is null then p_data_inicio else p_data_fim end;
  v_qtd integer;
begin
  if not privado.eh_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  insert into public.atividades (congregacao_id, titulo, tipo, publico, pontos, local, dia_semana,
                                 data_inicio, data_fim, hora_inicio, hora_fim, criado_por)
  values (p_congregacao, btrim(p_titulo), p_tipo, p_publico, p_pontos, nullif(btrim(p_local), ''), p_dia_semana,
          p_data_inicio, v_fim, p_hora_inicio, p_hora_fim, auth.uid())
  returning id into v_id;

  insert into public.ocorrencias (atividade_id, congregacao_id, titulo, tipo, publico, pontos, local, inicio, fim)
  select v_id, p_congregacao, btrim(p_titulo), p_tipo, p_publico, p_pontos, nullif(btrim(p_local), ''),
         (d::date + p_hora_inicio) at time zone 'America/Recife',
         (d::date + p_hora_fim) at time zone 'America/Recife'
  from generate_series(p_data_inicio, v_fim, interval '1 day') d
  where p_dia_semana is null or extract(dow from d) = p_dia_semana;
  get diagnostics v_qtd = row_count;

  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, congregacao_id, dados)
  values (auth.uid(), 'atividade_criada', 'atividade', v_id, p_congregacao,
          jsonb_build_object('titulo', p_titulo, 'pontos', p_pontos, 'ocorrencias', v_qtd));
  return v_qtd;
end;
$$;

-- Admin: altera a pontuação das próximas ocorrências (as já realizadas mantêm o valor).
create function public.alterar_pontos_atividade(p_atividade uuid, p_pontos integer) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_qtd integer;
begin
  if not privado.eh_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  update public.atividades set pontos = p_pontos where id = p_atividade;
  update public.ocorrencias set pontos = p_pontos
  where atividade_id = p_atividade and inicio > now() and cancelada_em is null;
  get diagnostics v_qtd = row_count;
  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, dados)
  values (auth.uid(), 'pontos_alterados', 'atividade', p_atividade,
          jsonb_build_object('pontos', p_pontos, 'ocorrencias_futuras', v_qtd));
  return v_qtd;
end;
$$;

-- Admin: cancela uma ocorrência; registros em análise dela são cancelados (não somam pontos).
create function public.cancelar_ocorrencia(p_ocorrencia uuid, p_motivo text) returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not privado.eh_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_motivo is null or length(btrim(p_motivo)) = 0 then
    raise exception 'motivo_obrigatorio' using errcode = '22023';
  end if;
  update public.ocorrencias set cancelada_em = now(), motivo_cancelamento = btrim(p_motivo)
  where id = p_ocorrencia and cancelada_em is null;
  with afetadas as (
    update public.presencas set situacao = 'cancelada', motivo = 'Atividade cancelada: ' || btrim(p_motivo)
    where ocorrencia_id = p_ocorrencia and situacao = 'em_analise'
    returning id
  )
  insert into public.presenca_eventos (presenca_id, tipo, ator_id, motivo)
  select id, 'cancelada_pela_atividade', auth.uid(), btrim(p_motivo) from afetadas;
  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, justificativa)
  values (auth.uid(), 'ocorrencia_cancelada', 'ocorrencia', p_ocorrencia, btrim(p_motivo));
end;
$$;

-- Agenda do participante: ocorrências da própria congregação para o próprio grupo, com a situação
-- do seu registro e a janela de envio (C10).
create function public.minha_agenda(p_de date, p_ate date)
returns table (
  id uuid, titulo text, tipo public.atividade_tipo, publico public.publico_alvo, pontos smallint, local text,
  inicio timestamptz, fim timestamptz, cancelada boolean, motivo_cancelamento text,
  registro_abre timestamptz, registro_fecha timestamptz,
  presenca_id uuid, presenca_situacao public.presenca_situacao, presenca_motivo text
)
language sql stable security definer set search_path = '' as $$
  with v as (
    select congregacao_id, grupo from public.vinculos
    where perfil_id = (select auth.uid()) and situacao = 'ativo'
  )
  select o.id, o.titulo, o.tipo, o.publico, o.pontos, o.local, o.inicio, o.fim,
         o.cancelada_em is not null, o.motivo_cancelamento,
         o.fim, o.fim + interval '24 hours',
         p.id, p.situacao, p.motivo
  from public.ocorrencias o
  join v on v.congregacao_id = o.congregacao_id
  left join public.presencas p on p.ocorrencia_id = o.id and p.perfil_id = (select auth.uid())
  where (o.publico = 'todos' or o.publico::text = v.grupo::text)
    and o.inicio >= (p_de::timestamp at time zone 'America/Recife')
    and o.inicio < ((p_ate + 1)::timestamp at time zone 'America/Recife')
  order by o.inicio;
$$;

-- Registra a presença depois do envio da foto ao bucket privado.
create function public.registrar_presenca(
  p_ocorrencia uuid, p_foto_path text, p_tamanho integer, p_tipo_mime text, p_observacao text default null
) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare
  o public.ocorrencias;
  v public.vinculos;
  v_presenca uuid;
begin
  select * into o from public.ocorrencias where id = p_ocorrencia;
  if not found then
    raise exception 'atividade_inexistente' using errcode = 'P0002';
  end if;
  select * into v from public.vinculos
  where perfil_id = auth.uid() and situacao = 'ativo' and congregacao_id = o.congregacao_id;
  if not found or (o.publico <> 'todos' and o.publico::text <> v.grupo::text) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if o.cancelada_em is not null then
    raise exception 'atividade_cancelada' using errcode = '22023';
  end if;
  if now() < o.fim then
    raise exception 'registro_ainda_nao_abriu' using errcode = '22023';
  end if;
  if now() > o.fim + interval '24 hours' then
    raise exception 'prazo_encerrado' using errcode = '22023';
  end if;
  if p_foto_path is null or p_foto_path not like (auth.uid()::text || '/' || p_ocorrencia::text || '/%') then
    raise exception 'foto_invalida' using errcode = '22023';
  end if;
  if not exists (select 1 from storage.objects s where s.bucket_id = 'comprovantes' and s.name = p_foto_path) then
    raise exception 'foto_nao_enviada' using errcode = '22023';
  end if;

  begin
    insert into public.presencas (ocorrencia_id, perfil_id, congregacao_id, grupo, mes, observacao)
    values (o.id, auth.uid(), o.congregacao_id, v.grupo, privado.mes_de(o.inicio),
            nullif(btrim(left(p_observacao, 200)), ''))
    returning id into v_presenca;
  exception when unique_violation then
    raise exception 'ja_registrada' using errcode = '23505';
  end;
  insert into public.envios (presenca_id, foto_path, tamanho, tipo_mime)
  values (v_presenca, p_foto_path, p_tamanho, p_tipo_mime);
  insert into public.presenca_eventos (presenca_id, tipo, ator_id) values (v_presenca, 'enviada', auth.uid());
  return v_presenca;
end;
$$;

-- Fila de validação no escopo de quem consulta. Nunca inclui os próprios registros (D10).
create function public.fila_validacao(p_decididos boolean default false)
returns table (
  presenca_id uuid, situacao public.presenca_situacao, perfil_id uuid, nome_completo text, nome_exibicao text,
  grupo public.grupo, congregacao text, ocorrencia text, tipo public.atividade_tipo, inicio timestamptz,
  fim timestamptz, pontos smallint, foto_path text, observacao text, enviado_em timestamptz,
  decidido_em timestamptz, motivo text, saldo_mes integer
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.situacao, pf.id, pf.nome_completo, pf.nome_exibicao, p.grupo, cg.nome, o.titulo, o.tipo,
         o.inicio, o.fim, o.pontos,
         (select e.foto_path from public.envios e where e.presenca_id = p.id order by e.criado_em desc limit 1),
         p.observacao, p.criado_em, p.decidido_em, p.motivo,
         coalesce((select sum(l.pontos)::integer from public.lancamentos l
                   where l.perfil_id = p.perfil_id and l.mes = p.mes and l.congregacao_id = p.congregacao_id), 0)
  from public.presencas p
  join public.perfis pf on pf.id = p.perfil_id
  join public.ocorrencias o on o.id = p.ocorrencia_id
  join public.congregacoes cg on cg.id = p.congregacao_id
  where privado.pode_validar_presenca(p.congregacao_id, p.grupo)
    and p.perfil_id <> (select auth.uid())
    and (case when p_decididos then p.situacao <> 'em_analise' else p.situacao = 'em_analise' end)
  order by case when p_decididos then p.decidido_em end desc nulls last, p.criado_em
  limit 200;
$$;

-- Aprova ou recusa. Transição atômica: só a primeira decisão vale, e o crédito é único.
create function public.decidir_presenca(p_presenca uuid, p_aprovar boolean, p_motivo text default null)
returns public.presenca_situacao
language plpgsql volatile security definer set search_path = '' as $$
declare
  p public.presencas;
  v_pontos smallint;
  v_nova public.presenca_situacao;
begin
  select * into p from public.presencas where id = p_presenca;
  if not found or not privado.pode_validar_presenca(p.congregacao_id, p.grupo) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p.perfil_id = auth.uid() then
    raise exception 'proprio_registro' using errcode = '42501';
  end if;
  if not p_aprovar and (p_motivo is null or length(btrim(p_motivo)) = 0) then
    raise exception 'motivo_obrigatorio' using errcode = '22023';
  end if;

  v_nova := case when p_aprovar then 'aprovada'::public.presenca_situacao else 'recusada'::public.presenca_situacao end;
  update public.presencas
  set situacao = v_nova, decidido_por = auth.uid(), decidido_em = now(),
      motivo = case when p_aprovar then null else btrim(p_motivo) end
  where id = p_presenca and situacao = 'em_analise';
  if not found then
    raise exception 'ja_decidido';
  end if;

  if p_aprovar then
    select pontos into v_pontos from public.ocorrencias where id = p.ocorrencia_id;
    if v_pontos > 0 then
      insert into public.lancamentos (perfil_id, congregacao_id, grupo, mes, presenca_id, pontos, tipo, criado_por)
      values (p.perfil_id, p.congregacao_id, p.grupo, p.mes, p.id, v_pontos, 'credito_presenca', auth.uid());
    end if;
  end if;
  insert into public.presenca_eventos (presenca_id, tipo, ator_id, motivo)
  values (p.id, case when p_aprovar then 'aprovada' else 'recusada' end, auth.uid(),
          case when p_aprovar then null else btrim(p_motivo) end);
  return v_nova;
end;
$$;

-- Ranking do mês (C12/C13): só posição, nome de exibição, grupo e pontos aprovados.
-- Nunca contato, nascimento ou comprovante. Empates recebem a mesma posição (desempate D05 pendente).
create function public.ranking(p_mes date default null, p_congregacao uuid default null)
returns table (
  perfil_id uuid, nome_exibicao text, avatar_path text, grupo public.grupo, pontos integer,
  posicao_geral integer, posicao_grupo integer, sou_eu boolean
)
language sql stable security definer set search_path = '' as $$
  with alvo as (
    select coalesce(
      p_congregacao,
      (select congregacao_id from public.vinculos where perfil_id = (select auth.uid()) and situacao = 'ativo' limit 1)
    ) as congregacao_id,
    coalesce(p_mes, privado.mes_de(now())) as mes
  ),
  participantes as (
    select v.perfil_id, v.grupo, pf.nome_exibicao, pf.avatar_path,
           coalesce((select sum(l.pontos)::integer from public.lancamentos l, alvo a2
                     where l.perfil_id = v.perfil_id and l.mes = a2.mes and l.congregacao_id = a2.congregacao_id), 0) as pontos
    from public.vinculos v
    join public.perfis pf on pf.id = v.perfil_id and pf.situacao = 'ativo'
    join alvo a on a.congregacao_id = v.congregacao_id
    where v.situacao = 'ativo' and privado.atua_na_congregacao(a.congregacao_id)
  )
  select perfil_id, nome_exibicao, avatar_path, grupo, pontos,
         (rank() over (order by pontos desc))::integer,
         (rank() over (partition by grupo order by pontos desc))::integer,
         perfil_id = (select auth.uid())
  from participantes
  order by pontos desc, nome_exibicao;
$$;

-- Extrato do mês da pessoa conectada.
create function public.minhas_presencas(p_mes date default null)
returns table (
  presenca_id uuid, ocorrencia_id uuid, titulo text, tipo public.atividade_tipo, inicio timestamptz,
  pontos smallint, situacao public.presenca_situacao, motivo text, pontos_creditados integer
)
language sql stable security definer set search_path = '' as $$
  select p.id, o.id, o.titulo, o.tipo, o.inicio, o.pontos, p.situacao, p.motivo,
         coalesce((select sum(l.pontos)::integer from public.lancamentos l where l.presenca_id = p.id), 0)
  from public.presencas p
  join public.ocorrencias o on o.id = p.ocorrencia_id
  where p.perfil_id = (select auth.uid()) and p.mes = coalesce(p_mes, privado.mes_de(now()))
  order by o.inicio desc;
$$;

revoke execute on function public.criar_atividade(uuid, text, public.atividade_tipo, public.publico_alvo, integer, text, integer, date, date, time, time) from public, anon;
revoke execute on function public.alterar_pontos_atividade(uuid, integer) from public, anon;
revoke execute on function public.cancelar_ocorrencia(uuid, text) from public, anon;
revoke execute on function public.minha_agenda(date, date) from public, anon;
revoke execute on function public.registrar_presenca(uuid, text, integer, text, text) from public, anon;
revoke execute on function public.fila_validacao(boolean) from public, anon;
revoke execute on function public.decidir_presenca(uuid, boolean, text) from public, anon;
revoke execute on function public.ranking(date, uuid) from public, anon;
revoke execute on function public.minhas_presencas(date) from public, anon;
grant execute on function public.criar_atividade(uuid, text, public.atividade_tipo, public.publico_alvo, integer, text, integer, date, date, time, time) to authenticated;
grant execute on function public.alterar_pontos_atividade(uuid, integer) to authenticated;
grant execute on function public.cancelar_ocorrencia(uuid, text) to authenticated;
grant execute on function public.minha_agenda(date, date) to authenticated;
grant execute on function public.registrar_presenca(uuid, text, integer, text, text) to authenticated;
grant execute on function public.fila_validacao(boolean) to authenticated;
grant execute on function public.decidir_presenca(uuid, boolean, text) to authenticated;
grant execute on function public.ranking(date, uuid) to authenticated;
grant execute on function public.minhas_presencas(date) to authenticated;
