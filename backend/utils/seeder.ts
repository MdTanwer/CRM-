import { database } from "./database";
import { User } from "../models/User";
import { config } from "./config";

export class DatabaseSeeder {
  public static async seedUsers(): Promise<void> {
    try {
      console.log("🌱 Seeding users...");

      // Check if users already exist
      const existingUsers = await User.countDocuments();
      if (existingUsers > 0) {
        console.log("✅ Users already exist, skipping seed");
        return;
      }

      // Create sample users
      const users = [
        {
          firstName: "Admin",
          lastName: "User",
          email: "admin@crm.com",
          password: "admin123456",
          role: "admin",
          emailVerified: true,
          isActive: true,
        },
        {
          firstName: "John",
          lastName: "Manager",
          email: "manager@crm.com",
          password: "manager123456",
          role: "manager",
          emailVerified: true,
          isActive: true,
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "user@crm.com",
          password: "user123456",
          role: "user",
          emailVerified: true,
          isActive: true,
        },
      ];

      await User.insertMany(users);
      console.log("✅ Users seeded successfully");
    } catch (error) {
      console.error("❌ Error seeding users:", error);
      throw error;
    }
  }

  public static async clearDatabase(): Promise<void> {
    try {
      console.log("🧹 Clearing database...");
      await User.deleteMany({});
      console.log("✅ Database cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing database:", error);
      throw error;
    }
  }

  public static async run(): Promise<void> {
    try {
      console.log("🚀 Starting database seeding...");

      // Connect to database
      await database.connect();

      // Seed data based on environment
      if (config.server.nodeEnv === "development") {
        await this.seedUsers();
      }

      console.log("✅ Database seeding completed");
    } catch (error) {
      console.error("❌ Database seeding failed:", error);
      process.exit(1);
    } finally {
      await database.disconnect();
    }
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  DatabaseSeeder.run();
}
