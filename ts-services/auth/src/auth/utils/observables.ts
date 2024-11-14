import { SessionsService } from '@ms/common/generated/redis';
import { UsersService } from "@ms/common/generated/users";
import { ObservableService } from "@ms/common/observable";

export type ObservableUsersService = ObservableService<UsersService>
export type ObservableSessionsService = ObservableService<SessionsService>