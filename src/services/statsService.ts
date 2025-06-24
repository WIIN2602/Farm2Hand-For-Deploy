import { supabase } from '../lib/supabase';

export interface AppStats {
  farmers: number;
  customers: number;
  products: number;
  averageRating: number;
}

export const statsService = {
  // Get application statistics from database
  async getAppStats(): Promise<AppStats> {
    try {
      // Get farmer count
      const { count: farmerCount, error: farmerError } = await supabase
        .from('Farm2Hand_user')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'farmer');

      if (farmerError) {
        console.error('Error fetching farmer count:', farmerError);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลเกษตรกร');
      }

      // Get customer count
      const { count: customerCount, error: customerError } = await supabase
        .from('Farm2Hand_user')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (customerError) {
        console.error('Error fetching customer count:', customerError);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า');
      }

      // Get product count
      const { count: productCount, error: productError } = await supabase
        .from('Farm2Hand_product')
        .select('*', { count: 'exact', head: true });

      if (productError) {
        console.error('Error fetching product count:', productError);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
      }

      // Get average rating (convert from integer to decimal and calculate average)
      const { data: ratingData, error: ratingError } = await supabase
        .from('Farm2Hand_product')
        .select('product_rating')
        .not('product_rating', 'is', null);

      if (ratingError) {
        console.error('Error fetching ratings:', ratingError);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลคะแนน');
      }

      // Calculate average rating
      let averageRating = 0;
      if (ratingData && ratingData.length > 0) {
        const totalRating = ratingData.reduce((sum, item) => {
          // Convert from integer (0-50) to decimal (0-5.0)
          const rating = item.product_rating ? item.product_rating / 10 : 0;
          return sum + rating;
        }, 0);
        
        averageRating = totalRating / ratingData.length;
        
        // Ensure the rating is between 0 and 5, with 2 decimal places
        averageRating = Math.min(Math.max(averageRating, 0), 5);
        averageRating = Math.round(averageRating * 100) / 100; // Round to 2 decimal places
      }

      return {
        farmers: farmerCount || 0,
        customers: customerCount || 0,
        products: productCount || 0,
        averageRating: averageRating
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ');
    }
  },

  // Format number for display (add + suffix for large numbers)
  formatCount(count: number): string {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)},${String(count % 1000).padStart(3, '0')}+`;
    }
    return count.toString();
  },

  // Format rating for display (always show 2 decimal places)
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }
};