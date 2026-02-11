/*
  # Create News and Events Management System

  1. New Tables
    - `news`
      - Manages news articles with categories
      - Supports Arabic and English content
      - Featured images and multiple images support
      - Categories: official, latest, general
      - Featured news support
    
    - `events`
      - Manages events and activities
      - Supports Arabic and English content
      - Date, time, and location information
      - Tab grouping (today, tomorrow, afterTomorrow, nextWeek)
      - Participation requests support
      - Capacity and registration management
    
  2. Security
    - Enable RLS on both tables
    - Public read access for active items
    - Staff write access for management

  3. Features
    - Multi-language support
    - Image galleries
    - Categories and tags
    - Featured content
    - Date and time management
    - Registration and participation tracking
*/

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  excerpt_ar text,
  excerpt_en text,
  content_ar text NOT NULL,
  content_en text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('official', 'latest', 'general')),
  featured_image text,
  images jsonb DEFAULT '[]'::jsonb,
  author_ar text,
  author_en text,
  tags jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  views_count integer DEFAULT 0,
  published_date timestamptz DEFAULT now(),
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES staff(id),
  updated_by uuid REFERENCES staff(id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text NOT NULL,
  description_en text NOT NULL,
  short_description_ar text,
  short_description_en text,
  event_date date NOT NULL,
  event_time time,
  end_date date,
  end_time time,
  location_ar text,
  location_en text,
  address_ar text,
  address_en text,
  tab_group text DEFAULT 'today' CHECK (tab_group IN ('today', 'tomorrow', 'afterTomorrow', 'nextWeek', 'upcoming')),
  featured_image text,
  images jsonb DEFAULT '[]'::jsonb,
  organizer_ar text,
  organizer_en text,
  capacity integer,
  registered_count integer DEFAULT 0,
  registration_required boolean DEFAULT false,
  registration_deadline timestamptz,
  registration_link text,
  tags jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES staff(id),
  updated_by uuid REFERENCES staff(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_date ON news(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_news_active ON news(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_tab_group ON events(tab_group);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- News Policies
CREATE POLICY "Anyone can read active news"
  ON news FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated staff can insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can delete news"
  ON news FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Events Policies
CREATE POLICY "Anyone can read active events"
  ON events FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated staff can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
