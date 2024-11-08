// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.5
//   protoc               v5.27.3
// source: users.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "./google/protobuf/timestamp";
import { EmptyBody } from "./shared";

export const protobufPackage = "users";

export interface FindOneUserByIdRequest {
  id: number;
}

export interface FindOneUserByEmailRequest {
  email: string;
}

export interface FindOneUserByIdResponse {
  user: User | undefined;
}

export interface FindOneUserByEmailResponse {
  user: User | undefined;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateUserResponse {
  user: User | undefined;
}

export interface UpdateUserRequest {
  id: number;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
  mobileNumber?: string | undefined;
}

export interface UpdateUserResponse {
  user: User | undefined;
}

export interface DeleteUserRequest {
  id: number;
}

export interface FindAllUsersRequest {
  page: number;
  limit: number;
}

export interface FindAllUsersResponse {
  page: number;
  limit: number;
  count: number;
  users: User[];
}

function createBaseFindOneUserByIdRequest(): FindOneUserByIdRequest {
  return { id: 0 };
}

export const FindOneUserByIdRequest: MessageFns<FindOneUserByIdRequest> = {
  encode(message: FindOneUserByIdRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): FindOneUserByIdRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindOneUserByIdRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FindOneUserByIdRequest {
    return { id: isSet(object.id) ? globalThis.Number(object.id) : 0 };
  },

  toJSON(message: FindOneUserByIdRequest): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FindOneUserByIdRequest>, I>>(base?: I): FindOneUserByIdRequest {
    return FindOneUserByIdRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FindOneUserByIdRequest>, I>>(object: I): FindOneUserByIdRequest {
    const message = createBaseFindOneUserByIdRequest();
    message.id = object.id ?? 0;
    return message;
  },
};

function createBaseFindOneUserByEmailRequest(): FindOneUserByEmailRequest {
  return { email: "" };
}

export const FindOneUserByEmailRequest: MessageFns<FindOneUserByEmailRequest> = {
  encode(message: FindOneUserByEmailRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.email !== "") {
      writer.uint32(10).string(message.email);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): FindOneUserByEmailRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindOneUserByEmailRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.email = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FindOneUserByEmailRequest {
    return { email: isSet(object.email) ? globalThis.String(object.email) : "" };
  },

  toJSON(message: FindOneUserByEmailRequest): unknown {
    const obj: any = {};
    if (message.email !== "") {
      obj.email = message.email;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FindOneUserByEmailRequest>, I>>(base?: I): FindOneUserByEmailRequest {
    return FindOneUserByEmailRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FindOneUserByEmailRequest>, I>>(object: I): FindOneUserByEmailRequest {
    const message = createBaseFindOneUserByEmailRequest();
    message.email = object.email ?? "";
    return message;
  },
};

function createBaseFindOneUserByIdResponse(): FindOneUserByIdResponse {
  return { user: undefined };
}

export const FindOneUserByIdResponse: MessageFns<FindOneUserByIdResponse> = {
  encode(message: FindOneUserByIdResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): FindOneUserByIdResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindOneUserByIdResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FindOneUserByIdResponse {
    return { user: isSet(object.user) ? User.fromJSON(object.user) : undefined };
  },

  toJSON(message: FindOneUserByIdResponse): unknown {
    const obj: any = {};
    if (message.user !== undefined) {
      obj.user = User.toJSON(message.user);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FindOneUserByIdResponse>, I>>(base?: I): FindOneUserByIdResponse {
    return FindOneUserByIdResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FindOneUserByIdResponse>, I>>(object: I): FindOneUserByIdResponse {
    const message = createBaseFindOneUserByIdResponse();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

function createBaseFindOneUserByEmailResponse(): FindOneUserByEmailResponse {
  return { user: undefined };
}

export const FindOneUserByEmailResponse: MessageFns<FindOneUserByEmailResponse> = {
  encode(message: FindOneUserByEmailResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): FindOneUserByEmailResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindOneUserByEmailResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FindOneUserByEmailResponse {
    return { user: isSet(object.user) ? User.fromJSON(object.user) : undefined };
  },

  toJSON(message: FindOneUserByEmailResponse): unknown {
    const obj: any = {};
    if (message.user !== undefined) {
      obj.user = User.toJSON(message.user);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FindOneUserByEmailResponse>, I>>(base?: I): FindOneUserByEmailResponse {
    return FindOneUserByEmailResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FindOneUserByEmailResponse>, I>>(object: I): FindOneUserByEmailResponse {
    const message = createBaseFindOneUserByEmailResponse();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

function createBaseUser(): User {
  return {
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export const User: MessageFns<User> = {
  encode(message: User, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.firstName !== "") {
      writer.uint32(18).string(message.firstName);
    }
    if (message.lastName !== "") {
      writer.uint32(26).string(message.lastName);
    }
    if (message.email !== "") {
      writer.uint32(34).string(message.email);
    }
    if (message.password !== "") {
      writer.uint32(42).string(message.password);
    }
    if (message.mobileNumber !== "") {
      writer.uint32(50).string(message.mobileNumber);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(58).fork()).join();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(66).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): User {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.firstName = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.lastName = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.email = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.password = reader.string();
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.mobileNumber = reader.string();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        }
        case 8: {
          if (tag !== 66) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): User {
    return {
      id: isSet(object.id) ? globalThis.Number(object.id) : 0,
      firstName: isSet(object.firstName) ? globalThis.String(object.firstName) : "",
      lastName: isSet(object.lastName) ? globalThis.String(object.lastName) : "",
      email: isSet(object.email) ? globalThis.String(object.email) : "",
      password: isSet(object.password) ? globalThis.String(object.password) : "",
      mobileNumber: isSet(object.mobileNumber) ? globalThis.String(object.mobileNumber) : "",
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      updatedAt: isSet(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : undefined,
    };
  },

  toJSON(message: User): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.firstName !== "") {
      obj.firstName = message.firstName;
    }
    if (message.lastName !== "") {
      obj.lastName = message.lastName;
    }
    if (message.email !== "") {
      obj.email = message.email;
    }
    if (message.password !== "") {
      obj.password = message.password;
    }
    if (message.mobileNumber !== "") {
      obj.mobileNumber = message.mobileNumber;
    }
    if (message.createdAt !== undefined) {
      obj.createdAt = message.createdAt.toISOString();
    }
    if (message.updatedAt !== undefined) {
      obj.updatedAt = message.updatedAt.toISOString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<User>, I>>(base?: I): User {
    return User.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<User>, I>>(object: I): User {
    const message = createBaseUser();
    message.id = object.id ?? 0;
    message.firstName = object.firstName ?? "";
    message.lastName = object.lastName ?? "";
    message.email = object.email ?? "";
    message.password = object.password ?? "";
    message.mobileNumber = object.mobileNumber ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    return message;
  },
};

function createBaseCreateUserRequest(): CreateUserRequest {
  return { firstName: "", lastName: "", email: "", password: "" };
}

export const CreateUserRequest: MessageFns<CreateUserRequest> = {
  encode(message: CreateUserRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.firstName !== "") {
      writer.uint32(10).string(message.firstName);
    }
    if (message.lastName !== "") {
      writer.uint32(18).string(message.lastName);
    }
    if (message.email !== "") {
      writer.uint32(26).string(message.email);
    }
    if (message.password !== "") {
      writer.uint32(34).string(message.password);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CreateUserRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateUserRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.firstName = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.lastName = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.email = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.password = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateUserRequest {
    return {
      firstName: isSet(object.firstName) ? globalThis.String(object.firstName) : "",
      lastName: isSet(object.lastName) ? globalThis.String(object.lastName) : "",
      email: isSet(object.email) ? globalThis.String(object.email) : "",
      password: isSet(object.password) ? globalThis.String(object.password) : "",
    };
  },

  toJSON(message: CreateUserRequest): unknown {
    const obj: any = {};
    if (message.firstName !== "") {
      obj.firstName = message.firstName;
    }
    if (message.lastName !== "") {
      obj.lastName = message.lastName;
    }
    if (message.email !== "") {
      obj.email = message.email;
    }
    if (message.password !== "") {
      obj.password = message.password;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateUserRequest>, I>>(base?: I): CreateUserRequest {
    return CreateUserRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateUserRequest>, I>>(object: I): CreateUserRequest {
    const message = createBaseCreateUserRequest();
    message.firstName = object.firstName ?? "";
    message.lastName = object.lastName ?? "";
    message.email = object.email ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBaseCreateUserResponse(): CreateUserResponse {
  return { user: undefined };
}

export const CreateUserResponse: MessageFns<CreateUserResponse> = {
  encode(message: CreateUserResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): CreateUserResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateUserResponse {
    return { user: isSet(object.user) ? User.fromJSON(object.user) : undefined };
  },

  toJSON(message: CreateUserResponse): unknown {
    const obj: any = {};
    if (message.user !== undefined) {
      obj.user = User.toJSON(message.user);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateUserResponse>, I>>(base?: I): CreateUserResponse {
    return CreateUserResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateUserResponse>, I>>(object: I): CreateUserResponse {
    const message = createBaseCreateUserResponse();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

function createBaseUpdateUserRequest(): UpdateUserRequest {
  return {
    id: 0,
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    password: undefined,
    mobileNumber: undefined,
  };
}

export const UpdateUserRequest: MessageFns<UpdateUserRequest> = {
  encode(message: UpdateUserRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.firstName !== undefined) {
      writer.uint32(18).string(message.firstName);
    }
    if (message.lastName !== undefined) {
      writer.uint32(26).string(message.lastName);
    }
    if (message.email !== undefined) {
      writer.uint32(34).string(message.email);
    }
    if (message.password !== undefined) {
      writer.uint32(42).string(message.password);
    }
    if (message.mobileNumber !== undefined) {
      writer.uint32(50).string(message.mobileNumber);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): UpdateUserRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateUserRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.firstName = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.lastName = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.email = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          message.password = reader.string();
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }

          message.mobileNumber = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateUserRequest {
    return {
      id: isSet(object.id) ? globalThis.Number(object.id) : 0,
      firstName: isSet(object.firstName) ? globalThis.String(object.firstName) : undefined,
      lastName: isSet(object.lastName) ? globalThis.String(object.lastName) : undefined,
      email: isSet(object.email) ? globalThis.String(object.email) : undefined,
      password: isSet(object.password) ? globalThis.String(object.password) : undefined,
      mobileNumber: isSet(object.mobileNumber) ? globalThis.String(object.mobileNumber) : undefined,
    };
  },

  toJSON(message: UpdateUserRequest): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.firstName !== undefined) {
      obj.firstName = message.firstName;
    }
    if (message.lastName !== undefined) {
      obj.lastName = message.lastName;
    }
    if (message.email !== undefined) {
      obj.email = message.email;
    }
    if (message.password !== undefined) {
      obj.password = message.password;
    }
    if (message.mobileNumber !== undefined) {
      obj.mobileNumber = message.mobileNumber;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateUserRequest>, I>>(base?: I): UpdateUserRequest {
    return UpdateUserRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateUserRequest>, I>>(object: I): UpdateUserRequest {
    const message = createBaseUpdateUserRequest();
    message.id = object.id ?? 0;
    message.firstName = object.firstName ?? undefined;
    message.lastName = object.lastName ?? undefined;
    message.email = object.email ?? undefined;
    message.password = object.password ?? undefined;
    message.mobileNumber = object.mobileNumber ?? undefined;
    return message;
  },
};

function createBaseUpdateUserResponse(): UpdateUserResponse {
  return { user: undefined };
}

export const UpdateUserResponse: MessageFns<UpdateUserResponse> = {
  encode(message: UpdateUserResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): UpdateUserResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateUserResponse {
    return { user: isSet(object.user) ? User.fromJSON(object.user) : undefined };
  },

  toJSON(message: UpdateUserResponse): unknown {
    const obj: any = {};
    if (message.user !== undefined) {
      obj.user = User.toJSON(message.user);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateUserResponse>, I>>(base?: I): UpdateUserResponse {
    return UpdateUserResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateUserResponse>, I>>(object: I): UpdateUserResponse {
    const message = createBaseUpdateUserResponse();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

function createBaseDeleteUserRequest(): DeleteUserRequest {
  return { id: 0 };
}

export const DeleteUserRequest: MessageFns<DeleteUserRequest> = {
  encode(message: DeleteUserRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): DeleteUserRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteUserRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DeleteUserRequest {
    return { id: isSet(object.id) ? globalThis.Number(object.id) : 0 };
  },

  toJSON(message: DeleteUserRequest): unknown {
    const obj: any = {};
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DeleteUserRequest>, I>>(base?: I): DeleteUserRequest {
    return DeleteUserRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DeleteUserRequest>, I>>(object: I): DeleteUserRequest {
    const message = createBaseDeleteUserRequest();
    message.id = object.id ?? 0;
    return message;
  },
};

function createBaseFindAllUsersRequest(): FindAllUsersRequest {
  return { page: 0, limit: 0 };
}

export const FindAllUsersRequest: MessageFns<FindAllUsersRequest> = {
  encode(message: FindAllUsersRequest, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.page !== 0) {
      writer.uint32(8).int32(message.page);
    }
    if (message.limit !== 0) {
      writer.uint32(16).int32(message.limit);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): FindAllUsersRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindAllUsersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.page = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.limit = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FindAllUsersRequest {
    return {
      page: isSet(object.page) ? globalThis.Number(object.page) : 0,
      limit: isSet(object.limit) ? globalThis.Number(object.limit) : 0,
    };
  },

  toJSON(message: FindAllUsersRequest): unknown {
    const obj: any = {};
    if (message.page !== 0) {
      obj.page = Math.round(message.page);
    }
    if (message.limit !== 0) {
      obj.limit = Math.round(message.limit);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FindAllUsersRequest>, I>>(base?: I): FindAllUsersRequest {
    return FindAllUsersRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FindAllUsersRequest>, I>>(object: I): FindAllUsersRequest {
    const message = createBaseFindAllUsersRequest();
    message.page = object.page ?? 0;
    message.limit = object.limit ?? 0;
    return message;
  },
};

function createBaseFindAllUsersResponse(): FindAllUsersResponse {
  return { page: 0, limit: 0, count: 0, users: [] };
}

export const FindAllUsersResponse: MessageFns<FindAllUsersResponse> = {
  encode(message: FindAllUsersResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.page !== 0) {
      writer.uint32(8).int32(message.page);
    }
    if (message.limit !== 0) {
      writer.uint32(16).int32(message.limit);
    }
    if (message.count !== 0) {
      writer.uint32(24).int64(message.count);
    }
    for (const v of message.users) {
      User.encode(v!, writer.uint32(34).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): FindAllUsersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindAllUsersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.page = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.limit = reader.int32();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.count = longToNumber(reader.int64());
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.users.push(User.decode(reader, reader.uint32()));
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FindAllUsersResponse {
    return {
      page: isSet(object.page) ? globalThis.Number(object.page) : 0,
      limit: isSet(object.limit) ? globalThis.Number(object.limit) : 0,
      count: isSet(object.count) ? globalThis.Number(object.count) : 0,
      users: globalThis.Array.isArray(object?.users) ? object.users.map((e: any) => User.fromJSON(e)) : [],
    };
  },

  toJSON(message: FindAllUsersResponse): unknown {
    const obj: any = {};
    if (message.page !== 0) {
      obj.page = Math.round(message.page);
    }
    if (message.limit !== 0) {
      obj.limit = Math.round(message.limit);
    }
    if (message.count !== 0) {
      obj.count = Math.round(message.count);
    }
    if (message.users?.length) {
      obj.users = message.users.map((e) => User.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FindAllUsersResponse>, I>>(base?: I): FindAllUsersResponse {
    return FindAllUsersResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FindAllUsersResponse>, I>>(object: I): FindAllUsersResponse {
    const message = createBaseFindAllUsersResponse();
    message.page = object.page ?? 0;
    message.limit = object.limit ?? 0;
    message.count = object.count ?? 0;
    message.users = object.users?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

export interface UsersService {
  FindOneUserById(request: FindOneUserByIdRequest): Promise<FindOneUserByIdResponse>;
  FindOneUserByEmail(request: FindOneUserByEmailRequest): Promise<FindOneUserByEmailResponse>;
  CreateUser(request: CreateUserRequest): Promise<CreateUserResponse>;
  UpdateUser(request: UpdateUserRequest): Promise<UpdateUserResponse>;
  DeleteUser(request: DeleteUserRequest): Promise<EmptyBody>;
  FindAllUsers(request: FindAllUsersRequest): Promise<FindAllUsersResponse>;
}

export const UsersServiceServiceName = "users.UsersService";
export class UsersServiceClientImpl implements UsersService {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || UsersServiceServiceName;
    this.rpc = rpc;
    this.FindOneUserById = this.FindOneUserById.bind(this);
    this.FindOneUserByEmail = this.FindOneUserByEmail.bind(this);
    this.CreateUser = this.CreateUser.bind(this);
    this.UpdateUser = this.UpdateUser.bind(this);
    this.DeleteUser = this.DeleteUser.bind(this);
    this.FindAllUsers = this.FindAllUsers.bind(this);
  }
  FindOneUserById(request: FindOneUserByIdRequest): Promise<FindOneUserByIdResponse> {
    const data = FindOneUserByIdRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "FindOneUserById", data);
    return promise.then((data) => FindOneUserByIdResponse.decode(new BinaryReader(data)));
  }

  FindOneUserByEmail(request: FindOneUserByEmailRequest): Promise<FindOneUserByEmailResponse> {
    const data = FindOneUserByEmailRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "FindOneUserByEmail", data);
    return promise.then((data) => FindOneUserByEmailResponse.decode(new BinaryReader(data)));
  }

  CreateUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    const data = CreateUserRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreateUser", data);
    return promise.then((data) => CreateUserResponse.decode(new BinaryReader(data)));
  }

  UpdateUser(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const data = UpdateUserRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "UpdateUser", data);
    return promise.then((data) => UpdateUserResponse.decode(new BinaryReader(data)));
  }

  DeleteUser(request: DeleteUserRequest): Promise<EmptyBody> {
    const data = DeleteUserRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "DeleteUser", data);
    return promise.then((data) => EmptyBody.decode(new BinaryReader(data)));
  }

  FindAllUsers(request: FindAllUsersRequest): Promise<FindAllUsersResponse> {
    const data = FindAllUsersRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "FindAllUsers", data);
    return promise.then((data) => FindAllUsersResponse.decode(new BinaryReader(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function toTimestamp(date: Date): Timestamp {
  const seconds = Math.trunc(date.getTime() / 1_000);
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (t.seconds || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new globalThis.Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === "string") {
    return new globalThis.Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function longToNumber(int64: { toString(): string }): number {
  const num = globalThis.Number(int64.toString());
  if (num > globalThis.Number.MAX_SAFE_INTEGER) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  if (num < globalThis.Number.MIN_SAFE_INTEGER) {
    throw new globalThis.Error("Value is smaller than Number.MIN_SAFE_INTEGER");
  }
  return num;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
