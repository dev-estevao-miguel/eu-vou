import { useState, type FormEvent } from 'react'
import { BuildingsIcon, ChurchIcon, FlagBannerIcon } from '@phosphor-icons/react'
import { Alert, Button, EmptyState, Spinner, TextField, useToast } from '../../components/ui'
import { useContaConectada } from '../../app/conta/ContaProvider'
import { supabase } from '../../lib/supabase'
import { useConsulta } from '../../lib/useConsulta'
import { mensagemDeErro } from '../../lib/erros'
import { ehAdmin } from '../../lib/conta'
import { hojeIso } from '../../lib/datas'
import { AcessoRestrito } from '../Estados'

type Igreja = {
  id: string
  nome: string
  teste: boolean
  congregacoes: {
    id: string
    nome: string
    ativa: boolean
    campanhas: { id: string; nome: string; inicio: string; ativa: boolean }[]
  }[]
}

/** AD02 (versão da Etapa 3) · Igrejas, congregações e campanhas. Exclusivo do administrador. */
export default function Congregacoes() {
  const conta = useContaConectada()
  const toast = useToast()
  const lista = useConsulta<Igreja[]>('congregacoes', () =>
    supabase
      .from('igrejas')
      .select('id, nome, teste, congregacoes(id, nome, ativa, campanhas(id, nome, inicio, ativa))')
      .order('nome'),
  )
  const [igreja, setIgreja] = useState({ nome: '', teste: false })
  const [cong, setCong] = useState({ igreja: '', nome: '' })
  const [camp, setCamp] = useState({ cong: '', nome: 'Presença que aproxima', inicio: hojeIso() })

  if (!ehAdmin(conta)) {
    return (
      <AcessoRestrito
        texto="Congregações e campanhas são administradas pelo administrador da plataforma."
        voltarPara="/gestao"
      />
    )
  }

  const igrejas = lista.dados ?? []
  const todasCongs = igrejas.flatMap((i) => i.congregacoes.map((c) => ({ ...c, igreja: i.nome })))

  async function salvar(promessa: PromiseLike<{ error: unknown }>, ok: string) {
    const { error } = await promessa
    const msg = error ? mensagemDeErro(error) : ok
    toast.show(/unique|duplicate|já existe/i.test(msg) ? 'Essa congregação já tem uma campanha ativa.' : msg)
    if (!error) lista.recarregar()
    return !error
  }

  async function criarIgreja(e: FormEvent) {
    e.preventDefault()
    if (igreja.nome.trim().length < 2) return
    if (
      await salvar(
        supabase.from('igrejas').insert({ nome: igreja.nome.trim(), teste: igreja.teste }),
        'Igreja cadastrada.',
      )
    )
      setIgreja({ nome: '', teste: false })
  }
  async function criarCong(e: FormEvent) {
    e.preventDefault()
    const igrejaId = cong.igreja || igrejas[0]?.id
    if (!igrejaId || cong.nome.trim().length < 2) return
    if (
      await salvar(
        supabase.from('congregacoes').insert({ igreja_id: igrejaId, nome: cong.nome.trim() }),
        'Congregação cadastrada.',
      )
    )
      setCong({ igreja: '', nome: '' })
  }
  async function criarCamp(e: FormEvent) {
    e.preventDefault()
    const congId = camp.cong || todasCongs[0]?.id
    if (!congId || camp.nome.trim().length < 2) return
    await salvar(
      supabase.from('campanhas').insert({ congregacao_id: congId, nome: camp.nome.trim(), inicio: camp.inicio }),
      'Campanha cadastrada.',
    )
  }

  return (
    <div className="stack" style={{ gap: 20, maxWidth: 860 }}>
      <section className="stack" style={{ gap: 10 }}>
        <h2 style={{ fontSize: 16 }}>Estrutura cadastrada</h2>
        {lista.erro ? (
          <Alert tone="error" role="alert">
            {lista.erro}
          </Alert>
        ) : lista.carregando ? (
          <Spinner label="Carregando" />
        ) : igrejas.length === 0 ? (
          <div className="card">
            <EmptyState icon={ChurchIcon} title="Nenhuma igreja cadastrada" />
          </div>
        ) : (
          igrejas.map((i) => (
            <div key={i.id} className="list">
              <div className="list__row" style={{ background: 'var(--color-neutral-100)' }}>
                <ChurchIcon size={20} aria-hidden="true" />
                <span className="list__body list__title" style={{ fontWeight: 500 }}>
                  {i.nome}
                </span>
                {i.teste ? <span className="env-badge">Dados de teste</span> : null}
              </div>
              {i.congregacoes.length === 0 ? (
                <div className="list__row list__sub">Nenhuma congregação.</div>
              ) : (
                i.congregacoes.map((c) => {
                  const ativa = c.campanhas.find((x) => x.ativa)
                  return (
                    <div key={c.id} className="list__row" style={{ paddingLeft: 30 }}>
                      <BuildingsIcon size={18} className="list__icon" aria-hidden="true" />
                      <span className="list__body">
                        <span className="list__title">{c.nome}</span>
                        <span className="list__sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FlagBannerIcon size={14} aria-hidden="true" />
                          {ativa ? `Campanha ativa: ${ativa.nome}` : 'Sem campanha ativa'}
                        </span>
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          ))
        )}
      </section>

      <div className="form-grade" style={{ alignItems: 'start' }}>
        <form className="card card--pad stack" onSubmit={criarIgreja}>
          <h2 style={{ fontSize: 16 }}>Nova igreja</h2>
          <TextField
            label="Nome"
            value={igreja.nome}
            onChange={(e) => setIgreja((x) => ({ ...x, nome: e.target.value }))}
          />
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={igreja.teste}
              onChange={(e) => setIgreja((x) => ({ ...x, teste: e.target.checked }))}
            />
            Dados de teste (removidos na limpeza)
          </label>
          <Button type="submit" variant="secondary">
            Cadastrar igreja
          </Button>
        </form>

        <form className="card card--pad stack" onSubmit={criarCong}>
          <h2 style={{ fontSize: 16 }}>Nova congregação</h2>
          <div className="field">
            <label className="field__label" htmlFor="cg-igreja">
              Igreja
            </label>
            <select
              id="cg-igreja"
              className="input campo-select"
              value={cong.igreja || igrejas[0]?.id || ''}
              onChange={(e) => setCong((x) => ({ ...x, igreja: e.target.value }))}
            >
              {igrejas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome}
                  {i.teste ? ' (teste)' : ''}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label="Nome da congregação"
            value={cong.nome}
            onChange={(e) => setCong((x) => ({ ...x, nome: e.target.value }))}
          />
          <Button type="submit" variant="secondary" disabled={igrejas.length === 0}>
            Cadastrar congregação
          </Button>
        </form>

        <form className="card card--pad stack" onSubmit={criarCamp}>
          <h2 style={{ fontSize: 16 }}>Nova campanha</h2>
          <div className="field">
            <label className="field__label" htmlFor="cp-cong">
              Congregação
            </label>
            <select
              id="cp-cong"
              className="input campo-select"
              value={camp.cong || todasCongs[0]?.id || ''}
              onChange={(e) => setCamp((x) => ({ ...x, cong: e.target.value }))}
            >
              {todasCongs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} · {c.igreja}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label="Nome da campanha"
            value={camp.nome}
            onChange={(e) => setCamp((x) => ({ ...x, nome: e.target.value }))}
          />
          <TextField
            label="Início"
            type="date"
            value={camp.inicio}
            onChange={(e) => setCamp((x) => ({ ...x, inicio: e.target.value }))}
            hint="Uma campanha ativa por congregação."
          />
          <Button type="submit" variant="secondary" disabled={todasCongs.length === 0}>
            Cadastrar campanha
          </Button>
        </form>
      </div>
    </div>
  )
}
