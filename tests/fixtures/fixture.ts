import jwt from 'jsonwebtoken'

export default class Fixture {
  static defaultHeader = {
    'Content-Type'                 : 'application/json',
    'Access-Control-Allow-Origin'  : 'https://belltiger.dev',
    'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers' : 'Accept, Content-Type, Content-Length, Accept-Encoding, Authorization',
    'X-Frame-Options'              : 'DENY'
  }

  static generateAuthToken(userId: number, expiresIn?: string | number) {
    const options = expiresIn ? { expiresIn } : undefined

    return jwt.sign({ userId: userId }, process.env.JWT_SECRET_KEY!, options)
  }
}