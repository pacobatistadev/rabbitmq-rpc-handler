import { EventEmitter } from 'events'
import { Channel, ConsumeMessage, Options } from 'amqplib';
import { v4 as generateUUID } from 'uuid'

import { MessageSentAndWaiting } from './MessageSentAndWaiting.type'
import { SenderOptions } from './SenderOptions.type'
import { Events } from '../common'

export class Sender extends EventEmitter {
  constructor(
    private readonly channel: Channel,
    options: SenderOptions
  ) {
    super();
    this.queue = options.queue;
    this.adaptMessage = options.messageAdapter || Sender.defaultMessageAdapter
    this.requestTimeout = options.requestTimeout ?? 15000
    this.channelOptions = options.channelOptions
    this.init()
  }

  private isInitialized = false;
  private eventListener?: EventEmitter
  private messagesSent: { [uuid: string]: MessageSentAndWaiting } = {}

  private readonly queue: string
  private readonly adaptMessage: (pattern: string, message: string | object) => string | object
  private readonly requestTimeout: number
  private readonly channelOptions: Options.Consume | undefined

  public get amqplibChannel() {
    return this.channel
  }

  private async init() {
    if (!this.isInitialized) {
      await this.channel.assertQueue('amq.rabbitmq.reply-to');
      await this.channel.consume('amq.rabbitmq.reply-to', this.onMessage, { ...this.channelOptions, noAck: true });
      this.emit(Events.CHANNEL_INITIALIZED)
      this.eventListener = new EventEmitter();
      this.isInitialized = true
    }
    this.emit(Events.READY)
  }

  // Default adapter
  private static defaultMessageAdapter = (pattern: string, message: string | object) => {
    return {
      pattern,
      message
    }
  }

  // Message handlers
  private onMessage(message: ConsumeMessage | null) {
    if (!message) {
      return;
    }

    const correlationId = String(message.properties.correlationId) || '';
    let finalMessage: string | object

    const parsedMessage = Buffer.from(message.content).toString();
    try {
      finalMessage = JSON.parse(parsedMessage);
    } catch {
      finalMessage = parsedMessage;
    }

    this.eventListener?.emit(correlationId, finalMessage)
  }

  private handleTimeout(uuid: string) {
    // const messageSent = this.messagesSent[uuid];
    console.warn('Message timed out')
    delete this.messagesSent[uuid];
  }

  private handleResponse(uuid: string, message: string | object) {
    const messageSent = this.messagesSent[uuid];
    if (!messageSent) {
      console.warn('The correlation ID does not exists')
      return;
    }
    clearTimeout(messageSent.timeoutTimerRef)
    delete this.messagesSent[uuid];
  }

  // Main method
  async send(pattern: string, message: string | object, requiresResponse = true) {
    const correlationId = generateUUID();
    const adaptedMessage = this.adaptMessage(pattern, message)
    let stringifiedMessage: string

    if (typeof adaptedMessage === 'object') {
      stringifiedMessage = JSON.stringify(adaptedMessage)
    } else {
      stringifiedMessage = adaptedMessage
    }

    this.channel.sendToQueue(this.queue, Buffer.from(stringifiedMessage), {
      correlationId,
      replyTo: 'amq.rabbitmq.reply-to',
    })

    if (!requiresResponse) {
      return Promise.resolve()
    }
    // Create the promise that handles the response
    const promise = new Promise<string | object>((resolve, reject) => {

      // Register the timeout handling
      const timeoutTimerRef = setTimeout(() => {
        this.handleTimeout(correlationId)
        reject('Timed out')
      }, this.requestTimeout)

      // Register the response handling
      this.eventListener?.once(correlationId, (response: string | object) => {
        this.handleResponse(correlationId, response)
        resolve(response)
      })

      // Stores the message for async handling
      this.messagesSent[correlationId] = {
        uuid: correlationId,
        originalMessage: message,
        timeoutTimerRef,
      }
    })

    return promise;
  }

  async close() {
    await this.channel.close();
    this.emit(Events.CHANNEL_CLOSED)
    this.eventListener?.removeAllListeners();
    this.eventListener = undefined;
    this.emit(Events.CLOSED)
  }
}