import { STARTER_EMAIL_TEMPLATES, normalizeVariables, sanitizeEmailHtml } from './emailTemplates';

export const TEMPLATES_LOCAL_KEY = 'crm-email-templates-local';

const normalizeTemplate = (template = {}, fallbackId = 'starter-1') => ({
  id: String(template.id ?? fallbackId),
  name: String(template.name ?? 'Untitled Template'),
  category: String(template.category ?? 'General'),
  subject: String(template.subject ?? ''),
  preheader: String(template.preheader ?? ''),
  html_body: sanitizeEmailHtml(template.html_body ?? template.html ?? ''),
  plain_text_body: String(template.plain_text_body ?? ''),
  variables: normalizeVariables(template.variables ?? []),
  status: String(template.status ?? 'Active'),
  source: String(template.source ?? 'Seed')
});

export const starterTemplates = () => STARTER_EMAIL_TEMPLATES.map((template, index) => normalizeTemplate(template, `starter-${index + 1}`));

const loadLocalTemplates = () => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TEMPLATES_LOCAL_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((template, index) => normalizeTemplate(template, `local-${index + 1}`))
      .filter((template) => template.name && template.subject && template.html_body);
  } catch {
    return [];
  }
};

export const loadAllTemplates = () => {
  const seen = new Set();
  return [...loadLocalTemplates(), ...starterTemplates()].filter((template) => {
    if (seen.has(template.id)) return false;
    seen.add(template.id);
    return true;
  });
};

export const getTemplateById = (id) => {
  if (!id) return null;
  return loadAllTemplates().find((template) => template.id === id) ?? null;
};

export const getTemplateByName = (name) => {
  const target = String(name || '').trim().toLowerCase();
  return loadAllTemplates().find((template) => template.name.trim().toLowerCase() === target) ?? null;
};

export const ensureDefaultTemplate = () => loadAllTemplates()[0] ?? starterTemplates()[0];
