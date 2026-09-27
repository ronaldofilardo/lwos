// @ts-nocheck
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./_core/auth";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check para testes rápidos
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

registerStorageProxy(app);
registerAuthRoutes(app);

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use("/trpc", trpcMiddleware);
app.use("/api/trpc", trpcMiddleware);

export default app;
