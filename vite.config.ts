import { defineConfig } from "vite";
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
        const status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        const json = (payload: unknown) => {
          res.statusCode = res.statusCode || 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        };

        const mockReq = { method: req.method, body: parsedBody };
        const mockRes = {
          status,
          json,
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
export default defineConfig(({ mode }) => ({
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
}));
