import amqplib, { Options } from 'amqplib'
import { Listener, ListenerOptions } from './Listener';
import { Sender, SenderOptions } from './Sender';

export class Connection {
  constructor(
    private connection: amqplib.Connection
  ) { }

  private senders: { [queue: string]: Sender } = {}
  private listeners: { [queue: string]: Listener } = {}

  async close(): Promise<void> {
    return this.connection?.close();
  }

  getSender(queue: string): Sender | undefined {
    return this.senders[queue];
  }

  getListener(queue: string): Listener | undefined {
    return this.listeners[queue];
  }

  async createSender(options: SenderOptions) {
    const channel = await this.connection.createChannel();
    const sender = new Sender(channel, options);

    this.senders[options.queue] = sender
    return this.senders[options.queue];
  }

  async createListener(options: ListenerOptions, assertOptions?: Options.AssertQueue) {
    const channel = await this.connection.createChannel()
    await channel.assertQueue(options.queue, assertOptions);

    this.listeners[options.queue] = new Listener(channel, options)
    return this.listeners[options.queue];
  }
}