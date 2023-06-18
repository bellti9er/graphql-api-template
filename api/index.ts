import Database from '../database'

import { PingDao     } from './model'
import { PingService } from './service'

type Context   = Record<string, any>
type Databases = {
  default: Database
}

class API {
  pingService: PingService

  constructor(private databases: Databases, public context: Context = {}) {
    this.pingService = new PingService(new PingDao(databases.default))
  }
}

export { API, Context, Databases }
