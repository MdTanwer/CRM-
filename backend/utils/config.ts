import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  uri: string;
  name: string;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
}

interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
}

interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
  jwt: JWTConfig;
}

const validateEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    corsOrigin: process.env.FRONTEND_URL || "http://localhost:3000",
  },
  database: {
    uri: validateEnvVar(
      "MONGODB_URI",
      "mongodb://localhost:27017/crm_database"
    ),
    name: process.env.DATABASE_NAME || "crm_database",
  },
  jwt: {
    secret: validateEnvVar(
      "JWT_SECRET",
      "your-super-secret-jwt-key-change-in-production"
    ),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
};

// Log configuration in development
if (config.server.nodeEnv === "development") {
  console.log("🔧 Configuration loaded:", {
    port: config.server.port,
    nodeEnv: config.server.nodeEnv,
    databaseUri: config.database.uri.replace(/\/\/.*:.*@/, "//***:***@"), // Hide credentials
    jwtExpiresIn: config.jwt.expiresIn,
  });
}
