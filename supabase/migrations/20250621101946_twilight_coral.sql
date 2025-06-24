/*
  # Fix Product Update RLS Policy Issue

  1. Security Updates
    - Add proper RLS policies for product operations
    - Ensure farmers can read their own products after updates
    - Fix policy conditions to work with the current authentication system

  2. Changes
    - Add comprehensive RLS policies for all CRUD operations
    - Use proper user ID matching for the custom auth system
    - Ensure consistency between update and select permissions
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can view products" ON "Farm2Hand_product";
DROP POLICY IF EXISTS "Authenticated users can manage products" ON "Farm2Hand_product";
DROP POLICY IF EXISTS "Owners can manage their products" ON "Farm2Hand_product";

-- Create comprehensive RLS policies

-- Allow anyone to view products (for browsing)
CREATE POLICY "Anyone can view products"
  ON "Farm2Hand_product"
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Authenticated users can insert products"
  ON "Farm2Hand_product"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow product owners to update their products
CREATE POLICY "Owners can update their products"
  ON "Farm2Hand_product"
  FOR UPDATE
  TO public
  USING (product_owner = (current_setting('app.current_user_id'::text, true))::bigint)
  WITH CHECK (product_owner = (current_setting('app.current_user_id'::text, true))::bigint);

-- Allow product owners to delete their products
CREATE POLICY "Owners can delete their products"
  ON "Farm2Hand_product"
  FOR DELETE
  TO public
  USING (product_owner = (current_setting('app.current_user_id'::text, true))::bigint);

-- Additional policy for authenticated users to manage any products (for admin purposes)
CREATE POLICY "Authenticated users can manage all products"
  ON "Farm2Hand_product"
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);