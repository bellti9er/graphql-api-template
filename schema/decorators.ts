import jwt                       from "jsonwebtoken";
import { createMethodDecorator } from "type-graphql";

import { Context, JWTDecoded } from "../app";
import { ErrorMessages }       from "../api/model";

export function LoginRequired() {
  return createMethodDecorator(({ context }, next) => {
    const requestHeaders = (context as Context).request.headers;
    const accessToken    = requestHeaders.authorization || requestHeaders.Authorization;

    if(!accessToken) {
      const { method, url, headers, body, query } = (context as Context).request
      const requestData   = { method, url, headers, body, query}
      const requestObject = JSON.stringify(requestData, null, 2)

      console.error(`Login Required! \ncheck this Request: ${requestObject}`)

      throw new Error(ErrorMessages.Login.NOT_AUTHORIZED)
    }

    try {
      const decoded = jwt.verify(accessToken, (context as Context).api.context.configs.JWT_SECRET_KEY) as JWTDecoded

      (context as Context).request.user = { id : decoded.userId}
    } catch(err) {
      console.error("Error while decoding JWT Token: ", err)

      throw new Error(ErrorMessages.Login.NOT_AUTHORIZED)
    }

    return next()
  })
}
