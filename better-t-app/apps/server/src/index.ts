import { createContext } from "@better-t-app/api/context";
import { appRouter } from "@better-t-app/api/routers/index";
import { auth } from "@better-t-app/auth";
import { runMigrateAndSeed } from "@better-t-app/db/migrate";
import { env } from "@better-t-app/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// 起動時にマイグレーション + シードを実行
await runMigrateAndSeed();

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
await fs.mkdir(path.join(UPLOADS_DIR, "drink-logs"), { recursive: true });

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// 静的ファイル配信 (アップロード画像)
app.use("/uploads/*", serveStatic({ root: process.cwd() }));

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// 画像アップロードエンドポイント
app.post("/api/uploads/drink-logs", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.parseBody();
  const file = body["file"];

  if (!(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return c.json({ error: "Invalid file type. Allowed: JPEG, PNG, WEBP" }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: "File too large. Max 2MB" }, 400);
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const filename = `${randomUUID()}.${ext}`;
  const filePath = path.join("drink-logs", filename);
  const fullPath = path.join(UPLOADS_DIR, "drink-logs", filename);

  const buffer = await file.arrayBuffer();
  await fs.writeFile(fullPath, Buffer.from(buffer));

  return c.json({
    filePath: `uploads/${filePath}`,
    url: `/uploads/${filePath}`,
  });
});

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

// Vite ビルドのフロントエンド静的ファイルを配信
// WORKDIR /app に対して ./web = /app/web (Dockerfile で COPY した場所)
app.use("/*", serveStatic({ root: "./web" }));

// SPA フォールバック: クライアントサイドルーティング対応
app.get("/*", serveStatic({ path: "./web/index.html" }));

export default app;
