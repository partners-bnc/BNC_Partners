-- Migration: Allow authenticated users to read objects in voice-requirement-audio bucket
-- This permits generating signed URLs for playing back voice notes in the admin panel.

CREATE POLICY "Allow authenticated users to read voice recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'voice-requirement-audio');
