import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import conciergeHandler from "./api/concierge";

const conciergeDevMiddleware = () => ({
  name: "concierge-api-dev",
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.method !== "POST" || req.url !== "/api/concierge") {
        next();
        return;
      }

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

        const mockReq = { method: req.method, body: parsedBody };
        const mockRes = {
          status: (code: number) => createJsonResponder(code),
          json: (payload: unknown) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(payload));
          },
          setHeader: res.setHeader.bind(res),
          end: res.end.bind(res),
        };

        try {
          await conciergeHandler(mockReq as any, mockRes as any);
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
  const env = loadEnv(mode, process.cwd(), "");
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY;
  process.env.OPENAI_MODEL = process.env.OPENAI_MODEL || env.OPENAI_MODEL;

  return {
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    conciergeDevMiddleware(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
