import App                          from '../../app'
import { handler as lambdaHandler } from '../../aws_lambda'
import { Fixture                  } from '../fixtures'

describe('🚧 Ping API 🚧', () => {
  beforeEach(async () => { })
  afterEach(async  () => { })

  beforeAll(async () => { })
  afterAll(async  () => { await App.createInstance().close() })

  describe('🛠️ Query Ping 🛠️', () => {
    describe('✅ 정상적인 경우 ✅', () => {
      test('👉 ping query를 호출 했을 때, pong 메세지를 확인할 수 있다.', async () => {
        const query = {
          query : `{
            ping {
              pong
            }
          }`
        }

        const mockEvent = await awsLambdaTester.mockApiGatewayEvent({
          body : JSON.stringify(query),
          headers : { Origin : "https://belltiger.dev" }
        })
        const response = await lambdaHandler(mockEvent, awsLambdaTester.mockLambdaContext())
        const expected = {
          data : {
            ping : {
              pong : "pong"
            }
          }
        }

        expect(response).toEqual({
          statusCode : 200,
          body       : JSON.stringify(expected),
          headers    : Fixture.defaultHeader
        })
      })
    })

    describe('⛔️ 예외적인 경우 ⛔️', () => {
      test('👉 허용되지 않은 호스트로 요청이 들어왔을 때, 401 응답 코드를 확인할 수 있다.', async () => {
        const query = {
          query : `{
            ping {
              pong
            }
          }`
        }

        const mockEvent = await awsLambdaTester.mockApiGatewayEvent({
          body : JSON.stringify(query),
          headers : { Origin : "https://disallowedhosts.com" }
        })
        const response = await lambdaHandler(mockEvent, awsLambdaTester.mockLambdaContext())

        expect(response.statusCode).toEqual(401)
      })
    })
  })
})