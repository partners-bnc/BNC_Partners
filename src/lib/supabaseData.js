import { supabase } from './supabaseClient';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const VOICE_REQUIREMENT_AUDIO_BUCKET = 'voice-requirement-audio';
const withTimeout = (promise, timeoutMs, timeoutMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

const mapPartnerProfile = (profileRow, aiRow) => ({
  id: profileRow?.id || null,
  firstName: profileRow?.first_name || '',
  lastName: profileRow?.last_name || '',
  email: profileRow?.email || '',
  phone: profileRow?.phone || '',
  country: profileRow?.country || '',
  city: profileRow?.city || '',
  status: profileRow?.status || 'Pending',
  notes: profileRow?.notes || '',
  registrationDate: profileRow?.registered_at || profileRow?.created_at || null,
  aiProfileCompleted: Boolean(aiRow),
  bio: aiRow?.bio || ''
});

const getAuthEmail = (user) => normalizeEmail(user?.email);

const toAppError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || error?.error_code || '').toLowerCase();
  const status = Number(error?.status || 0);

  if (
    code.includes('user_already_exists') ||
    code.includes('email_exists') ||
    message.includes('already registered') ||
    message.includes('already exists') ||
    message.includes('duplicate key')
  ) {
    return new Error('EMAIL_ALREADY_EXISTS');
  }

  if (
    code.includes('over_email_send_rate_limit') ||
    message.includes('email rate limit exceeded') ||
    message.includes('rate limit') ||
    status === 429
  ) {
    return new Error('EMAIL_RATE_LIMIT');
  }

  return error instanceof Error ? error : new Error(String(error || 'Unknown error'));
};

export const checkPartnerEmailExists = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  const { data, error } = await supabase.rpc('check_partner_email_exists', {
    p_email: normalizedEmail
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const registerPartner = async ({ firstName, lastName, email, phone, countryCode, country, city, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const exists = await checkPartnerEmailExists(normalizedEmail);
  if (exists) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
        country_code: countryCode,
        country,
        city,
        status: 'Email Sent',
        role: 'partner'
      }
    }
  });

  if (signUpError) {
    throw toAppError(signUpError);
  }

  const authUser = signUpData?.user;
  if (!authUser?.id) {
    throw new Error('Could not create partner auth user.');
  }

  return authUser;
};

export const loginPartner = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password
  });

  if (error) {
    throw error;
  }

  return data;
};

