export function serialize(input: any): string {
  if (typeof input === 'object') {
    return JSON.stringify(input)
  } else {
    return input.toString()
  }
}