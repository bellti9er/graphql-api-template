import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
  Context
} from 'aws-lambda';

export class AWSLambdaTester {
  private defaultHeaders = {
    "accept"        : "application/json",
    "cache-control" : "no-cache",
    "host"          : "localhost",
    "connection"    : "keep-alive"
  }

  mockApiGatewayEvent = ({
    path,
    body,
    method,
    pathParameters,
    headers,
    queryStringParameters,
    resourcePath,
    stage,
    requestContext
  } : {
    path?                  : string,
    body?                  : string | object,
    method?                : string,
    pathParameters?        : { [name: string] : string },
    headers?               : { [name: string] : string },
    queryStringParameters? : { [name: string] : string },
    resourcePath?          : string,
    stage?                 : string,
    requestContext?        : APIGatewayEventRequestContext
  }): APIGatewayProxyEvent => {
    const requestPath    = path ? path : "/graphql"
    const requestHeaders = !!headers ? Object.assign(this.defaultHeaders, headers) : this.defaultHeaders
    
    return {
      path                            : requestPath,
      body                            : !!body ? body : null,
      headers                         : requestHeaders,
      multiValueHeaders               : {},
      httpMethod                      : !!method ? method : "GET",
      isBase64Encoded                 : false,
      pathParameters                  : !!pathParameters ? pathParameters : null,
      queryStringParameters           : !!queryStringParameters ? queryStringParameters : null,
      multiValueQueryStringParameters : null,
      stageVariables                  : null,
      requestContext                  : requestContext,
      resource                        : "resource"
    } as APIGatewayProxyEvent
  }

  mockLambdaContext = (): Context => {
    const runTime = new Date().getTime()
    const timeout = 60 * 1000

    return {
      callbackWaitsForEmptyEventLoop : false,
      functionName                   : "mockFunctionName",
      functionVersion                : "",
      invokedFunctionArn             : "arn",
      memoryLimitInMB                : "128",
      awsRequestId                   : "mockRequestId",
      logGroupName                   : "mockLogGroup",
      logStreamName                  : "mockLogStream",
      getRemainingTimeInMillis       : () => timeout - (new Date().getTime() - runTime),
      succeed                        : messageOrObject => { return }
    } as Context
  }
}