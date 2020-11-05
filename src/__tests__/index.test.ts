import { hello } from '../index'

describe('testing tests', () => {
  it('greets', () => {
    const input = 'test';
    const expected = 'Hello, test';
    const output = hello(input)

    expect(output).toBe(expected)
  })
})