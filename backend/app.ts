import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { config } from "./utils/config";
import { database } from "./utils/database";
import { globalErrorHandler, AppError } from "./utils/errorHandler";

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: config.server.nodeEnv === "production",
        crossOriginEmbedderPolicy: false,
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: config.server.corsOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: config.server.nodeEnv === "production" ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
      message: {
        status: "error",
        message: "Too many requests from this IP, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use("/api/", limiter);

    // Logging
    if (config.server.nodeEnv === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Compression
    this.app.use(compression());

    // Health check endpoint
    this.app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
        database: database.getConnectionStatus() ? "connected" : "disconnected",
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use("/api/v1", (req: Request, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "CRM API v1 is running",
        timestamp: new Date().toISOString(),
      });
    });

    // Handle undefined routes
    this.app.all("*", (req: Request, res: Response, next: NextFunction) => {
      next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(globalErrorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start server
      const server = this.app.listen(config.server.port, () => {
        console.log(`🚀 Server running on port ${config.server.port}`);
        console.log(`🌍 Environment: ${config.server.nodeEnv}`);
        console.log(
          `📊 Health check: http://localhost:${config.server.port}/health`
        );
        console.log(
          `🔗 API Base URL: http://localhost:${config.server.port}/api/v1`
        );
      });

      // Graceful shutdown
      const gracefulShutdown = async (signal: string) => {
        console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

        server.close(async () => {
          console.log("✅ HTTP server closed");
          await database.disconnect();
          console.log("✅ Database connection closed");
          process.exit(0);
        });

        // Force close server after 30 seconds
        setTimeout(() => {
          console.error(
            "❌ Could not close connections in time, forcefully shutting down"
          );
          process.exit(1);
        }, 30000);
      };

      process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
      process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new App();
app.start();

export default app;
