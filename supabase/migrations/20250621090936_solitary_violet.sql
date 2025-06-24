/*
  # Insert Mockup Product Data for Farm2Hand_product Table

  1. Product Categories
    - Fresh vegetables (5 products)
    - Fruits (5 products)
    - Rice (5 products)
    - Eggs (5 products)
    - Out-of-season products (5 products)

  2. Additional Columns
    - product_description (text, product descriptions)
    - product_image (text, image URLs)
    - product_stock (integer, stock quantity)
    - product_reviews (integer, number of reviews)
    - product_discount (integer, discount percentage)

  3. Sample Data
    - Realistic Thai agricultural products
    - Proper pricing and stock levels
    - Farmer ownership from existing users
*/

-- Add additional columns for better product data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Farm2Hand_product' AND column_name = 'product_description'
  ) THEN
    ALTER TABLE public."Farm2Hand_product" ADD COLUMN product_description text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Farm2Hand_product' AND column_name = 'product_image'
  ) THEN
    ALTER TABLE public."Farm2Hand_product" ADD COLUMN product_image text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Farm2Hand_product' AND column_name = 'product_stock'
  ) THEN
    ALTER TABLE public."Farm2Hand_product" ADD COLUMN product_stock integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Farm2Hand_product' AND column_name = 'product_reviews'
  ) THEN
    ALTER TABLE public."Farm2Hand_product" ADD COLUMN product_reviews integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Farm2Hand_product' AND column_name = 'product_discount'
  ) THEN
    ALTER TABLE public."Farm2Hand_product" ADD COLUMN product_discount integer;
  END IF;
END $$;

-- Insert Fresh Vegetables (5 products)
INSERT INTO public."Farm2Hand_product" (
  product_name, product_price, product_unit, product_tag, product_organic, 
  product_rating, product_owner, product_category, product_description, 
  product_image, product_stock, product_reviews, product_discount, in_stock
) VALUES
(
  'ผักกาดหอมออร์แกนิค',
  45,
  'ถุง',
  'ปลอดสารพิษ,สดใหม่,ออร์แกนิค',
  true,
  49,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ผักใบเขียว',
  'ผักกาดหอมปลอดสารพิษ ปลูกด้วยวิธีธรรมชาติ เก็บสดใหม่ในตอนเช้า',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  25,
  203,
  null,
  true
),
(
  'ผักบุ้งจีน',
  25,
  'ถุง',
  'สดใหม่,กรอบ,ออร์แกนิค',
  true,
  46,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ผักใบเขียว',
  'ผักบุ้งจีนสดใหม่ เก็บในตอนเช้า กรอบหวาน ปลอดสารพิษ',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  30,
  76,
  null,
  true
),
(
  'คะน้า',
  35,
  'ถุง',
  'สดใหม่,หวาน,ออร์แกนิค',
  true,
  47,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ผักใบเขียว',
  'คะน้าสดใหม่ หวานกรอบ ปลูกแบบออร์แกนิค',
  'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=400',
  20,
  89,
  null,
  true
),
(
  'ผักชี',
  20,
  'ถุง',
  'หอม,สดใหม่,ออร์แกนิค',
  true,
  45,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ผักใบเขียว',
  'ผักชีหอมสดใหม่ ใบเขียวสวย เหมาะสำหรับปรุงอาหาร',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  40,
  112,
  null,
  true
),
(
  'ต้นหอม',
  15,
  'ถุง',
  'หอม,สดใหม่,ออร์แกนิค',
  true,
  44,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ผักใบเขียว',
  'ต้นหอมสดใหม่ หอมกรุ่น เก็บใหม่ทุกวัน',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  35,
  67,
  null,
  true
);

