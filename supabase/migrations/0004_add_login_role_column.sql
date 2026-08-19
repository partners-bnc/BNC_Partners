-- Migration: Add login_role column to registration_partner_profiles
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE registration_partner_profiles
  ADD COLUMN IF NOT EXISTS login_role TEXT DEFAULT 'provider'
    CHECK (login_role IN ('provider', 'consumer'));

-- Backfill existing rows to have 'provider' as default
UPDATE registration_partner_profiles
  SET login_role = 'provider'
  WHERE login_role IS NULL;

-- Add an index for quick role-based lookups
CREATE INDEX IF NOT EXISTS idx_partner_profiles_login_role
  ON registration_partner_profiles (login_role);
