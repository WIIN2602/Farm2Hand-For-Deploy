import { supabase, type Farm2HandUser, type UserProfile } from '../lib/supabase';
import type { LoginCredentials, RegisterData } from '../types/auth';

// Hash password (in production, use proper bcrypt or similar)
const hashPassword = async (password: string): Promise<string> => {
  // Simple hash for demo - in production use proper password hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Verify password
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
};

// Convert database user to profile
const convertToUserProfile = (dbUser: Farm2HandUser): UserProfile => {
  return {
    id: dbUser.id,
    Name: dbUser.Name || '',
    Email: dbUser.Email || '',
    role: (dbUser.role as 'farmer' | 'customer') || 'customer',
    Phone: dbUser.Phone || undefined,
    Address: dbUser.Address || undefined,
    created_at: dbUser.created_at
  };
};

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<UserProfile> {
    try {
      // Find user by email
      const { data: users, error } = await supabase
        .from('Farm2Hand_user')
        .select('*')
        .eq('Email', credentials.email)
        .limit(1);

      if (error) {
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
      }

      if (!users || users.length === 0) {
        throw new Error('ไม่พบผู้ใช้งานนี้ในระบบ');
      }

      const user = users[0] as Farm2HandUser;

      // Verify password
      if (!user.Password) {
        throw new Error('ข้อมูลผู้ใช้งานไม่ถูกต้อง');
      }

      const isPasswordValid = await verifyPassword(credentials.password, user.Password);
      if (!isPasswordValid) {
        throw new Error('รหัสผ่านไม่ถูกต้อง');
      }

      return convertToUserProfile(user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  },

  // Register new user
  async register(data: RegisterData): Promise<UserProfile> {
    try {
      // Validate data
      if (data.password !== data.confirmPassword) {
        throw new Error('รหัสผ่านไม่ตรงกัน');
      }

      if (data.password.length < 6) {
        throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      }

      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('Farm2Hand_user')
        .select('Email')
        .eq('Email', data.email)
        .limit(1);

      if (checkError) {
        console.error('Database error:', checkError);
        throw new Error('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
      }

      // Check if phone already exists (if provided)
      if (data.phone) {
        const { data: existingPhone, error: phoneError } = await supabase
          .from('Farm2Hand_user')
          .select('Phone')
          .eq('Phone', data.phone)
          .limit(1);

        if (phoneError) {
          console.error('Database error:', phoneError);
          throw new Error('เกิดข้อผิดพลาดในการตรวจสอบเบอร์โทรศัพท์');
        }

        if (existingPhone && existingPhone.length > 0) {
          throw new Error('เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว');
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create new user
      const newUserData = {
        Name: data.name,
        Email: data.email,
        role: data.role,
        Phone: data.phone || null,
        Address: data.location || null,
        Password: hashedPassword
      };

      const { data: insertedUser, error: insertError } = await supabase
        .from('Farm2Hand_user')
        .insert([newUserData])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้');
      }

      return convertToUserProfile(insertedUser as Farm2HandUser);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  },

  // Update user profile
  async updateProfile(userId: number, updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile> {
    try {
      const updateData: Partial<Farm2HandUser> = {};
      
      if (updates.Name !== undefined) updateData.Name = updates.Name;
      if (updates.Email !== undefined) updateData.Email = updates.Email;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.Phone !== undefined) updateData.Phone = updates.Phone;
      if (updates.Address !== undefined) updateData.Address = updates.Address;

      const { data: updatedUser, error } = await supabase
        .from('Farm2Hand_user')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      }

      return convertToUserProfile(updatedUser as Farm2HandUser);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
  },

  // Get user by ID
  async getUserById(userId: number): Promise<UserProfile | null> {
    try {
      const { data: user, error } = await supabase
        .from('Farm2Hand_user')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
      }

      return convertToUserProfile(user as Farm2HandUser);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    }
  }
};