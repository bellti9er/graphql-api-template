import 'dotenv/config'

import { Express                      } from 'express'
import { Connection, createConnection } from 'typeorm'

import Database  from '../database'

export class TestClient {

  private static _instance : TestClient
  private _connection!     : Connection
  private _database!       : Database

  private constructor() { }

  static get instance(): TestClient {
    return TestClient._instance || (TestClient._instance = new TestClient())
  }

  get database(): Database {
    return this._database
  }

  get connection(): Connection {
    return this._connection
  }

  async setUp() {
    this._connection = await createConnection({
      type     : 'mysql',
      host     : process.env.TEST_DB_HOST!,
      port     : (process.env.TEST_DB_PORT! || 3306) as number,
      username : process.env.TEST_DB_USER!,
      password : process.env.TEST_DB_PASSWORD!,
      database : process.env.TEST_DB_NAME!
    })

    return this._database = new Database(this._connection)
  }

  async tearDown() {
    return this._connection.close()
  }

  async truncateTables(tables: string[]) {
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS=0');

      for(let table of tables) {
        await queryRunner.query(`TRUNCATE table ${table}`);
      }

      await queryRunner.query('SET FOREIGN_KEY_CHECKS=1');
      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async query(query: string) {
    const result = await this._database.query(query)

    return result.fetchOne()
  }

  async queryAll(query: string) {
    const result = await this._database.query(query)

    return result.fetchAll()
  }

}