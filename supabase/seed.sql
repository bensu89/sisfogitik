-- SIGIK Seed Data
-- Sample data for development

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (id, name, description, color) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Hardware', 'Masalah perangkat keras (komputer, printer, dll)', '#ef4444'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Software', 'Masalah aplikasi dan sistem operasi', '#3b82f6'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Jaringan', 'Masalah koneksi internet dan jaringan lokal', '#22c55e'),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Akun & Akses', 'Reset password, hak akses, dll', '#f59e0b'),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Lainnya', 'Kategori umum lainnya', '#8b5cf6');

-- Note: Users will be created via Supabase Auth
-- The profiles will be auto-created by the trigger

-- ============================================
-- SAMPLE TICKETS (Uncomment after creating users)
-- ============================================
-- INSERT INTO tickets (title, description, status, priority, category_id, reporter_id) VALUES
--   ('Printer tidak bisa print', 'Printer di ruang admin tidak merespon saat dikirim dokumen untuk print. Sudah dicoba restart tapi tetap sama.', 'open', 'high', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '<reporter_user_id>'),
--   ('Tidak bisa akses email', 'Saya lupa password email kantor dan tidak bisa login. Mohon bantuannya untuk reset password.', 'in_progress', 'medium', 'd4e5f6a7-b8c9-0123-def0-234567890123', '<reporter_user_id>'),
--   ('Komputer lambat', 'Komputer saya sangat lambat terutama saat membuka aplikasi Excel dengan file besar.', 'open', 'low', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '<reporter_user_id>');
