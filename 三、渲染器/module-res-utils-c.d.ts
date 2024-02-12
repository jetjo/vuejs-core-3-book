interface getConfFromJson<T> {
  (arg: { url: string; key?: string }): Promise<T>
}

export type { getConfFromJson }
