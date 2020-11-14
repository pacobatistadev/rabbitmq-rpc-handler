import amqplib from 'amqplib'
import { Connection } from './Connection';

export class ConnectionManager {
  private static connections: { [connectionName: string]: Connection } = {}

  static async createConenction(connectionName: string, ...amqpOptions: Parameters<typeof amqplib.connect>) {
    const amqplibConnection = await amqplib.connect(...amqpOptions)

    const connection = new Connection(amqplibConnection);
    return ConnectionManager.connections[connectionName] = connection;
  }

  static get(connectionName: string) {
    return ConnectionManager.connections[connectionName];
  }

  static async close(connectionName: string) {
    const connection = ConnectionManager.connections[connectionName];
    if (connection) {
      await connection.close();
      delete ConnectionManager.connections[connectionName];
    } else { 
      console.warn(`The connection ${connectionName} doesn't exist`)
    }
  }

  private constructor() { }
}