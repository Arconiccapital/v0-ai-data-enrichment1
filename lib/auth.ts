import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"

// In production, this would be stored in a database
const MOCK_USERS = [
  {
    id: "1",
    email: "demo@lighthouse.ai",
    password: "$2a$10$K7L1OJ0TfmCkmqr7gNgQKOgY3jqZ7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7", // "demo123"
    name: "Demo User",
    role: "admin",
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // In production, fetch user from database
        const user = MOCK_USERS.find(u => u.email === credentials.email)
        
        if (!user) {
          return null
        }

        // For demo purposes, accept any password
        // In production, use: const isValid = await bcrypt.compare(credentials.password, user.password)
        const isValid = credentials.password === "demo123"
        
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),
    // OAuth providers (requires environment variables to be set)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "viewer"
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
}

// Type augmentation for TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: string
    }
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}

// Permission check utilities
export const ROLES = {
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
  OWNER: "owner",
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const PERMISSIONS = {
  VIEW_DASHBOARD: ["viewer", "editor", "admin", "owner"],
  EDIT_DASHBOARD: ["editor", "admin", "owner"],
  DELETE_DASHBOARD: ["admin", "owner"],
  SHARE_DASHBOARD: ["editor", "admin", "owner"],
  MANAGE_USERS: ["admin", "owner"],
  EXPORT_DATA: ["viewer", "editor", "admin", "owner"],
} as const

export function hasPermission(userRole: string | undefined, permission: keyof typeof PERMISSIONS): boolean {
  if (!userRole) return false
  return PERMISSIONS[permission].includes(userRole as any)
}