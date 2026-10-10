export type Quote = { id: string; text: string; author: string; custom?: boolean }

// Short public-domain lines to write by hand. Your own quotes are added from the app.
export const BUILT_IN_QUOTES: Quote[] = [
  { id: 'pliny', text: 'Nulla dies sine linea. No day without a line.', author: 'Pliny the Elder' },
  { id: 'plato', text: 'The beginning is the most important part of the work.', author: 'Plato' },
  { id: 'franklin', text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { id: 'emerson', text: 'Write it on your heart that every day is the best day in the year.', author: 'Ralph Waldo Emerson' },
  { id: 'thoreau', text: 'Go confidently in the direction of your dreams. Live the life you have imagined.', author: 'Henry David Thoreau' },
  { id: 'wordsworth', text: 'Fill your paper with the breathings of your heart.', author: 'William Wordsworth' },
  { id: 'penn', text: 'Patience and diligence, like faith, remove mountains.', author: 'William Penn' },
  { id: 'seneca', text: 'While we teach, we learn.', author: 'Seneca' },
  { id: 'aurelius', text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius' },
  { id: 'proverb', text: 'Little by little, one travels far.', author: 'Proverb' },
]
