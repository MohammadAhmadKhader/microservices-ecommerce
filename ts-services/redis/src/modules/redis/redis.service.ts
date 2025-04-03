import { Inject, Injectable } from '@nestjs/common';
import Redis from "ioredis"
import { CreateSessionResponse, DeleteSessionResponse, GetSessionResponse,
   AuthValidateSessionResponse } from '@ms/common/generated/redis';
import { Session } from '@ms/common/generated/auth';
import { trace } from '@opentelemetry/api';
import { CreateSessionDto } from './dto/create-session.dto';
import { DeleteSessionDto, GetSessionDto, ValidateSessionDto } from './dto/get-session.dto';

@Injectable()
export class RedisService {
  constructor(@Inject("REDIS_CLIENT") private redisClient : Redis) {}

  async createSession({session}: CreateSessionDto): Promise<CreateSessionResponse> {
    const span = trace.getActiveSpan()
    try{
        span.setAttribute("sessionId", session.id)
        span.setAttribute("userId", session.userId)

        const result = await this.redisClient.set(`${this.formayRedisKeyForSessions(session.id)}`, JSON.stringify(session))
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
  
  async getSession({sessionId}: GetSessionDto): Promise<GetSessionResponse> {
    const span = trace.getActiveSpan()
    try {
      span.setAttribute("sessionId", sessionId)
      const sessionStr = await this.redisClient.get(`${this.formayRedisKeyForSessions(sessionId)}`)
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

  async validateSession({sessionId}: ValidateSessionDto): Promise<AuthValidateSessionResponse> {
    const span = trace.getActiveSpan()
    try {
      const sessionStr = await this.redisClient.get(`${this.formayRedisKeyForSessions(sessionId)}`)
      const session = JSON.parse(sessionStr) as Session

      span.setAttribute("session", null)
      span.setAttribute("sessionId", sessionId)

      if (!session || new Date() > new Date(session.expiresAt)) {
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

  async deleteSession({sessionId} : DeleteSessionDto): Promise<DeleteSessionResponse> {
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
