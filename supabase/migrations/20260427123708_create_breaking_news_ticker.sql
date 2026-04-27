/*
  # Create Breaking News Ticker Table

  Creates the breaking_news_ticker table for displaying scrolling news alerts
  on the website header.

  1. New Tables
    - `breaking_news_ticker`
      - `id` (serial, primary key)
      - `title_ar` (text) - Arabic title
      - `title_en` (text) - English title
      - `link` (text, nullable) - optional URL
      - `is_active` (boolean) - visibility toggle
      - `priority` (integer) - display order
      - `start_date` (timestamptz, nullable)
      - `end_date` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public read for active items
    - Authenticated users (admins) can manage all
*/

CREATE TABLE IF NOT EXISTS breaking_news_ticker (
  id serial PRIMARY KEY,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  link text,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE breaking_news_ticker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active breaking news"
  ON breaking_news_ticker FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert breaking news"
  ON breaking_news_ticker FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update breaking news"
  ON breaking_news_ticker FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete breaking news"
  ON breaking_news_ticker FOR DELETE
  TO authenticated
  USING (true);
