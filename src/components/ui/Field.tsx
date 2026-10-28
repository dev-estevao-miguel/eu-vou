import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { CircleIcon, EyeIcon, EyeSlashIcon, RadioButtonIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { IconButton } from './Button'

type FieldShellProps = {
  id: string
  label: ReactNode
  optional?: boolean
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

function FieldShell({ id, label, optional, hint, error, children, footer }: FieldShellProps) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {optional ? <span className="field__optional"> (opcional)</span> : null}
      </label>
      {children}
      {error ? (
        <div id={`${id}-error`} className="field__error">
          <WarningCircleIcon size={16} aria-hidden="true" />
          {error}
        </div>
      ) : hint ? (
        <div id={`${id}-hint`} className="field__hint">
          {hint}
        </div>
      ) : null}
      {footer}
    </div>
  )
}

function describedBy(id: string, hint?: ReactNode, error?: ReactNode) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  label: ReactNode
  optional?: boolean
  hint?: ReactNode
  error?: ReactNode
}

export function TextField({ label, optional, hint, error, className, ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <input
        id={id}
        className={['input', className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </FieldShell>
  )
}

export function PasswordField({ label, optional, hint, error, className, ...rest }: Omit<TextFieldProps, 'type'>) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <div className="field__control">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={['input input--with-action', className].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...rest}
        />
        <IconButton
          className="field__action"
          label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeSlashIcon size={22} /> : <EyeIcon size={22} />}
        </IconButton>
      </div>
    </FieldShell>
  )
}

type TextAreaProps = Omit<ComponentProps<'textarea'>, 'id'> & {
  label: ReactNode
  optional?: boolean
  hint?: ReactNode
  error?: ReactNode
}

export function TextArea({ label, optional, hint, error, className, maxLength, value, ...rest }: TextAreaProps) {
  const id = useId()
  const length = typeof value === 'string' ? value.length : 0
  return (
    <FieldShell
      id={id}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      footer={
        maxLength ? (
          <div className="field__counter" aria-hidden="true">
            {length}/{maxLength}
          </div>
        ) : null
      }
    >
      <textarea
        id={id}
        className={['input', className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        maxLength={maxLength}
        value={value}
        {...rest}
      />
    </FieldShell>
  )
}

type ChoiceOption<T extends string> = { value: T; label: ReactNode }

type ChoiceGroupProps<T extends string> = {
  legend: ReactNode
  name: string
  options: ChoiceOption<T>[]
  value: T | null
  onChange: (value: T) => void
  hint?: ReactNode
  error?: ReactNode
  disabled?: boolean
}

/** Cartões de opção única — usado no seletor de grupo (Adolescente / Jovem). */
export function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  hint,
  error,
  disabled,
}: ChoiceGroupProps<T>) {
  const id = useId()
  return (
    <fieldset className="choice-group" aria-describedby={describedBy(id, hint, error)} disabled={disabled}>
      <legend className="field__label" style={{ padding: 0, marginBottom: 6 }}>
        {legend}
      </legend>
      <div className="choice-group__options">
        {options.map((opt) => {
          const checked = opt.value === value
          return (
            <label key={opt.value} className="choice">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
              />
              <span className="choice__icon" aria-hidden="true">
                {checked ? <RadioButtonIcon size={20} weight="fill" /> : <CircleIcon size={20} />}
              </span>
              {opt.label}
            </label>
          )
        })}
      </div>
      {error ? (
        <div id={`${id}-error`} className="field__error">
          <WarningCircleIcon size={16} aria-hidden="true" />
          {error}
        </div>
      ) : hint ? (
        <div id={`${id}-hint`} className="field__hint">
          {hint}
        </div>
      ) : null}
    </fieldset>
  )
}
