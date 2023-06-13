import { KMS, RDS }       from 'aws-sdk'
import { API, Databases } from './api'
import { buildSchema }    from 'type-graphql'
import { GraphQLSchema }  from 'graphql'
import { JwtPayload }     from 'jsonwebtoken'
import {
  getConnection,
  createConnection,
  Connection,
  ConnectionOptions
} from 'typeorm'

import Database from './database'

type NonEmptyStringArray = [string, ...string[]]
type GraphQLOptions      = {
  resolverPath?   : NonEmptyStringArray,
  schemaFilePath? : string
}

export type Context = Record<string, any>
export interface JWTDecoded extends JwtPayload {
  userId: number
}

export default class App {
  static DEFAULT_RESOLVER_PATH: NonEmptyStringArray = [`${__dirname}/schema/*.{ts,js}`]
  static DEFAULT_SCHEMA_FILE_PATH: string           = "dist/schema.gql"

  graphQLSchema!           : GraphQLSchema
  api!                     : API
  kms!                     : KMS
  jwt_secret_key!          : string
  private static _instance : App
  private _initialized     : boolean
  private _databases!      : Databases

  private constructor(private graphQLOptions: GraphQLOptions = {}) {
    this._initialized = false
    this.kms          = new KMS()
  }

  async initialize() {
    try {
      if (!this._initialized) {
        console.log("Initializing App . . .")

        this.graphQLSchema  = await buildSchema({ resolvers: (this.graphQLOptions.resolverPath || App.DEFAULT_RESOLVER_PATH) })
        this.jwt_secret_key = await this.decrypt(process.env.JWT_SECRET_KEY!)
        this._databases     = await this.getDatabases()
        this.api            = await this.createApi()
        this._initialized   = true

        return this
      }
    } catch(err) {
      console.error("Create App instance failed: ", err)
      throw err
    }
  }

  static createInstance(graphQLOptions: GraphQLOptions = {}) {
    return App._instance || (App._instance = new App())
  }

  async close() {
    await Promise.all([
      this._databases.default.close()
    ])
  }

  private createApi = async () => {
    const context = {
      configs : {
        JWT_SECRET_KEY : await this.decrypt(process.env.JWT_SECRET_KEY!),
        allowedhosts   : process.env.ALLOWED_HOSTS!.split(',')
      }
    }
    
    return new API(this._databases, context)
  }

  private async getDatabases() {
    const dbOptions = await this.getDBOptions()

    const DB_NAMES = [
      { name: "default", env: process.env.DB_NAME },
    ]

    const databases: { [key: string]: Database } = {}

    for (const { name, env } of DB_NAMES) {
      const dbName              = env!
      const dbConnectionOptions = this.createConnectionOptions(name, { dbName, ...dbOptions })

      try {
        const connection = getConnection(name)
        if (!connection.isConnected) await connection.connect()
        databases[name] = new Database(connection)
      } catch {
        const connection = await createConnection(dbConnectionOptions)
        databases[name]  = new Database(connection)
      }
    }

    return databases as Databases
  }

  private createConnectionOptions(
    name      : string,
    dbOptions : {
      dbName       : string,
      dbHost?      : string,
      dbProxyHost? : string,
      port         : number,
      username     : string,
      password?    : string,
      awsRegion    : string
    }) {
    const {
      dbName,
      dbHost,
      dbProxyHost,
      port,
      username,
      password,
      awsRegion
    } = dbOptions

    if (dbProxyHost) {
      const signer = new RDS.Signer({
        region   : awsRegion,
        hostname : dbProxyHost,
        port     : port,
        username : username
      })

      return {
        name     : name,
        database : dbName,
        type     : "mysql",
        host     : dbProxyHost,
        port     : port,
        username : username,
        ssl      : "Amazon RDS",
        extra    : {
          connectionLimit : 15,
          authPlugins     : { mysql_clear_password: () => () => signer.getAuthToken({}) }
        }
      } as ConnectionOptions
    } else {
      return {
        name     : name,
        database : dbName,
        type     : "mysql",
        host     : dbHost,
        port     : port,
        username : username,
        password : password,
        extra    : { "connectionLimit": 15 }
      } as ConnectionOptions
    }
  }

  private async getDBOptions() {
    const [
      DB_PROXY_HOST,
      DB_HOST,
      DB_USER,
      DB_PASSWORD,
      DB_PORT,
      AWS_REGION
    ] = await Promise.all([
      this.decrypt(process.env.DB_PROXY_HOST!),
      this.decrypt(process.env.DB_HOST!),
      this.decrypt(process.env.DB_USER!),
      this.decrypt(process.env.DB_PASSWORD!),
      this.decrypt(process.env.DB_PORT!),
      this.decrypt(process.env.REGION!),
    ])

    return {
      dbHost      : DB_HOST,
      dbProxyHost : DB_PROXY_HOST,
      port        : parseInt(DB_PORT!),
      username    : DB_USER,
      password    : DB_PASSWORD,
      awsRegion   : AWS_REGION
    }
  }

  private decrypt = async (encrypted: string) => {
    if (process.env.STAGE === 'DEV') return encrypted

    const decrypted = await this.kms.decrypt({ CiphertextBlob: Buffer.from(encrypted, 'base64') }).promise()

    return decrypted.Plaintext!.toString('utf-8').trim()
  }
}