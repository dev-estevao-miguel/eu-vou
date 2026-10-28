import { UserIcon } from '@phosphor-icons/react'

const TONES = ['accent', 'red', 'neutral', 'success'] as const

/** Iniciais das duas primeiras palavras: "Ana Clara M." → "AC". */
export function initials(name: string) {
  return name
    .replace(/\./g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Cor estável por pessoa, derivada do identificador. */
function toneFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return TONES[h % TONES.length]
}

type AvatarProps = {
  name?: string
  /** URL já autorizada (assinada) da foto de perfil; sem ela, mostra as iniciais. */
  src?: string | null
  seed?: string
  size?: number
  ring?: boolean
}

export function Avatar({ name, src, seed, size = 36, ring }: AvatarProps) {
  const tone = toneFor(seed ?? name ?? '')
  const cls = ['avatar', `avatar--${name ? tone : 'neutral'}`, ring && 'avatar--ring'].filter(Boolean).join(' ')
  const fontSize = Math.max(11, Math.round(size * 0.36))
  return (
    <span className={cls} style={{ width: size, height: size, fontSize }} aria-hidden="true">
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" />
      ) : name ? (
        initials(name)
      ) : (
        <UserIcon size={Math.round(size * 0.5)} style={{ color: 'var(--color-muted)' }} />
      )}
    </span>
  )
}
