import App                          from '../../app'
import { handler as lambdaHandler } from '../../aws_lambda'
import { ErrorMessages            } from '../../api/model'
import { Fixture                  } from '../fixtures'
import { APIGatewayProxyResult    } from 'aws-lambda'

describe('🚧 JWT 🚧', () => {
  beforeEach(async () => { })
  afterEach(async  () => { })

  beforeAll(async () => { })
  afterAll(async  () => { await App.createInstance().close() })

  describe('🛠️ JWT Token Decoding 🛠️', () => {

    const userId         = 1
    const query          = { "query" : "{ ping { pong }}" }
    const loggedInQuery  = { "query" : "{ loggedInPing { pong }}" }
    const invalidToken   = "INVALID TOKEN"

    describe('✅ 정상적인 경우 ✅', () => {
      test('👉 JWT Token을 가지고 로그인이 필요한 query 혹은 mutation 요청시 올바르게 응답을 받을 수 있다.', async () => {
        const jwtToken  = await Fixture.generateAuthToken(userId)
        const mockEvent = await awsLambdaTester.mockApiGatewayEvent({
          body    : JSON.stringify(loggedInQuery),
          headers : { Origin : "https://belltiger.dev", Authorization: jwtToken }
        })
        const response = await lambdaHandler(mockEvent, awsLambdaTester.mockLambdaContext()) as APIGatewayProxyResult

        expect(response).toEqual({
          statusCode : 200,
          body       : JSON.stringify({ data: { loggedInPing : { pong : "pong" } } }),
          headers    : Fixture.defaultHeader
        })
      })
    })

    describe('⛔️ 예외적인 경우 ⛔️', () => {
      test('👉 만료된 JWT Token을 가지고 로그인이 필요한 query 혹은 mutation 요청시 에러를 리턴받는다.', async () => {
        const expiredJwtToken  = await Fixture.generateAuthToken(userId, -1)
        const mockEvent        = await awsLambdaTester.mockApiGatewayEvent({
          body    : JSON.stringify(loggedInQuery),
          headers : { Origin : "https://belltiger.dev", Authorization: expiredJwtToken }
        })
        const response = await lambdaHandler(mockEvent, awsLambdaTester.mockLambdaContext()) as APIGatewayProxyResult

        expect(JSON.parse(response.body).data).toEqual(null)
        expect(JSON.parse(response.body).errors[0].message).toEqual(ErrorMessages.Login.NOT_AUTHORIZED)
      })

      test('👉 잘못된 JWT Token을 가지고 로그인이 필요한 query 혹은 mutation 요청시 에러를 리턴받는다.', async () => {
        const mockEvent = await awsLambdaTester.mockApiGatewayEvent({
          body    : JSON.stringify(loggedInQuery),
          headers : { Origin : "https://belltiger.dev", Authorization: invalidToken }
        })
        const response = await lambdaHandler(mockEvent, awsLambdaTester.mockLambdaContext()) as APIGatewayProxyResult

        expect(JSON.parse(response.body).data).toEqual(null)
        expect(JSON.parse(response.body).errors[0].message).toEqual(ErrorMessages.Login.NOT_AUTHORIZED)
      })

      test('👉 잘못된 JWT Token을 가지고 로그인이 필요하지 않는 query 혹은 mutation 요청시 올바르게 응답을 받을 수 있다.', async () => {
        const mockEvent = await awsLambdaTester.mockApiGatewayEvent({
          body    : JSON.stringify(query),
          headers : { Origin : "https://belltiger.dev", Authorization: invalidToken }
        })
        const response = await lambdaHandler(mockEvent, awsLambdaTester.mockLambdaContext()) as APIGatewayProxyResult

        expect(response).toEqual({
          statusCode : 200,
          body       : JSON.stringify({ data: { ping : { pong : "pong" } } }),
          headers    : Fixture.defaultHeader
        })
      })
    })
  })
})