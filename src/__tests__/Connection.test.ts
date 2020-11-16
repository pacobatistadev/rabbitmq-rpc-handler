import mockAmqplib from 'amqplib'
import { Connection } from '../Connection'
import { Listener } from '../Listener';
import { Sender } from '../Sender';

describe('Connection', () => {
  let amqplibConnection: mockAmqplib.Connection;

  beforeEach(async () => {
    amqplibConnection = await mockAmqplib.connect('')
  })

  it('builds a connection without breaking', async () => {
    new Connection(amqplibConnection)
  })

  it('closes the amqplib connection on close()', async () => {
    const connection = new Connection(amqplibConnection)
    const spy = jest.spyOn(amqplibConnection, 'close')

    await connection.close()
    expect(spy).toHaveBeenCalled()
  })

  describe('sender handlers', () => {
    let connection: Connection

    beforeAll(() => {
      connection = new Connection(amqplibConnection)
    })

    it('creates a sender', async () => {
      const sender = await connection.createSender({ queue: 'test-queue' })
      expect(sender).toBeInstanceOf(Sender)
    })

    it('stores an already created sender', async () => {
      const sender = await connection.createSender({ queue: 'test-stored' })
      const storedSender = connection.getSender('test-stored')

      expect(sender).toBe(storedSender)
    })
  })

  describe('listener handlers', () => {
    let connection: Connection

    beforeAll(() => {
      connection = new Connection(amqplibConnection)
    })

    it('creates a sender', async () => {
      const listener = await connection.createListener({ queue: 'test-queue' })
      expect(listener).toBeInstanceOf(Listener)
    })

    it('stores an already created listener', async () => {
      const listener = await connection.createListener({ queue: 'test-stored' })
      const storedListener = connection.getListener('test-stored')

      expect(listener).toBe(storedListener)
    })
  })
})
