// Marca provisória do Lote 1: o V de "Vou" (também lido como confirmação)
// com o ponto vermelho da pessoa que chega. Não usa o brasão da IEADPE.

type MarkProps = {
  size?: number
  /** Monocromática sobre fundo de marca, ou só traço sobre fundo claro. */
  variant?: 'color' | 'mono-light' | 'mono-dark'
}

export function LogoSymbol({ size = 28, variant = 'color' }: MarkProps) {
  const stroke = variant === 'mono-dark' ? 'var(--color-text)' : 'var(--color-bg)'
  const dot = variant === 'color' ? 'var(--color-red)' : stroke
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M7 11 L16 24 L25 11"
        fill="none"
        stroke={stroke}
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="7.5" r="3" fill={dot} />
    </svg>
  )
}

/** Símbolo dentro do quadrado arredondado da marca. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: 'var(--color-brand)',
        display: 'grid',
        placeItems: 'center',
        flex: 'none',
      }}
    >
      <LogoSymbol size={Math.round(size * 0.63)} />
    </span>
  )
}

export function LogoCompact({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <LogoMark size={size} />
      <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-brand)', letterSpacing: '-0.01em' }}>
        Eu Vou
      </span>
    </span>
  )
}

export function LogoHorizontal({ tagline = 'Presença que aproxima' }: { tagline?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={44} />
      <span>
        <span
          style={{
            display: 'block',
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--color-brand)',
            lineHeight: 1.1,
          }}
        >
          Eu Vou
        </span>
        <span style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)' }}>{tagline}</span>
      </span>
    </span>
  )
}
