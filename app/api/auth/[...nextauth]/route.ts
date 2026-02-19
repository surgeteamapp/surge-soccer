import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Disabled due to DB connection issues
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('=== AUTH DEBUG ===');
        console.log('Email provided:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          console.log('User found:', user ? 'YES' : 'NO');
          console.log('User has password:', user?.password ? 'YES' : 'NO');

          if (!user) {
            console.log('User not found in database');
            return null;
          }

          if (!user.password) {
            console.log('User has no password set');
            throw new Error("Please sign in with the provider you used to register");
          }

          const isValidPassword = await compare(credentials.password, user.password);
          console.log('Password valid:', isValidPassword);

          if (!isValidPassword) {
            console.log('Invalid password');
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
          };
        } catch (dbError) {
          console.error('Database connection error:', dbError);
          
          // Fallback: Allow demo login for testing
          if (credentials.email === 'coxjuston04@gmail.com' && credentials.password === 'Call317470admin') {
            console.log('Using admin fallback login');
            return {
              id: 'admin-user',
              email: 'coxjuston04@gmail.com',
              name: 'Juston Cox',
              role: 'ADMIN',
            };
          }
          
          if (credentials.email === 'admin@surgesoccer.com' && credentials.password === 'admin123') {
            console.log('Using admin fallback login');
            return {
              id: 'admin-user-2',
              email: 'admin@surgesoccer.com',
              name: 'Admin User',
              role: 'ADMIN',
            };
          }
          
          if (credentials.email === 'admin@surge-soccer.com' && credentials.password === 'demo123') {
            console.log('Using demo fallback login');
            return {
              id: 'demo-user',
              email: 'admin@surge-soccer.com',
              name: 'Demo Admin',
              role: 'ADMIN',
            };
          }
          
          if (credentials.email === 'coach@surge-soccer.com' && credentials.password === 'demo123') {
            console.log('Using demo fallback login');
            return {
              id: 'demo-coach',
              email: 'coach@surge-soccer.com',
              name: 'Demo Coach',
              role: 'COACH',
            };
          }
          
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
