import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import conciergeHandler from "./api/concierge";
import recipeImageHandler from "./api/recipe-image";
import heyFoodyHandler from "./api/hey-foody";
import { DEFAULT_OPENAI_MODEL } from "./lib/openai-config";

type ApiHandler = (req: any, res: any) => Promise<void>;

const loadLocalEnv = (mode: string) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.OPENAI_API_KEY = (process.env.OPENAI_API_KEY || env.OPENAI_API_KEY || "").trim();
  process.env.OPENAI_MODEL = (process.env.OPENAI_MODEL || env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL).trim();
  process.env.VITE_SUPABASE_URL = (process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim();
  process.env.VITE_SUPABASE_ANON_KEY = (
    process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ""
  ).trim();
};

const validateSupabaseEnv = () => {
  for (const name of ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const) {
    if (!process.env[name]) {
      throw new Error(
        `Missing required environment variable ${name}. Add it to .env.local — see .env.supabase.example.`,
      );
    }
  }
};

const staticApiRoutes: Record<string, ApiHandler> = {
  "/api/concierge": conciergeHandler,
  "/api/recipe-image": recipeImageHandler,
  "/api/hey-foody": heyFoodyHandler,
};

let cookbookPdfHandlerPromise: Promise<ApiHandler> | undefined;

const getCookbookPdfHandler = (mode: string) => {
  cookbookPdfHandlerPromise ??= (async () => {
    loadLocalEnv(mode);
    validateSupabaseEnv();
    return (await import("./api/cookbook-pdf")).default;
  })();
  return cookbookPdfHandlerPromise;
};

const apiDevMiddleware = () => ({
  name: "api-dev",
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.method !== "POST") {
        next();
        return;
      }

      const url = req.url ?? "";
      const handler =
        staticApiRoutes[url] ??
        (url === "/api/cookbook-pdf" ? await getCookbookPdfHandler(server.config.mode) : undefined);
      if (!handler) {
        next();
        return;
      }

      loadLocalEnv(server.config.mode);

      let body = "";
      req.on("data", (chunk: string) => {
        body += chunk;
      });
      req.on("end", async () => {
        const parsedBody = body ? JSON.parse(body) : {};
        const createJsonResponder = (code: number) => ({
          json: (payload: unknown) => {
            res.statusCode = code;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(payload));
          },
          end: (payload?: string) => {
            res.statusCode = code;
            res.setHeader("Content-Type", "application/json");
            res.end(payload ?? "");
          },
        });

        const mockReq = {
          method: req.method,
          body: parsedBody,
          headers: req.headers ?? {},
        };
        const mockRes = {
          statusCode: 200,
          status: (code: number) => createJsonResponder(code),
          json: (payload: unknown) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(payload));
          },
          setHeader: (name: string, value: string) => {
            res.setHeader(name, value);
          },
          end: (payload?: string | Buffer) => {
            res.end(payload);
          },
        };

        try {
          await handler(mockReq as any, mockRes as any);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }));
        }
      });
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  loadLocalEnv(mode);
  validateSupabaseEnv();

  return {
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    apiDevMiddleware(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
