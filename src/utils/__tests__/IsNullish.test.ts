import { isNullish } from '../IsNullish'

describe('isNullish', () => {

  describe('nullish values', () => {

    it('returns true when null is passed', () => {
      const input = null
      const expected = true
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns true when undefined is passed', () => {
      const input = undefined
      const expected = true
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

  })

  describe('falsy values (except null and undefined)', () => {

    it('returns false when false is passed', () => {
      const input = false
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when 0 is passed', () => {
      const input = 0
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when \'\' is passed', () => {
      const input = ''
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when NaN is passed', () => {
      const input = NaN
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when bigint 0 is passed', () => {
      const input = BigInt(0)
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })
  })

  describe('truthy values', () => {

    it('returns false when non 0 number is passed', () => {
      const input = 1
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when non empty string is passed', () => {
      const input = ' '
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when true is passed', () => {
      const input = true
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when empty array is passed', () => {
      const input: any = []
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when empty object is passed', () => {
      const input = {}
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })

    it('returns false when bigint other than 0 is passed', () => {
      const input = BigInt(1)
      const expected = false
      const output = isNullish(input)

      expect(output).toBe(expected)
    })
  })
})