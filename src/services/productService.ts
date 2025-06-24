import { supabase } from '../lib/supabase';

// Database types
export interface Farm2HandProduct {
  id: number;
  product_name: string | null;
  product_price: number | null;
  product_unit: string | null;
  product_tag: string | null;
  product_organic: boolean | null;
  product_rating: number | null;
  product_owner: number | null;
  product_category: string | null;
  product_description: string | null;
  product_image: string | null;
  product_stock: number | null;
  product_reviews: number | null;
  product_discount: number | null;
  in_stock: boolean | null;
  created_at: string;
  updated_at: string;
}

// Frontend types
export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  farmer: string;
  farmerId: number;
  location: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  category: string;
  description: string;
  organic: boolean;
  discount?: number;
  tags: string[];
  stock: number;
}

// Category with count interface
export interface CategoryWithCount {
  name: string;
  count: number;
  icon: string;
  color: string;
}

// Create product data interface
export interface CreateProductData {
  name: string;
  price: number;
  unit: string;
  category: string;
  description: string;
  image: string;
  stock: number;
  organic: boolean;
  discount: number;
  tags: string[];
}

// Update product data interface
export interface UpdateProductData extends Partial<CreateProductData> {
  inStock?: boolean;
}

// User data for farmer info
interface FarmerInfo {
  id: number;
  Name: string;
  Address: string;
}

// Set user context for RLS policies
const setUserContext = async (userId: number) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.current_user_id',
    setting_value: userId.toString(),
    is_local: true
  });
};

// Convert database product to frontend format
const convertToProduct = (dbProduct: Farm2HandProduct, farmerInfo: FarmerInfo): Product => {
  // Simplified logic: Product is available if it has stock AND is marked as in_stock
  // Product is unavailable if it has no stock OR is manually closed by farmer
  const actualInStock = (dbProduct.product_stock || 0) > 0 && (dbProduct.in_stock !== false);
  
  return {
    id: dbProduct.id,
    name: dbProduct.product_name || '',
    price: dbProduct.product_price || 0,
    unit: dbProduct.product_unit || '',
    image: dbProduct.product_image || '',
    farmer: farmerInfo.Name || 'Unknown Farmer',
    farmerId: dbProduct.product_owner || 0,
    location: farmerInfo.Address || 'Unknown Location',
    rating: dbProduct.product_rating ? dbProduct.product_rating / 10 : 0, // Convert from integer to decimal
    reviews: dbProduct.product_reviews || 0,
    inStock: actualInStock,
    category: dbProduct.product_category || '',
    description: dbProduct.product_description || '',
    organic: dbProduct.product_organic || false,
    discount: dbProduct.product_discount || undefined,
    tags: dbProduct.product_tag ? dbProduct.product_tag.split(',').map(tag => tag.trim()) : [],
    stock: dbProduct.product_stock || 0
  };
};

