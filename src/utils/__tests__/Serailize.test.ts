import { serialize } from '../Serialize'

describe('Serialize', () => {
  it('stringifies objects', () => {
    const input = {}
    const expected = '{}'
    const output = serialize(input)

    expect(output).toBe(expected)
  })

  it('stringifies arrays', () => {
    const input: any = []
    const expected = '[]'
    const output = serialize(input)

    expect(output).toBe(expected)
  })

  it('returns strings as is', () => {
    const input = 'test-string'
    const expected = 'test-string'
    const output = serialize(input)

    expect(output).toBe(expected)
  })
  
  it('converts numbers to strings', () => {
    const input = 5
    const expected = '5'
    const output = serialize(input)

    expect(output).toBe(expected)
  })
})