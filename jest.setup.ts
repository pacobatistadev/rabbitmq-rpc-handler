const mockAmqplib = require('mock-amqplib')

jest.mock('amqplib', () => mockAmqplib)