# Authentication System Setup Guide

## 🔧 **Installation Steps**

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Setup PostgreSQL Database**

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not already installed)
# On Windows: Download from https://www.postgresql.org/download/windows/
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql

# Create database
createdb artigma_db

# Or using psql
psql -U postgres
CREATE DATABASE artigma_db;
\q
```

**Option B: Docker PostgreSQL**
```bash
docker run --name artigma-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=artigma_db -p 5432:5432 -d postgres:15
```

### 3. **Environment Variables**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your values
DATABASE_URL="postgresql://username:password@localhost:5432/artigma_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 4. **Database Setup**
```bash
# Push the schema to database
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate
```

### 5. **Create First Admin User**
```bash
# Start the development server
npm run dev

# Go to http://localhost:3000/auth/signup
# Create your account
# Then manually update the database to make yourself admin:
```

**SQL to make first user admin:**
```sql
-- Connect to your database
psql -U username -d artigma_db

-- Find your user ID
SELECT id, email, role, status FROM users;

-- Update your user to be admin and approved
UPDATE users SET role = 'ADMIN', status = 'APPROVED' WHERE email = 'your-email@example.com';
```

## 🎯 **Features**

### **User Management**
- ✅ User registration with email/password
- ✅ Admin approval required for new users
- ✅ Role-based access (USER/ADMIN)
- ✅ User status management (PENDING/APPROVED/REJECTED/SUSPENDED)

### **Authentication**
- ✅ JWT-based sessions
- ✅ Secure password hashing with bcrypt
- ✅ Session management with database storage
- ✅ Automatic session cleanup

### **Admin Dashboard**
- ✅ User management interface at `/admin`
- ✅ Approve/reject pending users
- ✅ Suspend/reactivate users
- ✅ Promote users to admin
- ✅ Delete users

### **Security**
- ✅ Protected API routes
- ✅ Role-based access control
- ✅ Secure session management
- ✅ Password hashing

## 🔐 **Usage**

### **For Users**
1. **Sign Up**: Go to `/auth/signup` to create account
2. **Wait for Approval**: Admin must approve your account
3. **Sign In**: Once approved, sign in at `/auth/signin`
4. **Access Features**: Use all AI generation features

### **For Admins**
1. **Access Admin Panel**: Go to `/admin` (admin only)
2. **Manage Users**: Approve, reject, suspend users
3. **Promote Users**: Make other users admins
4. **Monitor Activity**: View user statistics

## 🛠️ **Database Commands**

```bash
# View database in browser
npm run db:studio

# Reset database (careful!)
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate
```

## 🚀 **Deployment Notes**

### **Environment Variables for Production**
- Set strong `JWT_SECRET`
- Use production PostgreSQL database
- Set `NODE_ENV=production`

### **Database Migration**
```bash
# For production, use migrations instead of db:push
npm run db:migrate
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL is correct
   - Ensure database exists

2. **Prisma Client Error**
   - Run `npx prisma generate`
   - Check schema.prisma syntax

3. **Authentication Not Working**
   - Check JWT_SECRET is set
   - Verify cookies are enabled
   - Check user status is APPROVED

### **Reset Everything**
```bash
# Stop development server
# Drop and recreate database
dropdb artigma_db
createdb artigma_db

# Push schema again
npm run db:push

# Restart development server
npm run dev
```

## 📊 **Database Schema**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  status    UserStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sessions  Session[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role {
  USER
  ADMIN
}

enum UserStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}
```

Your authentication system is now ready! 🎉