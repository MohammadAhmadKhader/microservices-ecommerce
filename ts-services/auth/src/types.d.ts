type UserOperations = "USER_CREATION" | "USER_LOGIN"
type UserCreationParameters = [firstName: string, lastName: string, email: string, password: string]
type UserLoginParameters = [email: string, password:string]