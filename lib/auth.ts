import { SignJWT, jwtVerify } from 'jose';
import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export async function signAccessToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(SECRET);
}

export async function signRefreshToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract and verify the Bearer token from an Authorization header.
 * Returns the decoded payload or null if invalid/missing.
 */
export async function getAuthUser(authHeader: string | null): Promise<TokenPayload | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyToken(token);
  if (!payload || payload.type !== 'access') return null;
  return payload;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        await connectDB();
        
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  }
};

/**
 * Combined helper to get the current user from either NextAuth session
 * or the legacy custom JWT Bearer token (for backward compatibility).
 */
export async function getSessionUser(req?: Request) {
  // 1. Try NextAuth session (Server Components/API Routes)
  // Note: getServerSession works without req in some contexts, but req is better for middleware/certain environments
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return { 
      id: (session.user as any).id as string, 
      email: session.user.email as string 
    };
  }

  // 2. Try Bearer token from Authorization header
  if (req) {
    const authHeader = req.headers.get('Authorization');
    const payload = await getAuthUser(authHeader);
    if (payload) {
      return { 
        id: payload.userId, 
        email: payload.email 
      };
    }
  }

  return null;
}
