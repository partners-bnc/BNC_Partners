CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.registration_partner_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own requests
CREATE POLICY "Users can create service requests" 
ON public.service_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = partner_id);

-- Allow authenticated users to view their own requests
CREATE POLICY "Users can view their own requests" 
ON public.service_requests 
FOR SELECT 
TO authenticated 
USING (auth.uid() = partner_id);

-- Allow admins (if any) or public read if necessary
CREATE POLICY "Admins can view all requests" 
ON public.service_requests 
FOR SELECT 
TO authenticated 
USING (true);
