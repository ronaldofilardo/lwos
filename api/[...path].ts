// @ts-nocheck
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "../server/_core/auth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerAuthRoutes(app);

// Na Vercel, a função api/[...path].ts recebe requests em /api/*
// O Express precisa aceitar /trpc/* (sem o prefixo /api) porque
// o serverless function já está "montada" em /api/ pela Vercel.
const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use("/trpc", trpcMiddleware);
app.use("/api/trpc", trpcMiddleware);

export default app;
