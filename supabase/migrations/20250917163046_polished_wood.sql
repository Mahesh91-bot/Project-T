/*
  # Initial Schema Setup for TIPSY Digital Tipping Platform

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text, unique) - user's email address
      - `name` (text) - user's full name
      - `role` (text) - 'worker' or 'owner'
      - `business_name` (text, nullable) - for business owners
      - `upi_id` (text, nullable) - for workers
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tips`
      - `id` (uuid, primary key)
      - `worker_id` (uuid, foreign key) - references user_profiles.id
      - `amount` (decimal) - tip amount in INR
      - `customer_name` (text) - customer's name (optional)
      - `rating` (integer, 1-5, nullable) - service rating
      - `review` (text, nullable) - customer review
      - `created_at` (timestamp)
    
    - `business_workers`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, foreign key) - references user_profiles.id
      - `worker_id` (uuid, foreign key) - references user_profiles.id
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for business owners to manage their workers
    - Add policies for public tip and review operations

  3. Indexes
    - Create indexes for efficient querying on worker_id, owner_id, and created_at
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('worker', 'owner')),
  business_name text,
  upi_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tips table
CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  customer_name text DEFAULT 'Anonymous',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now()
);

-- Create business_workers junction table
CREATE TABLE IF NOT EXISTS business_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  worker_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(owner_id, worker_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tips_worker_id ON tips(worker_id);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_workers_owner_id ON business_workers(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_workers_worker_id ON business_workers(worker_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_workers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow public read access to worker profiles for tipping (limited fields)
CREATE POLICY "Public can read worker profiles for tipping"
  ON user_profiles
  FOR SELECT
  TO anon
  USING (role = 'worker');

-- RLS Policies for tips
CREATE POLICY "Workers can read own tips"
  ON tips
  FOR SELECT
  TO authenticated
  USING (worker_id = auth.uid());

CREATE POLICY "Business owners can read their workers' tips"
  ON tips
  FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT worker_id FROM business_workers WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert tips"
  ON tips
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update tips for reviews"
  ON tips
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- RLS Policies for business_workers
CREATE POLICY "Business owners can read own workers"
  ON business_workers
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Workers can see which businesses they belong to"
  ON business_workers
  FOR SELECT
  TO authenticated
  USING (worker_id = auth.uid());

CREATE POLICY "Business owners can add workers"
  ON business_workers
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Business owners can remove workers"
  ON business_workers
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();