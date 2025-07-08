/*
  # User Scan Tracking System

  1. New Tables
    - `user_scans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `scan_date` (date, defaults to current date)
      - `scan_count` (integer, defaults to 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Unique constraint on (user_id, scan_date)

  2. Security
    - Enable RLS on `user_scans` table
    - Add policies for authenticated users to manage their own scan data

  3. Functions
    - `increment_user_scan_count()` - Increments daily scan count for current user
    - `get_user_scan_count_today()` - Returns today's scan count for current user
*/

-- Create the user_scans table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_date date NOT NULL DEFAULT CURRENT_DATE,
  scan_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scan_date)
);

-- Enable Row Level Security
ALTER TABLE user_scans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Users can view their own scans" ON user_scans;
  DROP POLICY IF EXISTS "Users can insert their own scans" ON user_scans;
  DROP POLICY IF EXISTS "Users can update their own scans" ON user_scans;
END $$;

-- Create policies
CREATE POLICY "Users can view their own scans"
  ON user_scans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON user_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans"
  ON user_scans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to increment scan count
CREATE OR REPLACE FUNCTION increment_user_scan_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_scans (user_id, scan_date, scan_count)
  VALUES (auth.uid(), CURRENT_DATE, 1)
  ON CONFLICT (user_id, scan_date)
  DO UPDATE SET 
    scan_count = user_scans.scan_count + 1,
    updated_at = now();
END;
$$;

-- Create function to get today's scan count
CREATE OR REPLACE FUNCTION get_user_scan_count_today()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_today integer;
BEGIN
  SELECT COALESCE(scan_count, 0) INTO count_today
  FROM user_scans
  WHERE user_id = auth.uid() AND scan_date = CURRENT_DATE;
  
  RETURN COALESCE(count_today, 0);
END;
$$;