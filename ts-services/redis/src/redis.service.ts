import { Inject, Injectable } from '@nestjs/common';
import Redis from "ioredis"
import { CreateSessionResponse, DeleteSessionResponse, GetSessionResponse, Session, AuthValidateSessionResponse } from '@ms/common/generated/redis';
import {v4 as uuid} from "uuid"
import {toProtobufTimestamp} from "@ms/common/utils"

@Injectable()
export class RedisService {
  constructor(@Inject("REDIS_CLIENT") private redisClient : Redis) {}

  async createSession(userId: number): Promise<CreateSessionResponse> {
    try{
        const sessionId = uuid()
        const hour = 1000 * 3600
        const expiresAt = new Date(Date.now() + (hour * 24))

        const session : Session = {
          id:sessionId,
          createdAt: toProtobufTimestamp(new Date()),
          userId,
          expiresAt:expiresAt.getTime(),
        }

        const result = await this.redisClient.set(sessionId, JSON.stringify(session))
        if (result !== "OK") {
          const errMsg = "An unexpected error has occurred during creating session"
          console.error(`[Redis - Service] - ${errMsg}: `)
          return { message: errMsg, success:false, session:null } 
        }
        return { message:"success", session, success:true } ;
      }catch(error){
        console.error("[Redis - Service] - An Unexpected error has occurred during creating session")
        throw error
      }
    }
  
  async getSession(sessionId: string): Promise<GetSessionResponse> {
    try {
      const sessionStr = await this.redisClient.get(sessionId)
      const session = JSON.parse(sessionStr) as Session

      return { session }
    }catch(err){
      console.error(`[Redis - Service] - An unexpected error has occurred during getting a session`, err)
      throw err
    }
  }

  async validateSession(sessionId: string): Promise<AuthValidateSessionResponse> {
    try {
      const sessionStr = await this.redisClient.get(sessionId)
      const session = JSON.parse(sessionStr) as Session
      
      if (new Date() > new Date(session.expiresAt)) {
        return { message:"session has expired", success:false, session: null }
      }

      return { message:"success", success:true, session }
    }catch(err){
      console.error(`[Redis - Service] - An unexpected error has occurred during validating session`, err)
      throw err
    }
  }

  async deleteSession(sessionId : string): Promise<DeleteSessionResponse> {
    try{
      const res = await this.redisClient.del(sessionId)
      if (res > 0) {
        return {success: true, message:"session was deleted successfully"}
      } 

      return {success: false, message:"session was not found"}
    }catch (error){
      console.error("[Redis Service] - Error during removing session: ", error)

      return {success: false, message:"An unexpected error has occurred while deleting the session"}
    }
  }
}
