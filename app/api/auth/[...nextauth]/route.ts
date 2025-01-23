import { authOptions } from '@/lib/auth-options';
import NextAuth from 'next-auth/next'

const handler = NextAuth({...authOptions, debug: true});

export {handler as GET, handler as POST}
