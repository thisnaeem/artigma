// Simple authentication without Prisma for testing
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Simple in-memory storage (replace with database later)
const users = new Map();
const sessions = new Map();

export interface SimpleUser {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role: 'USER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

export async function createUser(email: string, password: string, name?: string): Promise<SimpleUser> {
  if (users.has(email)) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  const user: SimpleUser = {
    id: crypto.randomUUID(),
    email,
    name: name || null,
    password: hashedPassword,
    role: 'USER',
    status: 'PENDING',
  };

  users.set(email, user);
  return user;
}

export async function findUserByEmail(email: string): Promise<SimpleUser | null> {
  return users.get(email) || null;
}

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  sessions.set(token, { userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  return token;
}

export async function verifySession(token: string): Promise<SimpleUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const session = sessions.get(token);
    if (!session || session.expiresAt < new Date()) {
      sessions.delete(token);
      return null;
    }

    // Find user by ID
    const userEntries = Array.from(users.entries());
    for (const [email, user] of userEntries) {
      if (user.id === userId) {
        return user;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SimpleUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

// Initialize with a default admin user for testing
export async function initializeDefaultAdmin() {
  if (!users.has('admin@example.com')) {
    const hashedPassword = await hashPassword('admin123');
    const adminUser: SimpleUser = {
      id: crypto.randomUUID(),
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'APPROVED',
    };
    users.set('admin@example.com', adminUser);
    console.log('Default admin created: admin@example.com / admin123');
  }
}