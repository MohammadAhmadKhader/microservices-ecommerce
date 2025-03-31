import { User } from '@ms/common/generated/users';
import * as bcrypt from 'bcrypt';

const saltRounds = 10

export function hashPassword(password: string){
    return bcrypt.hashSync(password, saltRounds)
}

export function comparePassword(password: string, hashPassword:string): boolean {
    const isMatched = bcrypt.compareSync(password, hashPassword)
    return isMatched
}

export function UserToProtobuf(user: User) {
    
}