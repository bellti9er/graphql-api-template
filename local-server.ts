import 'dotenv/config'

import { graphqlHTTP } from 'express-graphql'
import compression     from 'compression'
import express, {
  Express,
  Request,
  Response,
  NextFunction
} from 'express'

import App, { JWTDecoded } from './app'

const startServer = async () => {
  const port: number    = (process.env.PORT! || 8080) as number
  const app: App        = await App.createInstance()
  const server: Express = express()

  await app.initialize()

  const errorHandler    = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)

    return res.status(500).send('Error: ' + err.message)
  }

  server.use(compression())
  server.use(express.json())
  server.use(errorHandler)
  server.use('/graphql', graphqlHTTP((request: Record<string, any>) => {
    return {
      schema   : app.graphQLSchema,
      graphiql : true,
      context  : { request, api : app.api }
    }
  }))

  server.listen(port, () => console.log(`🚀🚀🚀 Server Listening on port ${port} 🚀🚀🚀`))
}

startServer();