import { supabase, type Farm2HandCustomerData, type CustomerData } from '../lib/supabase';

// Set user context for RLS policies
const setUserContext = async (userId: number) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.current_user_id',
    setting_value: userId.toString(),
    is_local: true
  });
};

// Convert database customer data to frontend format
const convertToCustomerData = (dbData: Farm2HandCustomerData): CustomerData => {
  return {
    sessionId: dbData.session_id,
    userId: dbData.id_user,
    favorites: dbData.favorites ? dbData.favorites.split(',').map(item => item.trim()).filter(Boolean) : [],
    following: dbData.following ? dbData.following.split(',').map(item => item.trim()).filter(Boolean) : [],
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
  
  dbData.updated_at = new Date().toISOString();
  
  return dbData;
};

export const customerService = {
  // Get customer data by user ID
  async getCustomerData(userId: number): Promise<CustomerData | null> {
    try {
      // Set user context for RLS
      await setUserContext(userId);

      const { data, error } = await supabase
        .from('Farm2Hand_customer_data')
        .select('*')
        .eq('id_user', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No data found
        }
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า');
      }

      return convertToCustomerData(data as Farm2HandCustomerData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า');
    }
  },

  // Create customer data
  async createCustomerData(userId: number, data: { favorites: string[]; following: string[] }): Promise<CustomerData> {
    try {
      // Set user context for RLS
      await setUserContext(userId);

      const dbData = {
        id_user: userId,
        favorites: data.favorites.length > 0 ? data.favorites.join(',') : null,
        following: data.following.length > 0 ? data.following.join(',') : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

  // Add favorite product
  async addFavorite(userId: number, productName: string): Promise<CustomerData> {
    try {
      // Set user context for RLS
      await setUserContext(userId);

      // Get current data
      const currentData = await this.getCustomerData(userId);
      
      if (!currentData) {
        // Create new customer data with this favorite
        return await this.createCustomerData(userId, {
          favorites: [productName],
          following: []
        });
      }

      // Check if already in favorites
      if (currentData.favorites.includes(productName)) {
        return currentData; // Already in favorites
      }

      // Add to favorites
      const updatedFavorites = [...currentData.favorites, productName];
      const dbData = convertToDbFormat({ favorites: updatedFavorites });

      const { data: updatedData, error } = await supabase
        .from('Farm2Hand_customer_data')
        .update(dbData)
        .eq('id_user', userId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการเพิ่มรายการโปรด');
      }

      return convertToCustomerData(updatedData as Farm2HandCustomerData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเพิ่มรายการโปรด');
    }
  },

  // Remove favorite product
  async removeFavorite(userId: number, productName: string): Promise<CustomerData> {
    try {
      // Set user context for RLS
      await setUserContext(userId);

      // Get current data
      const currentData = await this.getCustomerData(userId);
      
      if (!currentData) {
        throw new Error('ไม่พบข้อมูลลูกค้า');
      }

      // Remove from favorites
      const updatedFavorites = currentData.favorites.filter(fav => fav !== productName);
      const dbData = convertToDbFormat({ favorites: updatedFavorites });

      const { data: updatedData, error } = await supabase
        .from('Farm2Hand_customer_data')
        .update(dbData)
        .eq('id_user', userId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการลบรายการโปรด');
      }

      return convertToCustomerData(updatedData as Farm2HandCustomerData);
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
      // Set user context for RLS
      await setUserContext(userId);

      // Get current data
      const currentData = await this.getCustomerData(userId);
      
      if (!currentData) {
        // Create new customer data with this following
        return await this.createCustomerData(userId, {
          favorites: [],
          following: [farmerName]
        });
      }

      // Check if already following
      if (currentData.following.includes(farmerName)) {
        return currentData; // Already following
      }

      // Add to following
      const updatedFollowing = [...currentData.following, farmerName];
      const dbData = convertToDbFormat({ following: updatedFollowing });

      const { data: updatedData, error } = await supabase
        .from('Farm2Hand_customer_data')
        .update(dbData)
        .eq('id_user', userId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการติดตามเกษตรกร');
      }

      return convertToCustomerData(updatedData as Farm2HandCustomerData);
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
      // Set user context for RLS
      await setUserContext(userId);

      // Get current data
      const currentData = await this.getCustomerData(userId);
      
      if (!currentData) {
        throw new Error('ไม่พบข้อมูลลูกค้า');
      }

      // Remove from following
      const updatedFollowing = currentData.following.filter(farmer => farmer !== farmerName);
      const dbData = convertToDbFormat({ following: updatedFollowing });

      const { data: updatedData, error } = await supabase
        .from('Farm2Hand_customer_data')
        .update(dbData)
        .eq('id_user', userId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการเลิกติดตามเกษตรกร');
      }

      return convertToCustomerData(updatedData as Farm2HandCustomerData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเลิกติดตามเกษตรกร');
    }
  },

  // Update customer data
  async updateCustomerData(userId: number, updates: Partial<CustomerData>): Promise<CustomerData> {
    try {
      // Set user context for RLS
      await setUserContext(userId);

      const dbData = convertToDbFormat(updates);

      const { data: updatedData, error } = await supabase
        .from('Farm2Hand_customer_data')
        .update(dbData)
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
  }
};