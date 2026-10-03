export type Mark = 'selected' | 'related' | 'wrong' | 'answer' | undefined
export type MarkFn = (midi: number) => Mark
