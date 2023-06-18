import { Context       } from '../app'
import { LoginRequired } from './decorators';

import {
  Query,
  Field,
  ObjectType,
  Resolver,
  Ctx
} from 'type-graphql'

@ObjectType()
class Ping {

  @Field(type => String)
  pong!: string;
}

@Resolver(of => Ping)
class PingResolver {

  @Query(returns => Ping)
  async ping(@Ctx() context: Context) {
    return context.api.pingService.ping()
  }

  @LoginRequired()
  @Query(returns => Ping)
  async loggedInPing(@Ctx() context: Context) {
    return context.api.pingService.ping()
  }
}