import fastify from "fastify";
import guard from "fastify-guard";
import { logger } from "./logger";
import { applicationRoutes } from "../modules/application/applications.routes";
import { usersRoutes } from "../modules/users/users.routes";
import { roleRoutes } from "../modules/roles/roles.routes";
import jwt from "jsonwebtoken";

type User = {
  id: string;
  scopes: Array<string>;
  applicationId: string;
};

declare module "fastify" {
  interface FastifyRequest {
    user: User;
  }
}

export async function buildServer() {
  const app = fastify({
    logger,
  });

  app.decorateRequest("user", null);

  app.addHook("onRequest", async function (request, reply) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    try {
      const token = authHeader.replace("bearer", "");
      const decoded = jwt.verify(token, "secret") as User;
      console.log(decoded);

      request.user = decoded; //from this decoded value i get my appliaction id and everything that i got as payload
    } catch (error) {}
  });

  //register plugins
  app.register(guard, {
    requestProperty: "user",
    scopeProperty: "scope",
    errorHandler(result, request, reply) {
      return reply.send("You can not do that");
    },
  });

  //register routes

  app.register(applicationRoutes, { prefix: "/api/applications" });
  app.register(usersRoutes, { prefix: "/api/users" });
  app.register(roleRoutes, { prefix: "/api/roles" });
  return app;
}
