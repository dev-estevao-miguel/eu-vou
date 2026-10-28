-- Remove TODOS os dados fictícios da fase de validação (decisão C05).
-- Apaga: contas de teste (Auth + perfil + vínculos + funções), igrejas de teste e tudo abaixo
-- delas (congregações, campanhas, convites) e o histórico ligado a esses dados.
-- NÃO apaga contas reais (perfis.teste = false), como a do administrador.
--
-- Execute somente quando decidir encerrar os testes, NESTA ORDEM:
--   1. npm run limpar-fotos-teste -- --confirmar      (fotos das contas de teste, pela API do Storage)
--   2. npx supabase db query --linked -f supabase/testes/limpar-dados-teste.sql
-- Presenças, envios e lançamentos das contas e congregações de teste caem em cascata.

begin;

create temporary table _congregacoes_teste on commit drop as
  select c.id from public.congregacoes c join public.igrejas i on i.id = c.igreja_id where i.teste;

create temporary table _perfis_teste on commit drop as
  select id from public.perfis where teste;

delete from public.auditoria
where congregacao_id in (select id from _congregacoes_teste)
   or ator_id in (select id from _perfis_teste)
   or alvo_id in (select id from _perfis_teste);

-- Perfis, vínculos e funções caem em cascata a partir de auth.users.
delete from auth.users where id in (select id from _perfis_teste);

-- Cadastros interrompidos: contas do domínio técnico sem perfil nunca são válidas.
delete from auth.users u
where u.email like '%@contas.euvou.invalid'
  and not exists (select 1 from public.perfis p where p.id = u.id);

-- Congregações, campanhas, convites e vínculos restantes caem em cascata.
delete from public.igrejas where teste;

select
  (select count(*) from public.perfis where teste) as perfis_teste_restantes,
  (select count(*) from public.igrejas where teste) as igrejas_teste_restantes,
  (select count(*) from public.perfis) as perfis_reais;

commit;
