/*
  # Create customer data table

  1. New Tables
    - `Farm2Hand_customer_data`
      - `session_id` (int, primary key, auto-generated)
      - `id_user` (int, foreign key to Farm2Hand_user.id)
      - `favorites` (text, nullable, can store favorite products)
      - `following` (text, nullable, can store farmer names being followed)

  2. Security
    - Enable RLS on `Farm2Hand_customer_data` table
    - Add policy for users to access their own data

  3. Sample Data
    - Insert mockup data for existing customers
*/

-- Create the customer data table
CREATE TABLE IF NOT EXISTS public."Farm2Hand_customer_data" (
  session_id SERIAL PRIMARY KEY,
  id_user INTEGER NOT NULL,
  favorites TEXT,
  following TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_customer_user 
    FOREIGN KEY (id_user) 
    REFERENCES public."Farm2Hand_user"(id) 
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public."Farm2Hand_customer_data" ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own data
CREATE POLICY "Users can access own customer data"
  ON public."Farm2Hand_customer_data"
  FOR ALL
  USING (id_user = (current_setting('app.current_user_id', true))::integer);

-- Create policy for authenticated users (fallback)
CREATE POLICY "Authenticated users can access customer data"
  ON public."Farm2Hand_customer_data"
  FOR ALL
  TO authenticated
  USING (true);

-- Insert mockup data for customers
INSERT INTO public."Farm2Hand_customer_data" (id_user, favorites, following) VALUES
-- Customer 1: มาลี สุขใจ (customer@test.com)
(
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'customer@test.com' LIMIT 1),
  'มะม่วงน้ำดอกไม้,ผักกาดหอมออร์แกนิค,ข้าวหอมมะลิ,ไข่ไก่สด',
  'นายสมชาย ใจดี,นายประสิทธิ์ เกษตรกร,นายวิชัย ผักสด'
),
-- Customer 2: สุดา ช้อปปิ้ง (malee@gmail.com)
(
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'malee@gmail.com' LIMIT 1),
  'กล้วยหอมทอง,มะเขือเทศราชินี,แครอทเบบี้,ส้มโอขาวน้ำหวาน',
  'นายสมชาย ใจดี,นายวิชัย ผักสด'
),
-- Customer 3: นิตยา ผู้บริโภค (nitaya@yahoo.com)
(
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'nitaya@yahoo.com' LIMIT 1),
  'ผักบุ้ง,ผักชี,โหระพา,มะละกอ,ข้าวกล้อง',
  'นายประสิทธิ์ เกษตรกร,นายวิชัย ผักสด'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_data_user_id ON public."Farm2Hand_customer_data"(id_user);
CREATE INDEX IF NOT EXISTS idx_customer_data_created_at ON public."Farm2Hand_customer_data"(created_at);