import { AuthServiceServiceName } from "./generated/auth";
import { OrderServiceServiceName } from "./generated/orders";
import { PermissionsServiceServiceName } from "./generated/permissions";
import { RedisServiceServiceName } from "./generated/redis";
import { RolesServiceServiceName } from "./generated/roles";
import { UsersServiceServiceName } from "./generated/users";

export const PROTONAME_USERS_SERVICE = UsersServiceServiceName.split(".")[1]
export const PROTONAME_REDIS_SERVICE = RedisServiceServiceName.split(".")[1]
export const PROTONAME_AUTH_SERVICE = AuthServiceServiceName.split(".")[1]
export const PROTONAME_PRODUCTS_SERVICE = AuthServiceServiceName.split(".")[1]
export const PROTONAME_ORDERS_SERVICE = OrderServiceServiceName.split(".")[1]
export const PROTONAME_ROLES_SERVICE = RolesServiceServiceName.split(".")[1]
export const PROTONAME_PERMISSIONS_SERVICE = PermissionsServiceServiceName.split(".")[1]