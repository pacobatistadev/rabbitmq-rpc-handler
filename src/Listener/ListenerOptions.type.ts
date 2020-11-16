import { Options } from "amqplib";
import { MessageResolver } from "./MessageResolver.type";

export type ListenerOptions = {
  queue: string,
  messageResolver?: MessageResolver,
  channelOptions?: Options.Consume
}