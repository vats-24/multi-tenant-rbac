import { FastifyReply, FastifyRequest } from "fastify";
import {
  AssignRoleToUserBody,
  CreateUserBody,
  LoginBody,
} from "./users.schemas";
import { getRoleByName } from "../roles/roles.services";
import { SYSTEM_ROLES } from "../../config/permissions";
import {
  assignRoleToUser,
  createUser,
  getUserByEmail,
  getUsersByApplication,
} from "./users.services";
import jwt from "jsonwebtoken";
import { logger } from "../../utils/logger";

export async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply
) {
  const { initialUser, ...data } = request.body;

  // Doubt :-
  const roleName = initialUser
    ? SYSTEM_ROLES.SUPER_ADMIN
    : SYSTEM_ROLES.APPLICATION_USER;

  console.log({ roleName });

  if (roleName === SYSTEM_ROLES.SUPER_ADMIN) {
    const appUsers = await getUsersByApplication(data.applicationId);

    if (appUsers.length > 0) {
      return reply.code(400).send({
        message: "Application already has super admin user",
        extensions: {
          code: "APPLICATION_ALREADY_SUPER_USER",
          applicationId: data.applicationId,
        },
      });
    }
  }

  const role = await getRoleByName({
    name: roleName,
    applicationId: data.applicationId,
  });

  if (!role) {
    return reply.code(404).send({
      message: "Role not found",
    });
  }

  console.log({ role });

  try {
    const user = await createUser(data);

    //assign a role to user

    await assignRoleToUser({
      userId: user.id,
      roleId: role.id,
      applicationId: data.applicationId,
    });

    console.log("meohhhhh", user);

    return user;
  } catch (error) {
    return reply.send({message: "User already exists"})
  }
}

//login handler
export async function loginHandler(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) {
  const { applicationId, email, password } = request.body;

  const user = await getUserByEmail({
    applicationId,
    email,
  });

  if (!user) {
    return reply.code(400).send({
      message: "Invalid email  or password",
    });
  }

  //return user; //remove this later on but i have to check

  const token = jwt.sign(
    {
      id:user.id,
      email,
      applicationId,
      scopes: user.permissions
    },
    "secret"
  );

  return { token };
}

export async function assignRoleToUserHandler(
  request: FastifyRequest<{
    Body: AssignRoleToUserBody;
  }>,
  reply: FastifyReply
) {
  const { userId, roleId, applicationId } = request.body;

  try {
    const result = await assignRoleToUser({
      userId,
      roleId,
      applicationId,
    });

    return result;
  } catch (e) {
    logger.error(e, "error assigning role to user");
    return reply.code(400).send({
      message: "Could not assign role to user",
    });
  }
}
