// lib/auth-options.ts
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prismadb";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "privy",
      name: "Privy Auth",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) {
          throw new Error("No wallet address provided");
        }

        // Check for existing user
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { walletAddress: credentials.walletAddress },
              { email: credentials.email }
            ]
          }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              walletAddress: credentials.walletAddress,
              email: credentials.email,
              username: credentials.username,
              name: credentials.name
            }
          });
        } else {
          // Update existing user with wallet if needed
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              walletAddress: credentials.walletAddress
            }
          });
        }

        return user;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        
        const user = await prisma.user.findUnique({
          where: { id: token.sub }
        });
        
        if (user) {
          session.user.walletAddress = user.walletAddress;
          session.user.username = user.username;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = user.walletAddress;
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt"
  },
  events: {
    async signOut({ token }) {
      // Clear any Privy-specific data if needed
      if (token?.walletAddress) {
        // You could add additional cleanup here if needed
        console.log("Clearing Privy session for wallet:", token.walletAddress);
      }
    }
  }
};