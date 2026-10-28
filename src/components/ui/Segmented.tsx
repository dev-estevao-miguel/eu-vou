import type { ReactNode } from 'react'

type Option<T extends string> = { value: T; label: ReactNode; icon?: ReactNode }

type SegmentedProps<T extends string> = {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** Abas segmentadas (ex.: Lista / Calendário; Geral / Adolescentes / Jovens). */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="segmented">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={opt.value === value}
          className="segmented__opt"
          onClick={() => onChange(opt.value)}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

type ChipsProps<T extends string> = {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** Chips de filtro com seleção única. */
export function Chips<T extends string>({ label, options, value, onChange }: ChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className="chips">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="chip"
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
