import { supabase, type Farm2HandCustomerData, type CustomerData } from '../lib/supabase';

// Convert database customer data to frontend format
const convertToCustomerData = (dbData: Farm2HandCustomerData): CustomerData => {
  return {
    sessionId: dbData.session_id,
    userId: dbData.id_user,
    favorites: dbData.favorites ? dbData.favorites.split(',').map(item => item.trim()) : [],
    following: dbData.following ? dbData.following.split(',').map(item => item.trim()) : [],
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  };
};

// Convert frontend customer data to database format
const convertToDbFormat = (data: Partial<CustomerData>): Partial<Farm2HandCustomerData> => {
  const dbData: Partial<Farm2HandCustomerData> = {};
  
  if (data.favorites !== undefined) {
    dbData.favorites = data.favorites.length > 0 ? data.favorites.join(',') : null;
  }
  
  if (data.following !== undefined) {
    dbData.following = data.following.length > 0 ? data.following.join(',') : null;
  }
  
  return dbData;
};

export const customerService = {
  // Get customer data by user ID
  async getCustomerData(userId: number): Promise<CustomerData | null> {
    try {
      const { data, error } = await supabase
        .from('Farm2Hand_customer_data')
        .select('*')
        .eq('id_user', userId)
        .limit(1);

      if (error) {
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า');
      }

      // Check if data array is empty (no customer data found)
      if (!data || data.length === 0) {
        return null;
      }

      return convertToCustomerData(data[0] as Farm2HandCustomerData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า');
    }
  },

  // Create customer data
  async createCustomerData(userId: number, data: Partial<CustomerData>): Promise<CustomerData> {
    try {
      const dbData = {
        id_user: userId,
        ...convertToDbFormat(data)
      };

      const { data: insertedData, error } = await supabase
        .from('Farm2Hand_customer_data')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลลูกค้า');
      }

      return convertToCustomerData(insertedData as Farm2HandCustomerData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลลูกค้า');
    }
  },

  // Update customer data
  async updateCustomerData(userId: number, updates: Partial<CustomerData>): Promise<CustomerData> {
    try {
      const dbUpdates = {
        ...convertToDbFormat(updates),
        updated_at: new Date().toISOString()
      };

      const { data: updatedData, error } = await supabase
        .from('Farm2Hand_customer_data')
        .update(dbUpdates)
        .eq('id_user', userId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลลูกค้า');
      }

      return convertToCustomerData(updatedData as Farm2HandCustomerData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลลูกค้า');
    }
  },

  // Add favorite item
  async addFavorite(userId: number, favoriteItem: string): Promise<CustomerData> {
    try {
      const currentData = await this.getCustomerData(userId);
      
      if (!currentData) {
        // Create new customer data with this favorite
        return await this.createCustomerData(userId, {
          favorites: [favoriteItem],
          following: []
        });
      }

      // Add to existing favorites if not already present
      const updatedFavorites = currentData.favorites.includes(favoriteItem)
        ? currentData.favorites
        : [...currentData.favorites, favoriteItem];

      return await this.updateCustomerData(userId, {
        favorites: updatedFavorites
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเพิ่มรายการโปรด');
    }
  },

  // Remove favorite item
  async removeFavorite(userId: number, favoriteItem: string): Promise<CustomerData> {
    try {
      const currentData = await this.getCustomerData(userId);
      
      if (!currentData) {
        throw new Error('ไม่พบข้อมูลลูกค้า');
      }

      const updatedFavorites = currentData.favorites.filter(item => item !== favoriteItem);

      return await this.updateCustomerData(userId, {
        favorites: updatedFavorites
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการลบรายการโปรด');
    }
  },

  // Follow farmer
  async followFarmer(userId: number, farmerName: string): Promise<CustomerData> {
    try {
      const currentData = await this.getCustomerData(userId);
      
      if (!currentData) {
        // Create new customer data with this following
        return await this.createCustomerData(userId, {
          favorites: [],
          following: [farmerName]
        });
      }

      // Add to existing following if not already present
      const updatedFollowing = currentData.following.includes(farmerName)
        ? currentData.following
        : [...currentData.following, farmerName];

      return await this.updateCustomerData(userId, {
        following: updatedFollowing
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการติดตามเกษตรกร');
    }
  },

  // Unfollow farmer
  async unfollowFarmer(userId: number, farmerName: string): Promise<CustomerData> {
    try {
      const currentData = await this.getCustomerData(userId);
      
      if (!currentData) {
        throw new Error('ไม่พบข้อมูลลูกค้า');
      }

      const updatedFollowing = currentData.following.filter(name => name !== farmerName);

      return await this.updateCustomerData(userId, {
        following: updatedFollowing
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเลิกติดตามเกษตรกร');
    }
  }
};