/*
  # Mockup Data for Farm2Hand_user Table
  
  This file contains sample data for testing login and registration functionality.
  You can run these INSERT statements in your Supabase SQL editor.
  
  Test Accounts:
  1. Farmer Account: farmer@test.com / password123
  2. Customer Account: customer@test.com / password123
  3. Another Farmer: somchai@farm.com / mypassword
  4. Another Customer: malee@gmail.com / testpass
*/

-- Insert sample users with hashed passwords
-- Note: These passwords are hashed using SHA-256 for demo purposes
-- In production, use proper password hashing like bcrypt

INSERT INTO public."Farm2Hand_user" ("Name", "Email", "role", "Phone", "Address", "Password") VALUES
(
  'นายสมชาย ใจดี',
  'farmer@test.com',
  'farmer',
  '081-234-5678',
  'จ.เชียงใหม่, อ.แม่ริม, ต.ป่าแดด',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' -- password123
),
(
  'นางสาวมาลี สุขใจ',
  'customer@test.com',
  'customer',
  '082-345-6789',
  'กรุงเทพมหานคร, เขตบางรัก',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' -- password123
),
(
  'นายประสิทธิ์ เกษตรกร',
  'somchai@farm.com',
  'farmer',
  '083-456-7890',
  'จ.นครปฐม, อ.กำแพงแสน',
  '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08' -- mypassword
),
(
  'นางสาวสุดา ช้อปปิ้ง',
  'malee@gmail.com',
  'customer',
  '084-567-8901',
  'จ.ชลบุรี, อ.เมือง',
  '1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014' -- testpass
),
(
  'นายวิชัย ผักสด',
  'wichai@organic.com',
  'farmer',
  '085-678-9012',
  'จ.เลย, อ.เมือง, ต.กุดป่อง',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' -- password123
),
(
  'นางนิตยา ผู้บริโภค',
  'nitaya@yahoo.com',
  'customer',
  '086-789-0123',
  'จ.ขอนแก่น, อ.เมือง',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' -- password123
);