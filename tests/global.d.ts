import { TestClient      } from "./test-client"
import { AWSLambdaTester } from "./aws-lambda-tester"

export declare global {
  var testClient      : TestClient
  var awsLambdaTester : AWSLambdaTester
}