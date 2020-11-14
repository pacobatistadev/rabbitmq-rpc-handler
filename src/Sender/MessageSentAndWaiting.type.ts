export type MessageSentAndWaiting = {
  uuid: string,
  originalMessage: object | string
  timeoutTimerRef: NodeJS.Timeout
}