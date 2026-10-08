import styled from 'styled-components'

export const Card = styled.section`
  background: var(--card);
  border: 1px solid var(--rule);
  border-radius: 18px;
  padding: 18px 20px;
`

export const CardTitle = ({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) => (
  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 className="font-display text-lg font-semibold">{children}</h2>
    {hint && <p className="text-xs text-ink-soft">{hint}</p>}
  </div>
)

const Track = styled.div`
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--well);
  border: 1px solid var(--rule);
`

const Seg = styled.button<{ $on: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 5px 13px;
  font-size: 13px;
  font-weight: 500;
  color: ${(p) => (p.$on ? 'var(--card)' : 'var(--ink-soft)')};
  background: ${(p) => (p.$on ? 'var(--ink)' : 'transparent')};
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    color: ${(p) => (p.$on ? 'var(--card)' : 'var(--ink)')};
  }
`

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: React.ReactNode }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <Track role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <Seg
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          $on={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Seg>
      ))}
    </Track>
  )
}

const SwitchBtn = styled.button<{ $on: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--ink-soft);
  padding: 4px 0;
  .knob {
    width: 30px;
    height: 18px;
    border-radius: 999px;
    background: ${(p) => (p.$on ? 'var(--hot)' : 'var(--rule)')};
    position: relative;
    transition: background 0.15s;
  }
  .knob::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(p) => (p.$on ? '14px' : '2px')};
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--card);
    transition: left 0.15s;
  }
`

export const Switch = ({
  on,
  onChange,
  children,
}: {
  on: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
}) => (
  <SwitchBtn $on={on} role="switch" aria-checked={on} onClick={() => onChange(!on)}>
    <span className="knob" />
    {children}
  </SwitchBtn>
)

export const PillButton = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid ${(p) => (p.$primary ? 'var(--ink)' : 'var(--rule)')};
  background: ${(p) => (p.$primary ? 'var(--ink)' : 'var(--card)')};
  color: ${(p) => (p.$primary ? 'var(--card)' : 'var(--ink)')};
  transition:
    transform 0.08s,
    border-color 0.15s;
  &:hover {
    border-color: var(--ink-soft);
  }
  &:active {
    transform: scale(0.97);
  }
`
