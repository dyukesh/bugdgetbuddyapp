import { db } from "./db"

// This function can be used to reset the database if needed
export async function resetDatabase() {
  try {
    await db.delete()
    await db.open()
    console.log("Database has been reset")
    return true
  } catch (error) {
    console.error("Error resetting database:", error)
    return false
  }
}

// To use this function, you can call it from the browser console:
// import { resetDatabase } from '@/lib/reset-db';
// resetDatabase().then(() => window.location.reload());

