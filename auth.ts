import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback - user email:", user.email, "provider:", account?.provider);
      if (account?.provider === "google") {
        try {
          await connectDB();
          
          // Create or update user
          const dbUser = await User.findOneAndUpdate(
            { email: user.email },
            {
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
            },
            { upsert: true, new: true }
          );
          console.log("User created/updated in signIn:", dbUser._id.toString());
        } catch (error) {
          console.error("Error creating/updating user:", error);
          // Still allow sign in even if database update fails
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      console.log("JWT callback - trigger:", trigger, "user:", !!user, "account:", !!account, "token.userId:", token.userId, "token.email:", token.email);
      
      // On first sign in, fetch and store user ID
      if (user) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          console.log("JWT: Found dbUser for", user.email, ":", !!dbUser, "ID:", dbUser?._id?.toString());
          if (dbUser) {
            token.userId = dbUser._id.toString();
            console.log("JWT: Set token.userId to", token.userId);
          }
        } catch (error) {
          console.error("Error fetching user ID in JWT:", error);
        }
      }
      
      // If userId is missing but we have email, fetch it from database
      if (!token.userId && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          console.log("JWT: Fetching missing userId for", token.email, "found:", !!dbUser);
          if (dbUser) {
            token.userId = dbUser._id.toString();
            console.log("JWT: Set missing userId to", token.userId);
          }
        } catch (error) {
          console.error("Error fetching missing user ID:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token.userId:", token.userId);
      // Add user ID from token to session
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      console.log("Session user id:", session.user.id);
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
