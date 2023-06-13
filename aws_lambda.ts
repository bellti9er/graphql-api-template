import { graphql } from 'graphql'
import { 
  Context as LambdaContext, 
  APIGatewayProxyResult, 
  APIGatewayEvent 
} from 'aws-lambda'

import App, { JWTDecoded } from './app'

const headers = (origin: string) => {
  return {
    'Content-Type'                 : 'application/json',
    'Access-Control-Allow-Origin'  : origin,
    'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers' : 'Accept, Content-Type, Content-Length, Accept-Encoding, Authorization',
    'X-Frame-Options'              : 'DENY'
  }
}

/*****************************************************************
** Lambda Handler
*****************************************************************/
console.log('Initializing Lambda Handler & API Context')

const app = App.createInstance()

export const handler = async (event: APIGatewayEvent, context: LambdaContext): Promise<APIGatewayProxyResult> => {
  const origin = event?.headers?.Origin || event?.headers?.origin!

  await app.initialize()

  if(!app.api.context.configs.allowedhosts.includes(origin)) {
    return { statusCode: 401, body: '' }
  }

  const corsEnabledHeaders = headers(origin)

  if(event.httpMethod === 'OPTIONS') {
    return {
      statusCode : 200,
      headers    : corsEnabledHeaders,
      body       : JSON.stringify({ message: 'This was a preflight call.' })
    }
  }

  const response = await graphql({
    schema : app.graphQLSchema,
    source : JSON.parse(event.body!).query || JSON.parse(event.body!).mutation,
    variableValues : JSON.parse(event.body!).variables,
    rootValue : {},
    contextValue : {
      request : event,
      api     : app.api
    }
  })

  return {
    statusCode : 200,
    headers    : corsEnabledHeaders,
    body       : JSON.stringify(response)
  }
}