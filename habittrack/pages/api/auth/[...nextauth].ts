import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions = {
providers: [
  CredentialsProvider({
    
    name: "Credentials",
    credentials: {
      username: { label: "Email", type: "text", placeholder: "xyz@exmaple.com" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      // Add logic here to look up the user from the credentials supplied
      const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }
      if (user) {
        // Any object returned will be saved in `user` property of the JWT
        return user
      } else {
        // If you return null then an error will be displayed advising the user to check their details.
        return null

      }
    }
  })
]
}
export default NextAuth(authOptions);