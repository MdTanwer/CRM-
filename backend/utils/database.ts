import mongoose from "mongoose";
import { config } from "./config";

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("Database already connected");
      return;
    }

    try {
      const mongooseOptions: mongoose.ConnectOptions = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      };

      await mongoose.connect(config.database.uri, mongooseOptions);

      this.isConnected = true;
      console.log("✅ MongoDB connected successfully");

      // Handle connection events
      this.setupEventListeners();
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("✅ MongoDB disconnected successfully");
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  private setupEventListeners(): void {
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      this.isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("🔄 Gracefully shutting down MongoDB connection...");
      await this.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("🔄 Gracefully shutting down MongoDB connection...");
      await this.disconnect();
      process.exit(0);
    });
  }
}

export const database = Database.getInstance();
