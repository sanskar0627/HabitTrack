import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Create the NextAuth handler using the imported authOptions
const handler = NextAuth(authOptions);

// Export GET and POST for App Router
export { handler as GET, handler as POST };
