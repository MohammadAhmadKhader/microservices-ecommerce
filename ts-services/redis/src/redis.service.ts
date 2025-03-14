import { Inject, Injectable } from '@nestjs/common';
import Redis from "ioredis"
import { CreateSessionResponse, DeleteSessionResponse, GetSessionResponse, Session, AuthValidateSessionResponse } from '@ms/common/generated/redis';
import {v4 as uuid} from "uuid"
import { toProtobufTimestamp} from "@ms/common/utils"
import { TraceMethod } from './telemetry';
import { trace } from '@opentelemetry/api';

@Injectable()
export class RedisService {
  constructor(@Inject("REDIS_CLIENT") private redisClient : Redis) {}

  @TraceMethod()
  async createSession(userId: number): Promise<CreateSessionResponse> {
    const span = trace.getActiveSpan()
    try{
        const sessionId = uuid()
        const hour = 1000 * 3600
        const expiresAt = new Date(Date.now() + (hour * 24))
        span.setAttribute("sessionId", sessionId)
        span.setAttribute("userId", userId)

        const session : Session = {
          id:sessionId,
          createdAt: toProtobufTimestamp(new Date()),
          userId,
          expiresAt:expiresAt.getTime(),
        }

        const result = await this.redisClient.set(`${this.formayRedisKeyForSessions(sessionId)}`, JSON.stringify(session))
        if (result !== "OK") {
          const errMsg = "An unexpected error has occurred during creating session"
          const loggedMsg = `[Redis - Service] - ${errMsg}: `
          console.error(loggedMsg)
          span.setAttribute("error", loggedMsg)
          span.setAttribute("error.message", loggedMsg)
          
          return { message: errMsg, success:false, session:null } 
        }

        span.setAttribute("error", false)
        span.setAttribute("session", JSON.stringify(session))

        return { message:"success", session, success:true };
      }catch(error){
        const loggedMessage = "[Redis - Service] - An Unexpected error has occurred during creating session "+ error
        console.error(loggedMessage)
        span.setAttribute("error", true)
        span.setAttribute("error.message", loggedMessage)

        throw error
      } finally {
        span.end()
      }
    }
  
  @TraceMethod()
  async getSession(sessionId: string): Promise<GetSessionResponse> {
    const span = trace.getActiveSpan()
    try {
      span.setAttribute("sessionId", sessionId)
      const sessionStr = await this.redisClient.get(sessionId)
      const session = JSON.parse(sessionStr) as Session

      span.setAttribute("session", JSON.stringify(session))

      return { session }
    }catch(err){
      const loggedMessage = `[Redis - Service] - An unexpected error has occurred during getting a session `+ err
      console.error(loggedMessage)
      span.setAttribute("error", true)
      span.setAttribute("error.message", loggedMessage)
      
      throw err
    } finally {
      span.end()
    }
  }

  @TraceMethod()
  async validateSession(sessionId: string): Promise<AuthValidateSessionResponse> {
    const span = trace.getActiveSpan()
    try {
      const sessionStr = await this.redisClient.get(sessionId)
      const session = JSON.parse(sessionStr) as Session

      span.setAttribute("session", null)
      span.setAttribute("sessionId", sessionId)

      if (new Date() > new Date(session.expiresAt)) {
        const invalidResponse = { message:"session has expired", success:false, session: null }
        span.setAttribute("error", true)
        span.setAttribute("error.message", invalidResponse.message)

        return invalidResponse
      }

      const successResponse = { message:"success", success:true, session }
      span.setAttribute("message", successResponse.message)
      span.setAttribute("session", null)

      return successResponse
    }catch(err){
      const loggedMessage = `[Redis - Service] - An unexpected error has occurred during validating session`+ err
      console.error(loggedMessage)
      span.setAttribute("error", true)
      span.setAttribute("error.message", loggedMessage)
      
      throw err
    } finally {
      span.end()
    }
  }

  @TraceMethod()
  async deleteSession(sessionId : string): Promise<DeleteSessionResponse> {
    const span = trace.getActiveSpan()
    try{
      span.setAttribute("session.id", sessionId)
      const res = await this.redisClient.del(sessionId)
      if (res > 0) {
        const successResponse = {success: true, message:"session was deleted successfully"}
        span.setAttribute("error", false)
        span.setAttribute("error.message", successResponse.message)

        return successResponse
      } 

      const errResponse = {success: false, message:"session was not found"}
      span.setAttribute("error", !errResponse.success)
      span.setAttribute("error.message", errResponse.message)
      
      return errResponse
    }catch (error){
      const loggedMessage = "[Redis Service] - Error during removing session: "+ error
      console.error(loggedMessage)

      span.setAttribute("error", true)
      span.setAttribute("error.message", loggedMessage)

      return {success: false, message:"An unexpected error has occurred while deleting the session"}
    } finally {
      span.end()
    }
  }

  formatRedisKey(serviceName: string) {
    const appName = "ms"
    const key = `${appName}:${serviceName}`
    return key
  }

  formayRedisKeyForSessions(sessionId: string) {
    const appName = "ms"
    const key = `${appName}:sessions:${sessionId}`
    return key
  }
}
