import { Connection } from '../Connection'
import { ConnectionManager } from '../ConnectionManager'

describe('ConnectionManager', () => {
  const connectionName = 'connection-name'
  const connectionUrl = 'connection-url'

  describe('connection creation', () => {
    it('creates a connection without breaking', async () => {
      await ConnectionManager.createConenction(connectionName, connectionUrl)
    })

    it('creates and preserves the connection', async () => {
      const connection = await ConnectionManager.createConenction(connectionName, connectionUrl)
      expect(connection).toBeInstanceOf(Connection)
      expect(connection).toBe(ConnectionManager.get(connectionName))
    })

    it('replaces an already created connection', async () => {
      const connection = await ConnectionManager.createConenction(connectionName, connectionUrl)
      await ConnectionManager.createConenction(connectionName, connectionUrl)
      const connectionReplacement = ConnectionManager.get(connectionName)

      expect(connection).not.toBe(connectionReplacement)
    })
  })

  describe('connection deletion', () => {
    let connection: Connection

    beforeEach(async () => {
      connection = await ConnectionManager.createConenction(connectionName, connectionUrl)
    })

    it('closes a connection without breaking', async () => {
      const spyOnClose = jest.spyOn(connection, 'close')
      await ConnectionManager.close(connectionName)
      expect(spyOnClose).toHaveBeenCalledTimes(1)
    })

    it('deletes the conneciton after closing it', async () => {
      await ConnectionManager.close(connectionName)
      const savedConnection = ConnectionManager.get(connectionName)

      expect(savedConnection).toBeUndefined()
    })

    it('tries to close an unexisting connection without breaking', async () => {
      await ConnectionManager.close('unexisting-connection')
    })
  })
})