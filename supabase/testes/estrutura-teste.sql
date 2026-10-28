-- Estrutura FICTÍCIA para a fase de validação (decisão C05).
-- Tudo fica abaixo de uma igreja marcada `teste = true` e é removido por limpar-dados-teste.sql.
-- Contas criadas por convites desta congregação recebem `perfis.teste = true` automaticamente.
--
-- Aplicar:  npx supabase db query --linked -f supabase/testes/estrutura-teste.sql

insert into public.igrejas (id, nome, teste)
values ('7e570000-0000-4000-8000-000000000001', 'Igreja de teste', true)
on conflict (id) do nothing;

insert into public.congregacoes (id, igreja_id, nome)
values ('7e570000-0000-4000-8000-0000000000a1', '7e570000-0000-4000-8000-000000000001', 'Vila Demo (teste)')
on conflict (id) do nothing;

insert into public.campanhas (id, congregacao_id, nome, inicio)
values ('7e570000-0000-4000-8000-0000000000c1', '7e570000-0000-4000-8000-0000000000a1',
        'Presença que aproxima (teste)', date '2026-10-01')
on conflict (id) do nothing;

select i.nome as igreja, c.nome as congregacao, ca.nome as campanha
from public.igrejas i
join public.congregacoes c on c.igreja_id = i.id
left join public.campanhas ca on ca.congregacao_id = c.id
where i.teste;
