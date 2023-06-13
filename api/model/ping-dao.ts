import Database  from '../../database'
import BaseModel from './base-model'

export class Ping implements BaseModel {
  constructor(private pong: string) { }
}

export class PingDao {
  constructor(private db: Database) { }

  async ping() {
    return new Ping("pong")
  }
}