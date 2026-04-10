import { FastifyInstance } from "fastify";
import { createApplicationHandler} from "./application.controllers";
import { createApplicationJsonSchema } from "./applications.schema";
import { getApplications } from "./applications.services";

export async function applicationRoutes(app: FastifyInstance) {
  app.post(
    "/",
    {
      schema: createApplicationJsonSchema,
    },
    createApplicationHandler
  );

  app.get("/", {}, getApplications);
}
