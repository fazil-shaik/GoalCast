import express from "express";
import { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import WebSocketManager from "./websocket.js";
import { addResetTokenColumns } from './migrations/add-reset-token-columns.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function main() {
  try {
    // Run migrations
    console.log('Running database migrations...');
    await addResetTokenColumns();
    
    // Register routes and start server
    const server = await registerRoutes(app);

    // Initialize WebSocket manager with a different port
    const wsManager = new WebSocketManager(server, 5174); // Use port 5174 for WebSocket

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // In production on Vercel, we don't need to serve static files
    // as Vercel handles that for us
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    }

    return app;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  main();
}

// Export the app for Vercel
export default app;
