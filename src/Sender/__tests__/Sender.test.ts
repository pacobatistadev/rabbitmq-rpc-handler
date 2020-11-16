import mockAmqplib from 'amqplib'
import { Sender } from '../Sender'
import { Events } from '../../common'

describe('Sender', () => {
  let amqplibConnection: mockAmqplib.Connection
  let amqplibChannel: mockAmqplib.Channel

  beforeAll(async () => {
    amqplibConnection = await mockAmqplib.connect('')
  })

  beforeEach(async () => {
    amqplibChannel = await amqplibConnection.createChannel()
  })

  it('inits and sends the ready events', () => {
    const sender = new Sender(amqplibChannel, { queue: 'test-queue' })
    const readyPromise = new Promise((res) => {
      sender.once(Events.READY, res)
    })
    const channelInitializedPromise = new Promise((res) => {
      sender.once(Events.CHANNEL_INITIALIZED, res)
    })

    return Promise.all([
      channelInitializedPromise,
      readyPromise
    ])
  })

  it('closes properly', async () => {
    const sender = new Sender(amqplibChannel, { queue: 'test-queue' })
    await new Promise((res) => {
      sender.once(Events.READY, res)
    })

    await sender.close()
  })
})