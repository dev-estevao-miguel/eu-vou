import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'danger-solid' | 'text' | 'text-danger' | 'on-brand'

type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant
  /** sm = 44 px (padrão) · md = 48 px · lg = 52 px (ação principal fixa no rodapé) */
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'sm',
  block,
  loading,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = ['btn', `btn--${variant}`, size !== 'sm' && `btn--${size}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : icon}
      {children}
    </button>
  )
}

type IconButtonProps = ComponentProps<'button'> & {
  /** Rótulo acessível obrigatório: o botão só mostra um ícone. */
  label: string
  badge?: number
}

export function IconButton({ label, badge, className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} className={['icon-btn', className].filter(Boolean).join(' ')} {...rest}>
      {children}
      {badge ? (
        <span className="icon-btn__badge" aria-hidden="true">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  )
}
