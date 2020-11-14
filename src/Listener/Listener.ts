import { EventEmitter } from 'events'
import { Channel, ConsumeMessage, Options } from 'amqplib'
import { ListenerOptions } from './ListenerOptions.type';
import { MessageResolver } from './MessageResolver.type';
import { ReplyParameters } from './ReplyParameters.type';
import { MessageHandler } from './MessageHandler.type';
import { Message, Events } from '../common'
import { serialize } from '../utils/Serialize';
import { isNullish } from '../utils/IsNullish';

export class Listener extends EventEmitter {

  constructor(
    private readonly channel: Channel,
    options: ListenerOptions
  ) {
    super()
    this.queue = options.queue
    this.channelOptions = options.channelOptions
    this.messageResolver = options.messageResolver || Listener.defaultMessageResolver
    this.init()
  }

  private isInitialized = false;
  private messageListeners: { [pattern: string]: MessageHandler } = {}

  private readonly queue: string
  private readonly channelOptions?: Options.Consume
  private readonly messageResolver: MessageResolver

  private static defaultMessageResolver: MessageResolver = (message: string) => {
    return JSON.parse(message);
  }

  private async init() {
    if (!this.isInitialized) {
      await this.channel.consume(this.queue, this.onMessage, { ...this.channelOptions });
      this.emit(Events.CHANNEL_INITIALIZED)
      this.isInitialized = true
    }
    this.emit(Events.READY)
  }

  private async onMessage(message: ConsumeMessage | null) {
    if (!message) {
      return;
    }

    let resolvedMessage: Message
    let stringRawMessage = message.content.toString()
    try {
      resolvedMessage = this.messageResolver(stringRawMessage)
      if (isNullish(resolvedMessage.message) || isNullish(resolvedMessage.pattern)) {
        throw new Error('Message malformed')
      }
    } catch(e) {
      console.warn((e as Error).message, stringRawMessage)
      this.replyMessage({
        queue: message.properties.replyTo,
        correlationId: message.properties.correlationId,
        message: { message: 'Message maformed' }
      })
      return;
    }

    try {
      const hanlderResponse = this.messageListeners[resolvedMessage.pattern](resolvedMessage.message)
      this.replyMessage({
        queue: message.properties.replyTo,
        correlationId: message.properties.correlationId,
        message: hanlderResponse
      })
    } catch (e) {
      console.warn((e as Error).message, stringRawMessage)
      this.replyMessage({
        queue: message.properties.replyTo,
        correlationId: message.properties.correlationId,
        message: { message: 'An error occurred while processing the message' }
      })
    }
  }

  private replyMessage({queue, correlationId, message}: ReplyParameters) {
    if (!queue || !correlationId) {
      return;
    }

    let serializedMessage = serialize(message)

    this.channel.sendToQueue(queue, Buffer.from(serializedMessage), {
      correlationId
    })
  }

  public listen<T>(pattern: string, handler: MessageHandler<T>) {
    if (this.messageListeners[pattern]) {
      console.warn(`The listener ${pattern} already exists and will be overrided`)
    }

    this.messageListeners[pattern] = handler
  }
}