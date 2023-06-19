import { TestClient      } from "./test-client"
import { AWSLambdaTester } from "./aws-lambda-tester";

module.exports = async function() {
  process.env.STAGE       = 'DEV'
  process.env.TZ          = 'UTC';
  process.env.DB_HOST     = process.env.TEST_DB_HOST
  process.env.DB_USER     = process.env.TEST_DB_USER
  process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD
  process.env.DB_PORT     = process.env.TEST_DB_PORT
  process.env.DB_NAME     = process.env.TEST_DB_NAME

  const testClient = TestClient.instance
  await testClient.setUp()

  globalThis.testClient      = testClient
  globalThis.awsLambdaTester = new AWSLambdaTester()
}