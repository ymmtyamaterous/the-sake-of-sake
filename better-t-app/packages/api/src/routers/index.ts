import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { drinkLogRouter } from "./drinkLog";
import { knowledgeRouter } from "./knowledge";
import { statsRouter } from "./stats";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  drinkLog: drinkLogRouter,
  knowledge: knowledgeRouter,
  stats: statsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
