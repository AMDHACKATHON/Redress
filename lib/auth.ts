import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          // NOTE: never put `user.avatar` on the auth token — avatars are stored as
          // base64 data URLs in MongoDB and would balloon the JWT cookie past
          // Vercel's 8KB header limit (REQUEST_HEADER_TOO_LARGE / 494). Components
          // load the avatar from /api/profile via the zustand store instead.
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            avatar: user.image,
            password: '',
          });
        } else if (!existingUser.avatar && user.image) {
          existingUser.avatar = user.image;
          await existingUser.save();
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // Deliberately NOT storing avatar on the token — see note in `authorize`.
      }

      // Ensure we have the canonical DB id on the token (especially for Google sign-in
      // which initially gives us the Google account id). Avatar/country are NOT stored
      // here to keep the JWT cookie small — they're fetched from /api/profile client-side.
      if (account?.provider === 'google' || !token.id) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        // Do NOT copy avatar/country into the session. Heavy/changing fields belong
        // in the user record fetched via /api/profile, not in the cookie.
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  }
};

export async function getSessionUser(_req?: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      id: (session.user as any).id as string,
      email: session.user.email as string,
      name: (session.user.name as string) || ''
    };
  }

  return null;
}
