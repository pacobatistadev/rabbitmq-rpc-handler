import { Options } from "amqplib";

export type SenderOptions = {
  queue: string,
  channelOptions?: Options.Consume,
  messageAdapter?: (pattern: string, message: string | object) => string | object;
  requestTimeout?: number
}