-- Insert Fruits (5 products)
INSERT INTO public."Farm2Hand_product" (
  product_name, product_price, product_unit, product_tag, product_organic, 
  product_rating, product_owner, product_category, product_description, 
  product_image, product_stock, product_reviews, product_discount, in_stock
) VALUES
(
  'มะม่วงน้ำดอกไม้',
  120,
  'กก.',
  'หวาน,สดใหม่,ออร์แกนิค',
  true,
  48,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'farmer@test.com' LIMIT 1),
  'ผลไม้',
  'มะม่วงน้ำดอกไม้สดใหม่ หวานฉ่ำ เก็บจากต้นในวันเดียวกัน',
  'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg?auto=compress&cs=tinysrgb&w=400',
  15,
  156,
  10,
  true
),
(
  'กล้วยหอมทอง',
  60,
  'หวี',
  'หวาน,สุกพอดี,หอม',
  false,
  46,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'farmer@test.com' LIMIT 1),
  'ผลไม้',
  'กล้วยหอมทองหวานหอม เนื้อนุ่ม สุกพอดี',
  'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400',
  25,
  124,
  5,
  true
),
(
  'มะละกอ',
  40,
  'ลูก',
  'หวาน,สดใหม่,คุณภาพดี',
  false,
  47,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'farmer@test.com' LIMIT 1),
  'ผลไม้',
  'มะละกอหวานฉ่ำ เนื้อส้มสวย เหมาะทำส้มตำ',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  18,
  98,
  null,
  true
),
(
  'แก้วมังกร',
  80,
  'กก.',
  'หวาน,สดใหม่,คุณภาพดี',
  false,
  45,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'farmer@test.com' LIMIT 1),
  'ผลไม้',
  'แก้วมังกรเนื้อขาว หวานเซาะ เก็บสดใหม่',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  12,
  87,
  null,
  true
),
(
  'ส้มโอขาวน้ำหวาน',
  150,
  'ลูก',
  'หวาน,ฉ่ำ,คุณภาพดี',
  false,
  49,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ผลไม้',
  'ส้มโอขาวน้ำหวาน เนื้อฉ่ำ หวานเข้มข้น',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  0,
  134,
  null,
  false
);

-- Insert Rice (5 products)
INSERT INTO public."Farm2Hand_product" (
  product_name, product_price, product_unit, product_tag, product_organic, 
  product_rating, product_owner, product_category, product_description, 
  product_image, product_stock, product_reviews, product_discount, in_stock
) VALUES
(
  'ข้าวหอมมะลิ',
  45,
  'กก.',
  'หอม,หวาน,เก็บใหม่',
  false,
  49,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ข้าว',
  'ข้าวหอมมะลิแท้ 100% หอมหวาน เก็บใหม่ คุณภาพพรีเมียม',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  100,
  245,
  null,
  true
),
(
  'ข้าวกล้อง',
  55,
  'กก.',
  'สุขภาพดี,ไฟเบอร์สูง,ออร์แกนิค',
  true,
  47,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ข้าว',
  'ข้าวกล้องออร์แกนิค ดีต่อสุขภาพ ไฟเบอร์สูง',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  80,
  178,
  null,
  true
),
(
  'ข้าวเหนียว',
  50,
  'กก.',
  'เหนียวนุ่ม,หอม,คุณภาพดี',
  false,
  46,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ข้าว',
  'ข้าวเหนียวขาวนุ่ม เหนียวหอม เหมาะทำขนมไทย',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  60,
  134,
  null,
  true
),
(
  'ข้าวแดง',
  65,
  'กก.',
  'สุขภาพดี,หายาก,ออร์แกนิค',
  true,
  48,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ข้าว',
  'ข้าวแดงออร์แกนิค หายาก ดีต่อสุขภาพ',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  40,
  89,
  null,
  true
),
(
  'ข้าวดำ',
  75,
  'กก.',
  'สุขภาพดี,แอนติออกซิแดนท์,ออร์แกนิค',
  true,
  47,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ข้าว',
  'ข้าวดำออร์แกนิค อุดมด้วยแอนติออกซิแดนท์ ดีต่อสุขภาพ',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  30,
  67,
  null,
  true
);

-- Insert Eggs (5 products)
INSERT INTO public."Farm2Hand_product" (
  product_name, product_price, product_unit, product_tag, product_organic, 
  product_rating, product_owner, product_category, product_description, 
  product_image, product_stock, product_reviews, product_discount, in_stock
) VALUES
(
  'ไข่ไก่สด',
  120,
  'แผง',
  'สดใหม่,ไก่ปล่อย,ออร์แกนิค',
  true,
  47,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'farmer@test.com' LIMIT 1),
  'ไข่',
  'ไข่ไก่สดใหม่ เก็บในวันเดียวกัน ไก่เลี้ยงแบบปล่อย',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  50,
  98,
  null,
  true
),
(
  'ไข่ไก่ออร์แกนิค',
  150,
  'แผง',
  'ออร์แกนิค,ปลอดสารพิษ,คุณภาพสูง',
  true,
  48,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ไข่',
  'ไข่ไก่ออร์แกนิค 100% ปลอดสารพิษ คุณภาพสูง',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  30,
  156,
  null,
  true
),
(
  'ไข่ไก่ฟาร์ม',
  100,
  'แผง',
  'สดใหม่,ฟาร์มสะอาด,คุณภาพดี',
  false,
  46,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'farmer@test.com' LIMIT 1),
  'ไข่',
  'ไข่ไก่สดจากฟาร์ม เลี้ยงในสภาพแวดล้อมที่สะอาด',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  40,
  123,
  null,
  true
),
(
  'ไข่เป็ด',
  80,
  'แผง',
  'สดใหม่,รสชาติเข้มข้น,คุณภาพดี',
  false,
  45,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ไข่',
  'ไข่เป็ดสดใหม่ รสชาติเข้มข้น เหมาะทำขนมไทย',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  25,
  87,
  null,
  true
),
(
  'ไข่นกกระทา',
  60,
  'แผง',
  'สดใหม่,ขนาดเล็ก,คุณภาพดี',
  false,
  44,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ไข่',
  'ไข่นกกระทาสดใหม่ ขนาดเล็กน่ารัก รสชาติเข้มข้น',
  'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400',
  35,
  76,
  null,
  true
);

