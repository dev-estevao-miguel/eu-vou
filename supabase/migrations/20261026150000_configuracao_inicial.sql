-- Eu Vou · Configuração inicial do primeiro administrador pela própria tela do app.
-- Um link de uso único (token guardado só como hash, com validade) permite criar o
-- primeiro administrador. Depois de usado — ou se já existir um administrador — não
-- funciona mais. Sem senha padrão e sem promoção por autocadastro.

create table privado.configuracao_inicial (
  id integer primary key default 1 check (id = 1),
  token_hash bytea not null,
  expira_em timestamptz not null,
  usado_em timestamptz,
  criado_em timestamptz not null default now()
);
alter table privado.configuracao_inicial enable row level security;
revoke all on privado.configuracao_inicial from public, anon, authenticated;

create function privado.existe_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.funcoes f
    join public.perfis p on p.id = f.perfil_id and p.situacao = 'ativo'
    where f.funcao = 'admin' and f.revogada_em is null
  );
$$;
revoke execute on function privado.existe_admin() from public, anon, authenticated;

-- Situação do link, para a tela: 'valido', 'invalido' ou 'concluida' (já existe administrador).
create function public.situacao_configuracao_inicial(p_token text) returns text
language sql stable security definer set search_path = '' as $$
  select case
    when privado.existe_admin() then 'concluida'
    when exists (
      select 1 from privado.configuracao_inicial c
      where c.token_hash = privado.hash_token(p_token) and c.usado_em is null and c.expira_em > now()
    ) then 'valido'
    else 'invalido'
  end;
$$;
revoke execute on function public.situacao_configuracao_inicial(text) from public;
grant execute on function public.situacao_configuracao_inicial(text) to anon, authenticated, service_role;

-- Conclui a configuração. Chamada só pela Edge Function `configurar-admin`, depois que ela cria
-- o usuário no Auth. Consome o link na mesma transação.
create function public.concluir_configuracao_inicial(
  p_usuario_id uuid,
  p_token text,
  p_usuario text,
  p_nome_completo text,
  p_nome_exibicao text,
  p_whatsapp text,
  p_nascimento date
) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  c privado.configuracao_inicial;
begin
  select * into c from privado.configuracao_inicial where id = 1 for update;
  if not found or c.token_hash <> privado.hash_token(p_token) or c.usado_em is not null or c.expira_em <= now() then
    raise exception 'link_invalido' using errcode = '22023';
  end if;
  if privado.existe_admin() then
    raise exception 'ja_configurado' using errcode = '42501';
  end if;

  insert into public.perfis (id, usuario, nome_completo, nome_exibicao, whatsapp, nascimento, teste)
  values (p_usuario_id, p_usuario, btrim(p_nome_completo), btrim(p_nome_exibicao), p_whatsapp, p_nascimento, false);
  insert into public.funcoes (perfil_id, funcao) values (p_usuario_id, 'admin');
  update privado.configuracao_inicial set usado_em = now() where id = 1;
  insert into public.auditoria (ator_id, acao, alvo_tipo, alvo_id, justificativa)
  values (p_usuario_id, 'primeiro_admin_criado', 'perfil', p_usuario_id, 'Configuração inicial pelo link de uso único');
end;
$$;
revoke execute on function public.concluir_configuracao_inicial(uuid, text, text, text, text, text, date)
  from public, anon, authenticated;
grant execute on function public.concluir_configuracao_inicial(uuid, text, text, text, text, text, date)
  to service_role;