// Convert create data to database format
const convertCreateDataToDb = (farmerId: number, data: CreateProductData): Partial<Farm2HandProduct> => {
  // Auto-set in_stock based on stock quantity
  const inStock = data.stock > 0;
  
  return {
    product_name: data.name,
    product_price: data.price,
    product_unit: data.unit,
    product_category: data.category,
    product_description: data.description,
    product_image: data.image,
    product_stock: data.stock,
    product_organic: data.organic,
    product_discount: data.discount > 0 ? data.discount : null,
    product_tag: data.tags.length > 0 ? data.tags.join(',') : null,
    product_owner: farmerId,
    product_rating: 45, // Default rating (4.5 out of 5)
    product_reviews: 0,
    in_stock: inStock,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const productService = {
  // Get all products with farmer information
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data: products, error } = await supabase
        .from('Farm2Hand_product')
        .select(`
          *,
          Farm2Hand_user!Farm2Hand_product_product_owner_fkey (
            id,
            Name,
            Address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
      }

      if (!products) {
        return [];
      }

      return products.map(product => {
        const farmerInfo = product.Farm2Hand_user as FarmerInfo;
        return convertToProduct(product as Farm2HandProduct, farmerInfo);
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data: products, error } = await supabase
        .from('Farm2Hand_product')
        .select(`
          *,
          Farm2Hand_user!Farm2Hand_product_product_owner_fkey (
            id,
            Name,
            Address
          )
        `)
        .eq('product_category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
      }

      if (!products) {
        return [];
      }

      return products.map(product => {
        const farmerInfo = product.Farm2Hand_user as FarmerInfo;
        return convertToProduct(product as Farm2HandProduct, farmerInfo);
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
    }
  },

  // Get products by farmer
  async getProductsByFarmer(farmerId: number): Promise<Product[]> {
    try {
      const { data: products, error } = await supabase
        .from('Farm2Hand_product')
        .select(`
          *,
          Farm2Hand_user!Farm2Hand_product_product_owner_fkey (
            id,
            Name,
            Address
          )
        `)
        .eq('product_owner', farmerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
      }

      if (!products) {
        return [];
      }

      return products.map(product => {
        const farmerInfo = product.Farm2Hand_user as FarmerInfo;
        return convertToProduct(product as Farm2HandProduct, farmerInfo);
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
    }
  },

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const { data: products, error } = await supabase
        .from('Farm2Hand_product')
        .select(`
          *,
          Farm2Hand_user!Farm2Hand_product_product_owner_fkey (
            id,
            Name,
            Address
          )
        `)
        .or(`product_name.ilike.%${searchTerm}%,product_description.ilike.%${searchTerm}%,product_tag.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการค้นหาสินค้า');
      }

      if (!products) {
        return [];
      }

      return products.map(product => {
        const farmerInfo = product.Farm2Hand_user as FarmerInfo;
        return convertToProduct(product as Farm2HandProduct, farmerInfo);
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการค้นหาสินค้า');
    }
  },

  // Get product by ID
  async getProductById(productId: number): Promise<Product | null> {
    try {
      const { data: product, error } = await supabase
        .from('Farm2Hand_product')
        .select(`
          *,
          Farm2Hand_user!Farm2Hand_product_product_owner_fkey (
            id,
            Name,
            Address
          )
        `)
        .eq('id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Product not found
        }
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
      }

      const farmerInfo = product.Farm2Hand_user as FarmerInfo;
      return convertToProduct(product as Farm2HandProduct, farmerInfo);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
    }
  },

  // Create new product
  async createProduct(farmerId: number, productData: CreateProductData): Promise<Product> {
    try {
      // Set user context for RLS
      await setUserContext(farmerId);

      const dbData = convertCreateDataToDb(farmerId, productData);

      const { data: insertedProduct, error } = await supabase
        .from('Farm2Hand_product')
        .insert([dbData])
        .select(`
          *,
          Farm2Hand_user!Farm2Hand_product_product_owner_fkey (
            id,
            Name,
            Address
          )
        `)
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw new Error('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
      }

      const farmerInfo = insertedProduct.Farm2Hand_user as FarmerInfo;
      return convertToProduct(insertedProduct as Farm2HandProduct, farmerInfo);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
  },

  // Update product with simplified stock management
  async updateProduct(productId: number, farmerId: number, updates: UpdateProductData): Promise<Product> {
    try {
      // Set user context for RLS
      await setUserContext(farmerId);

      // Verify ownership
      const { data: existingProduct, error: ownershipError } = await supabase
        .from('Farm2Hand_product')
        .select('product_owner, product_stock')
        .eq('id', productId)
        .single();

      if (ownershipError) {
        console.error('Ownership check error:', ownershipError);
        throw new Error('ไม่พบสินค้าที่ต้องการแก้ไข');
      }

      if (existingProduct.product_owner !== farmerId) {
        throw new Error('คุณไม่มีสิทธิ์แก้ไขสินค้านี้');
      }

      // Prepare update data
      const updateData: Partial<Farm2HandProduct> = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) updateData.product_name = updates.name;
      if (updates.price !== undefined) updateData.product_price = updates.price;
      if (updates.unit !== undefined) updateData.product_unit = updates.unit;
      if (updates.category !== undefined) updateData.product_category = updates.category;
      if (updates.description !== undefined) updateData.product_description = updates.description;
      if (updates.image !== undefined) updateData.product_image = updates.image;
      if (updates.organic !== undefined) updateData.product_organic = updates.organic;
      if (updates.discount !== undefined) updateData.product_discount = updates.discount > 0 ? updates.discount : null;
      if (updates.tags !== undefined) updateData.product_tag = updates.tags.length > 0 ? updates.tags.join(',') : null;

      // Handle stock updates with automatic in_stock management
      if (updates.stock !== undefined) {
        updateData.product_stock = updates.stock;
        // Auto-set in_stock based on stock quantity
        updateData.in_stock = updates.stock > 0;
      }

      // Handle manual in_stock toggle (farmer clicking button)
      if (updates.inStock !== undefined) {
        const currentStock = existingProduct.product_stock || 0;
        
        if (updates.inStock === true) {
          // Farmer wants to open for sale
          if (currentStock > 0) {
            // Stock available - allow opening for sale
            updateData.in_stock = true;
          } else {
            // No stock - cannot open for sale, force to false
            updateData.in_stock = false;
            throw new Error('ไม่สามารถเปิดขายได้เนื่องจากสินค้าหมด กรุณาเพิ่มสต็อกก่อน');
          }
        } else {
          // Farmer wants to close for sale - always allow
          updateData.in_stock = false;
        }
      }

      // Update the product
      const { data: updatedProducts, error } = await supabase
        .from('Farm2Hand_product')
        .update(updateData)
        .eq('id', productId)
        .select('*');

      if (error) {
        console.error('Update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
      }

      if (!updatedProducts || updatedProducts.length === 0) {
        // If the update didn't return data, try to fetch the product separately
        const { data: refetchedProduct, error: refetchError } = await supabase
          .from('Farm2Hand_product')
          .select('*')
          .eq('id', productId)
          .single();

        if (refetchError || !refetchedProduct) {
          console.error('Refetch error:', refetchError);
          throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าที่อัปเดต');
        }

        // Fetch farmer information separately
        const { data: farmerData, error: farmerError } = await supabase
          .from('Farm2Hand_user')
          .select('id, Name, Address')
          .eq('id', refetchedProduct.product_owner)
          .single();

        if (farmerError) {
          console.error('Farmer fetch error:', farmerError);
          throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลเกษตรกร');
        }

        const farmerInfo: FarmerInfo = farmerData;
        return convertToProduct(refetchedProduct as Farm2HandProduct, farmerInfo);
      }

      const updatedProduct = updatedProducts[0] as Farm2HandProduct;

      // Fetch farmer information separately
      const { data: farmerData, error: farmerError } = await supabase
        .from('Farm2Hand_user')
        .select('id, Name, Address')
        .eq('id', updatedProduct.product_owner)
        .single();

      if (farmerError) {
        console.error('Farmer fetch error:', farmerError);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลเกษตรกร');
      }

      const farmerInfo: FarmerInfo = farmerData;
      return convertToProduct(updatedProduct, farmerInfo);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
    }
  },

  // Toggle stock status with simplified logic (only two states)
  async toggleProductStock(productId: number, farmerId: number): Promise<Product> {
    try {
      // Get current product state
      const { data: currentProduct, error: fetchError } = await supabase
        .from('Farm2Hand_product')
        .select('product_owner, product_stock, in_stock')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error('ไม่พบสินค้าที่ต้องการแก้ไข');
      }

      if (currentProduct.product_owner !== farmerId) {
        throw new Error('คุณไม่มีสิทธิ์แก้ไขสินค้านี้');
      }

      const currentStock = currentProduct.product_stock || 0;
      const currentInStock = currentProduct.in_stock;

      let newInStock: boolean;
      let errorMessage: string | null = null;

      // Simplified logic: If currently available (green), make unavailable (red)
      // If currently unavailable (red), try to make available (green) if stock exists
      if (currentStock > 0 && currentInStock) {
        // Currently available - farmer wants to close sale
        newInStock = false;
      } else if (currentStock > 0 && !currentInStock) {
        // Currently closed but has stock - farmer wants to open sale
        newInStock = true;
      } else {
        // No stock - cannot open for sale
        newInStock = false;
        errorMessage = 'ไม่สามารถเปิดขายได้เนื่องจากสินค้าหมด กรุณาเพิ่มสต็อกก่อน';
      }

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      // Update the product
      return await this.updateProduct(productId, farmerId, { inStock: newInStock });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะสินค้า');
    }
  },

  // Process product purchase (reduce stock)
  async purchaseProduct(productId: number, quantity: number): Promise<Product> {
    try {
      // Get current product state
      const { data: currentProduct, error: fetchError } = await supabase
        .from('Farm2Hand_product')
        .select(`
          *,
          Farm2Hand_user!Farm2Hand_product_product_owner_fkey (
            id,
            Name,
            Address
          )
        `)
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error('ไม่พบสินค้าที่ต้องการซื้อ');
      }

      const currentStock = currentProduct.product_stock || 0;
      const newStock = currentStock - quantity;

      if (newStock < 0) {
        throw new Error('สินค้าไม่เพียงพอ');
      }

      // Update stock and auto-manage in_stock status
      const updateData: Partial<Farm2HandProduct> = {
        product_stock: newStock,
        in_stock: newStock > 0 && currentProduct.in_stock, // Keep current in_stock preference if stock available
        updated_at: new Date().toISOString()
      };

      const { data: updatedProducts, error: updateError } = await supabase
        .from('Farm2Hand_product')
        .update(updateData)
        .eq('id', productId)
        .select(`
          *,
          Farm2Hand_user!Farm2Hand_product_product_owner_fkey (
            id,
            Name,
            Address
          )
        `);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตสต็อกสินค้า');
      }

      if (!updatedProducts || updatedProducts.length === 0) {
        throw new Error('ไม่พบสินค้าที่อัปเดต');
      }

      const updatedProduct = updatedProducts[0];
      const farmerInfo = updatedProduct.Farm2Hand_user as FarmerInfo;
      return convertToProduct(updatedProduct as Farm2HandProduct, farmerInfo);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการซื้อสินค้า');
    }
  },

  // Delete product
  async deleteProduct(productId: number, farmerId: number): Promise<void> {
    try {
      // Set user context for RLS
      await setUserContext(farmerId);

      // Verify ownership
      const { data: existingProduct, error: ownershipError } = await supabase
        .from('Farm2Hand_product')
        .select('product_owner')
        .eq('id', productId)
        .single();

      if (ownershipError) {
        console.error('Ownership check error:', ownershipError);
        throw new Error('ไม่พบสินค้าที่ต้องการลบ');
      }

      if (existingProduct.product_owner !== farmerId) {
        throw new Error('คุณไม่มีสิทธิ์ลบสินค้านี้');
      }

      const { error } = await supabase
        .from('Farm2Hand_product')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Delete error:', error);
        throw new Error('เกิดข้อผิดพลาดในการลบสินค้า');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  },

  // Get available categories
  async getCategories(): Promise<string[]> {
    try {
      const { data: categories, error } = await supabase
        .from('Farm2Hand_product')
        .select('product_category')
        .not('product_category', 'is', null);

      if (error) {
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่');
      }

      if (!categories) {
        return [];
      }

      // Get unique categories
      const uniqueCategories = [...new Set(categories.map(item => item.product_category).filter(Boolean))];
      return uniqueCategories;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่');
    }
  },

  // Get categories with product counts
  async getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
    try {
      const { data: categoryCounts, error } = await supabase
        .from('Farm2Hand_product')
        .select('product_category')
        .not('product_category', 'is', null);

      if (error) {
        console.error('Database error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่');
      }

      if (!categoryCounts) {
        return [];
      }

      // Count products by category
      const categoryCountMap = categoryCounts.reduce((acc, item) => {
        const category = item.product_category;
        if (category) {
          acc[category] = (acc[category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Define category icons and colors - matching actual database values
      const categoryConfig: Record<string, { icon: string; color: string }> = {
        // English categories (from database)
        'Fruits': { icon: '🍇', color: 'bg-purple-100 text-purple-700' },
        'Fresh Vegetables': { icon: '🥕', color: 'bg-orange-100 text-orange-700' },
        'Rice': { icon: '🌾', color: 'bg-yellow-100 text-yellow-700' },
        'Eggs': { icon: '🥚', color: 'bg-blue-100 text-blue-700' },
        'Out-of-Season Products': { icon: '❄️', color: 'bg-pink-100 text-pink-700' },
        
        // Thai categories (fallback)
        'ผลไม้': { icon: '🍇', color: 'bg-purple-100 text-purple-700' },
        'ผัก': { icon: '🥕', color: 'bg-orange-100 text-orange-700' },
        'ผักใบเขียว': { icon: '🥕', color: 'bg-green-100 text-green-700' },
        'ข้าว': { icon: '🌾', color: 'bg-yellow-100 text-yellow-700' },
        'ไข่': { icon: '🥚', color: 'bg-blue-100 text-blue-700' },
        'ผลไม้นอกฤดู': { icon: '❄️', color: 'bg-pink-100 text-pink-700' },
        'สมุนไพร': { icon: '🌿', color: 'bg-emerald-100 text-emerald-700' },
        'อื่นๆ': { icon: '🛒', color: 'bg-gray-100 text-gray-700' }
      };

      // Convert to CategoryWithCount array
      const categoriesWithCounts: CategoryWithCount[] = Object.entries(categoryCountMap).map(([name, count]) => {
        // Try exact match first, then case-insensitive match
        let config = categoryConfig[name];
        if (!config) {
          // Try case-insensitive match
          const lowerName = name.toLowerCase();
          const matchingKey = Object.keys(categoryConfig).find(key => 
            key.toLowerCase() === lowerName
          );
          config = matchingKey ? categoryConfig[matchingKey] : null;
        }
        
        return {
          name,
          count,
          icon: config?.icon || '🛒',
          color: config?.color || 'bg-gray-100 text-gray-700'
        };
      });

      // Sort by count (descending) then by name
      categoriesWithCounts.sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.name.localeCompare(b.name);
      });

      return categoriesWithCounts;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่');
    }
  }
};