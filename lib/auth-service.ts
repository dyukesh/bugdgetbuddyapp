import { db } from "./db";
import type { User, Profile } from "./db/schema";

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ user: User }> {
    try {
      const users = await db?.users.where("email").equals(email).toArray();
      if (users?.length) {
        throw new Error("User already exists");
      }

      const userId = crypto.randomUUID();
      const newUser = {
        id: userId,
        email,
        password, // In a real app, you'd hash this
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies User;

      await db?.users.add(newUser);

      // Create initial profile
      await db?.profiles.add({
        userId,
        fullName: "",
        currency: "USD",
        language: "en",
        updatedAt: new Date(),
      });

      return { user: newUser };
    } catch (error) {
      console.error("Error in signUp:", error);
      throw error;
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User }> {
    try {
      const users = await db?.users.where("email").equals(email).toArray();
      const user = users?.[0];

      if (!user) {
        throw new Error("User not found");
      }
      if (user.password !== password) {
        throw new Error("Invalid password");
      }

      return { user };
    } catch (error) {
      console.error("Error in signIn:", error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    return true;
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const users = await db?.users.toArray();
      return users?.[0] || null;
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return null;
    }
  },

  // Get user profile
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const profiles = await db?.profiles
        .where("userId")
        .equals(userId)
        .toArray();
      return profiles?.[0] || null;
    } catch (error) {
      console.error("Error in getProfile:", error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: { fullName: string }) {
    try {
      const profiles = await db?.profiles
        .where("userId")
        .equals(userId)
        .toArray();
      const profile = profiles?.[0];

      if (profile) {
        await db?.profiles.update(profile.id!, {
          fullName: updates.fullName,
          updatedAt: new Date(),
        });
      } else {
        await db?.profiles.add({
          userId,
          fullName: updates.fullName,
          currency: "USD",
          language: "en",
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  },
};
