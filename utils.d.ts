interface RunWithRecord {
  <O, F>(
    factory: Factory<O, F>,
    options?: O,
    getDiff?: GetDiff<O>
  ): { result: F; diff: Partial<O> }
}

interface GetDiff<O> {
  (OldOptions: O, options: O): Partial<O> | undefined
}

interface Factory<Opts, Func> {
  (options: Opts): Func
}
