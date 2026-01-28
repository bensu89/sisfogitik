-- SIGIK Database Schema
-- Helpdesk Ticketing System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE user_role AS ENUM ('pelapor', 'admin', 'teknisi');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'pelapor',
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'pelapor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TICKETS TABLE
-- ============================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status DEFAULT 'open',
  priority ticket_priority DEFAULT 'medium',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TICKET COMMENTS TABLE
-- ============================================
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes only visible to admin/teknisi
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_tickets_reporter ON tickets(reporter_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_category ON tickets(category_id);
CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- CATEGORIES POLICIES
CREATE POLICY "Everyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- TICKETS POLICIES
CREATE POLICY "Pelapor can view own tickets"
  ON tickets FOR SELECT
  USING (
    reporter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teknisi')
    )
  );

CREATE POLICY "Pelapor can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admin and assigned teknisi can update tickets"
  ON tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    (assignee_id = auth.uid())
  );

CREATE POLICY "Admin can delete tickets"
  ON tickets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- TICKET COMMENTS POLICIES
CREATE POLICY "Users can view comments on accessible tickets"
  ON ticket_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id AND (
        t.reporter_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'teknisi')
        )
      )
    ) AND (
      -- Hide internal comments from pelapor
      is_internal = false OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'teknisi')
      )
    )
  );

CREATE POLICY "Users can add comments to accessible tickets"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id AND (
        t.reporter_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('admin', 'teknisi')
        )
      )
    )
  );
