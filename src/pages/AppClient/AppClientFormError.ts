export interface AppClientFormError {
  validation?: Partial<{
    name?: string,
  }>,
  general?: string
}