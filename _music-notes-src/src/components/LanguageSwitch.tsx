import { useId } from 'react'
import styled from 'styled-components'
import { useLocale, useT, type Locale } from '../i18n'

/** United Kingdom flag (Union Jack), 3:2 crop */
function FlagEN() {
  const id = useId()
  return (
    <svg viewBox="0 0 60 30" aria-hidden preserveAspectRatio="xMidYMid slice">
      <clipPath id={`${id}s`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

/** Vietnam flag: yellow star on red */
function FlagVI() {
  return (
    <svg viewBox="0 0 30 20" aria-hidden>
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15"
      />
    </svg>
  )
}

const OPTIONS: { value: Locale; code: string; name: string; Flag: () => React.ReactElement }[] = [
  { value: 'en', code: 'EN', name: 'English', Flag: FlagEN },
  { value: 'vi', code: 'VI', name: 'Tiếng Việt', Flag: FlagVI },
]

const Group = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid var(--rule);
  background: var(--card);
`

const Option = styled.button<{ $on: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 11px 4px 5px;
  border: none;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${(p) => (p.$on ? 'var(--ink)' : 'var(--ink-faint)')};
  background: ${(p) => (p.$on ? 'var(--gray-700)' : 'transparent')};
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    color: var(--ink);
  }
  svg {
    width: 22px;
    height: 15px;
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
    opacity: ${(p) => (p.$on ? 1 : 0.55)};
    transition: opacity 0.15s;
  }
  &:hover svg {
    opacity: 1;
  }
`

/** Language picker for the page's top-right corner, kept apart from the mode tabs */
export function LanguageSwitch() {
  const t = useT()
  const { locale, setLocale } = useLocale()
  return (
    <Group role="radiogroup" aria-label={t('lang.label')}>
      {OPTIONS.map(({ value, code, name, Flag }) => (
        <Option
          key={value}
          role="radio"
          aria-checked={locale === value}
          aria-label={name}
          title={name}
          $on={locale === value}
          onClick={() => setLocale(value)}
        >
          <Flag />
          {code}
        </Option>
      ))}
    </Group>
  )
}
