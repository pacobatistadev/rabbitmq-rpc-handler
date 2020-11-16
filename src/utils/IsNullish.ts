export function isNullish(input: any): boolean {
  return Object.is(input, null) || Object.is(input, undefined)
}