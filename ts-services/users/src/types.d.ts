type UserOperations = "USER_CREATION" | "USER_LOGIN"
type UserCreationParameters = [firstName: string, lastName: string, email: string, password: string]
type UserLoginParameters = [email: string, password:string]
type EnvConfig = {
    DB_USER: string;
    DB_NAME:"microservices_users";
    DB_HOST:"127.0.0.1";
    DB_PASSWORD:"123456";
    DB_PORT:3306;
    SERVICE_HOST:"localhost";
    SERVICE_PORT:3002;
} & {}