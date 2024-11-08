import { SessionsService } from 'generated/redis';
import { UsersService } from "generated/users";
import { ObservableService } from "../../common-ts/observable";

export type ObservableUsersService = ObservableService<UsersService>
export type ObservableSessionsService = ObservableService<SessionsService>