-- Insert Out-of-season products (5 products)
INSERT INTO public."Farm2Hand_product" (
  product_name, product_price, product_unit, product_tag, product_organic, 
  product_rating, product_owner, product_category, product_description, 
  product_image, product_stock, product_reviews, product_discount, in_stock
) VALUES
(
  'สตรอเบอร์รี่นอกฤดู',
  200,
  'กล่อง',
  'หวาน,นอกฤดู,นำเข้า',
  false,
  46,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'farmer@test.com' LIMIT 1),
  'ผลไม้นอกฤดู',
  'สตรอเบอร์รี่นอกฤดูกาล หวานฉ่ำ คุณภาพพรีเมียม',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  8,
  89,
  null,
  true
),
(
  'ทุเรียนนอกฤดู',
  300,
  'กก.',
  'หอม,ครีมมี่,นอกฤดู',
  false,
  48,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ผลไม้นอกฤดู',
  'ทุเรียนนอกฤดูกาล เนื้อครีมมี่ หอมหวาน',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  5,
  67,
  null,
  true
),
(
  'ลำไยนอกฤดู',
  180,
  'กก.',
  'หวาน,ฉ่ำ,นอกฤดู',
  false,
  47,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ผลไม้นอกฤดู',
  'ลำไยนอกฤดูกาล หวานฉ่ำ เนื้อใส',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  10,
  98,
  null,
  true
),
(
  'ลิ้นจี่นอกฤดู',
  220,
  'กก.',
  'หวาน,หอม,นอกฤดู',
  false,
  45,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'farmer@test.com' LIMIT 1),
  'ผลไม้นอกฤดู',
  'ลิ้นจี่นอกฤดูกาล หวานหอม เนื้อใสฉ่ำ',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  6,
  76,
  null,
  true
),
(
  'มังคุดนอกฤดู',
  250,
  'กก.',
  'หวาน,เปรี้ยว,นอกฤดู',
  false,
  49,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ผลไม้นอกฤดู',
  'มังคุดนอกฤดูกาล หวานเปรี้ยว เนื้อขาวฉ่ำ',
  'https://images.pexels.com/photos/1414130/pexels-photo-1414130.jpeg?auto=compress&cs=tinysrgb&w=400',
  4,
  112,
  null,
  true
);

-- Insert additional vegetables to reach variety
INSERT INTO public."Farm2Hand_product" (
  product_name, product_price, product_unit, product_tag, product_organic, 
  product_rating, product_owner, product_category, product_description, 
  product_image, product_stock, product_reviews, product_discount, in_stock
) VALUES
(
  'มะเขือเทศราชินี',
  80,
  'กก.',
  'หวาน,สดใหม่,คุณภาพดี',
  false,
  47,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ผัก',
  'มะเขือเทศราชินีสีแดงสด รสชาติหวานอมเปรี้ยว',
  'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
  30,
  89,
  null,
  true
),
(
  'แครอทเบบี้',
  95,
  'กก.',
  'หวาน,กรอบ,ออร์แกนิค',
  true,
  48,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'wichai@organic.com' LIMIT 1),
  'ผัก',
  'แครอทเบบี้หวานกรอบ ขนาดเล็กน่ารัก เหมาะสำหรับเด็ก',
  'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
  15,
  167,
  null,
  true
),
(
  'มันฝรั่งญี่ปุ่น',
  85,
  'กก.',
  'หวาน,นุ่ม,คุณภาพดี',
  false,
  48,
  (SELECT id FROM public."Farm2Hand_user" WHERE "Email" = 'somchai@farm.com' LIMIT 1),
  'ผัก',
  'มันฝรั่งญี่ปุ่นหวานนุ่ม เหมาะทำอาหารทุกประเภท',
  'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
  20,
  112,
  15,
  true
);