interface IsAllDefined<T> {
  (_?: T, ignors?: (keyof T)[]): _ is Required<T>
}

interface Init<T> {
  (ignors?: (keyof T)[]): Partial<T>
}

export type { IsAllDefined, Init }
