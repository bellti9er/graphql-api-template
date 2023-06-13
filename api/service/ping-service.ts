import { PingDao } from '../model'

export default class PingService {
  constructor(private pingDao: PingDao) { }

  async ping() {
    return this.pingDao.ping()
  }
}