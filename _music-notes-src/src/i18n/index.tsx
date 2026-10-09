import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { IntlProvider, useIntl } from 'react-intl'
import { en, type MessageId } from './en'
import { vi } from './vi'

export type Locale = 'en' | 'vi'
const MESSAGES: Record<Locale, Record<MessageId, string>> = { en, vi }
const KEY = 'note-map:locale'

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'vi') return saved
  } catch {
    // Storage blocked: fall through to the browser language
  }
  return navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: 'en',
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      // Not critical — the choice just won't be remembered
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = MESSAGES[locale]['app.docTitle']
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])
  return (
    <LocaleContext.Provider value={value}>
      <IntlProvider locale={locale} messages={MESSAGES[locale]} defaultLocale="en">
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)

export type Values = Record<string, string | number>
export type T = (id: MessageId, values?: Values) => string

/** Short translate function, for components and for the plain helpers they call */
export function useT(): T {
  const intl = useIntl()
  return useCallback((id: MessageId, values?: Values) => intl.formatMessage({ id }, values), [intl])
}