export const loginAdmin = async (adminIdOrEmail, password) => {
  const input = String(adminIdOrEmail || '').trim();
  if (!input) {
    throw new Error('Admin ID is required.');
  }

  const isEmailInput = input.includes('@');
  let email = normalizeEmail(input);

  if (!isEmailInput) {
    const { data, error } = await supabase.rpc('resolve_admin_email', {
      p_admin_id: input
    });

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Invalid admin credentials');
    }

    email = normalizeEmail(data);
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    throw authError;
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_profiles')
    .select('admin_id, email')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (adminError) {
    throw adminError;
  }

  if (!adminRow) {
    throw new Error('This account is not configured as admin.');
  }

  return {
    authData,
    admin: {
      adminId: adminRow.admin_id,
      email: adminRow.email
    }
  };
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const fetchPartnerData = async (emailHint, partnerIdHint = null) => {
  let userId = partnerIdHint || null;
  let email = normalizeEmail(emailHint);

  if (!userId || !email) {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return null;
    }

    userId = user.id;
    email = email || getAuthEmail(user);
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const { data: aiRow, error: aiError } = await supabase
    .from('partner_ai_profiles')
    .select('*')
    .eq('partner_email', email)
    .maybeSingle();

  if (aiError) {
    throw aiError;
  }

  if (!profileRow) {
    return null;
  }

  return mapPartnerProfile(profileRow, aiRow);
};

export const fetchAdminDashboardData = async () => {
  const { data, error } = await supabase
    .from('admin_partner_overview')
    .select('*')
    .order('registered_at', { ascending: false });

  if (error) {
    throw error;
  }

  const partners = (data || []).map((row) => ({
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    email: row.email,
    phone: row.phone,
    country: row.country,
    city: row.city,
    status: row.ai_profile_completed ? 'Complete' : 'Pending',
    registrationDate: row.registered_at
  }));

  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  const thisMonth = partners.filter((partner) => {
    const date = new Date(partner.registrationDate);
    if (Number.isNaN(date.getTime())) return false;
    return date.getUTCMonth() === currentMonth && date.getUTCFullYear() === currentYear;
  }).length;

  const activePartners = partners.filter((partner) => partner.status === 'Complete').length;

  return {
    kpis: {
      totalPartners: partners.length,
      activePartners,
      pendingPartners: partners.length - activePartners,
      thisMonth
    },
    partners
  };
};

export const submitAIProfile = async ({ partnerEmail, partnerId, partnerType, services, industries, experienceIndustries, experienceDetails, bio }) => {
  const normalizedEmail = normalizeEmail(partnerEmail);

  const upsertRow = {
    partner_id: partnerId || null,
    partner_email: normalizedEmail,
    partner_type: partnerType,
    services,
    industries,
    experience_industries: experienceIndustries,
    experience_details: experienceDetails || {},
    experience_years: null,
    organisation_name: null,
    bio
  };

  if (experienceDetails && typeof experienceDetails === 'object') {
    const keys = Object.keys(experienceDetails);
    if (keys.length > 0) {
      upsertRow.experience_years = keys
        .map((key) => `${key.replace(/-/g, ' ')}: ${experienceDetails[key]?.years || ''}`)
        .join(', ');
      upsertRow.organisation_name = keys
        .map((key) => `${key.replace(/-/g, ' ')}: ${experienceDetails[key]?.organisationName || ''}`)
        .join(', ');
    }
  }

  const { error } = await supabase
    .from('partner_ai_profiles')
    .upsert(upsertRow, { onConflict: 'partner_email' });

  if (error) {
    throw error;
  }
};

export const submitEnquiry = async ({ partnerId, country, countryLabel, service, formType, name, email, phone, company, message }) => {
  const { error } = await supabase.from('service_enquiries').insert({
    partner_id: partnerId || null,
    country: country || null,
    country_label: countryLabel || null,
    service: service || null,
    form_type: formType || null,
    full_name: name || null,
    email: normalizeEmail(email) || null,
    phone: phone || null,
    company: company || null,
    message: message || null
  });

  if (error) {
    throw error;
  }
};

export const submitVoiceRequirement = async ({
  requirement,
  audioFile = null,
  partnerId = null,
  partnerEmail = '',
  recipientEmail = 'rohanbncglobal@gmail.com',
  source = 'unknown'
}) => {
  const trimmedRequirement = String(requirement || '').trim();
  if (!trimmedRequirement) {
    throw new Error('Requirement text is required.');
  }

  let resolvedPartnerId = partnerId || null;
  let resolvedPartnerEmail = normalizeEmail(partnerEmail);
  if (!resolvedPartnerId || !resolvedPartnerEmail) {
    try {
      const stored = localStorage.getItem('partnerUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        resolvedPartnerId = resolvedPartnerId || parsed?.id || null;
        resolvedPartnerEmail = resolvedPartnerEmail || normalizeEmail(parsed?.email);
      }
    } catch (error) {
      console.error('Could not parse partner user from localStorage:', error);
    }
  }

  const {
    data: { user: authUser },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authUser) {
    throw new Error('AUTH_REQUIRED');
  }

  resolvedPartnerId = resolvedPartnerId || authUser.id || null;
  resolvedPartnerEmail = normalizeEmail(authUser.email) || resolvedPartnerEmail;

  if (!resolvedPartnerEmail) {
    throw new Error('AUTH_REQUIRED');
  }

  let audioPath = null;
  let audioMimeType = null;
  let audioSizeBytes = null;

  if (audioFile && typeof audioFile === 'object' && typeof audioFile.size === 'number' && audioFile.size > 0) {
    const mimeType = String(audioFile.type || 'audio/webm').trim() || 'audio/webm';
    const name = String(audioFile.name || '').trim();
    const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : mimeType.split('/').pop() || 'webm';
    const safeExtension = extension.replace(/[^a-z0-9]/gi, '') || 'webm';
    const safePartnerFolder = (resolvedPartnerId || resolvedPartnerEmail || 'unknown').replace(/[^a-z0-9-_@.]/gi, '_');
    const generatedPath = `${safePartnerFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(VOICE_REQUIREMENT_AUDIO_BUCKET)
      .upload(generatedPath, audioFile, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload voice recording: ${uploadError.message || 'Unknown upload error'}`);
    }

    audioPath = generatedPath;
    audioMimeType = mimeType;
    audioSizeBytes = Number(audioFile.size) || null;
  }

  let error = null;
  try {
    const response = await withTimeout(
      supabase.from('voice_requirements').insert({
        partner_id: resolvedPartnerId,
        partner_email: resolvedPartnerEmail,
        requirement_text: trimmedRequirement,
        recipient_email: normalizeEmail(recipientEmail) || 'rohanbncglobal@gmail.com',
        source,
        audio_bucket: audioPath ? VOICE_REQUIREMENT_AUDIO_BUCKET : null,
        audio_path: audioPath,
        audio_mime_type: audioMimeType,
        audio_size_bytes: audioSizeBytes
      }),
      12000,
      'NETWORK_TIMEOUT'
    );
    error = response?.error || null;
  } catch (caughtError) {
    const message = String(caughtError?.message || '').toLowerCase();
    if (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      throw new Error('Network error: could not reach server. Please check internet/VPN and retry.');
    }
    throw caughtError;
  }

  if (error) {
    const status = Number(error?.status || 0);
    const message = String(error?.message || '').toLowerCase();
    const code = String(error?.code || '').toLowerCase();
    if (
      status === 401 ||
      status === 403 ||
      message.includes('jwt') ||
      message.includes('not authenticated') ||
      message.includes('row-level security') ||
      code === '42501'
    ) {
      throw new Error('AUTH_REQUIRED');
    }
    throw error;
  }

  const { error: emailError } = await supabase.functions.invoke('notify-voice-requirement-brevo-v9', {
    body: {
      to: normalizeEmail(recipientEmail) || 'rohanbncglobal@gmail.com',
      partnerEmail: resolvedPartnerEmail,
      requirementText: trimmedRequirement,
      source,
      createdAt: new Date().toISOString(),
      audioBucket: audioPath ? VOICE_REQUIREMENT_AUDIO_BUCKET : null,
      audioPath,
      audioMimeType,
      audioFileName: audioPath ? audioPath.split('/').pop() : null
    }
  });

  if (emailError) {
    let details = '';
    try {
      const context = emailError?.context;
      if (context && typeof context.json === 'function') {
        const payload = await context.json();
        const rawError = payload?.error ? String(payload.error) : '';
        const rawDetails = payload?.details ? String(payload.details) : '';
        details = [rawError, rawDetails].filter(Boolean).join(' - ');
      }
    } catch (parseError) {
      details = '';
    }
    const suffix = details ? ` (${details})` : '';
    throw new Error(`Saved requirement, but email delivery failed${suffix}.`);
  }
};

export const getSessionUser = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
};
