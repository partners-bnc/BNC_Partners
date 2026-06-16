import { ensureDefaultTemplate, getTemplateByName } from './templatesStore';

export const CAMPAIGNS_LOCAL_KEY = 'crm-campaigns-local-v2';

export const NODE_KIND_META = {
  trigger: { label: 'Trigger', blurb: 'Lead enters the campaign', chip: 'bg-emerald-100 text-emerald-700', icon: 'trigger' },
  email: { label: 'Send Email', blurb: 'Send a chosen template', chip: 'bg-violet-100 text-violet-700', icon: 'email' },
  aiEmail: { label: 'Send AI Email', blurb: 'AI rewrites a base template', chip: 'bg-indigo-100 text-indigo-700', icon: 'aiEmail' },
  wait: { label: 'Wait', blurb: 'Delay before the next step', chip: 'bg-amber-100 text-amber-700', icon: 'wait' },
  condition: { label: 'Branch', blurb: "Split on the lead's reaction", chip: 'bg-sky-100 text-sky-700', icon: 'condition' },
  action: { label: 'Action', blurb: 'Internal CRM action', chip: 'bg-blue-100 text-blue-700', icon: 'action' },
  end: { label: 'End', blurb: 'Terminal outcome', chip: 'bg-rose-100 text-rose-700', icon: 'end' }
};

export const PALETTE_KINDS = ['email', 'aiEmail', 'wait', 'condition', 'action', 'end'];

export const defaultNodeData = (kind) => {
  switch (kind) {
    case 'email': {
      const template = ensureDefaultTemplate();
      return { kind, label: 'Send email', templateId: template.id, templateName: template.name };
    }
    case 'aiEmail': {
      const template = ensureDefaultTemplate();
      return {
        kind,
        label: 'Send AI email',
        templateId: template.id,
        templateName: template.name,
        aiTone: 'Professional',
        aiPrompt: "Personalize this follow-up using the lead's recent activity."
      };
    }
    case 'wait':
      return { kind, label: 'Wait', waitValue: 2, waitUnit: 'days' };
    case 'condition':
      return { kind, label: 'Branch', question: 'Did the lead react?', branches: ['Yes', 'No'] };
    case 'action':
      return { kind, label: 'Notify account owner', actionType: 'Notify rep' };
    case 'end':
      return { kind, label: 'Mark engaged', outcome: 'engaged' };
    default:
      return { kind: 'trigger', label: 'Lead enters campaign' };
  }
};

const bindTemplate = (name) => {
  const template = getTemplateByName(name) ?? ensureDefaultTemplate();
  return { templateId: template.id, templateName: template.name };
};

const node = (id, kind, label, x, y, data = {}) => ({
  id,
  type: kind,
  position: { x, y },
  data: { ...defaultNodeData(kind), label, ...data }
});

const edge = (source, target, label, sourceHandle) => ({
  id: `e-${source}-${label || 'out'}-${target}`,
  source,
  target,
  label,
  sourceHandle: sourceHandle ?? null,
  type: 'smoothstep'
});

export const seedCampaigns = () => [
  {
    id: 'lead-re-engagement',
    name: 'Lead Re-engagement',
    description:
      'Contact every new lead, automatically follow up if they go quiet, and route each reaction to the right next step.',
    status: 'Active',
    createdAt: '2026-05-20T09:00:00.000Z',
    updatedAt: '2026-05-28T16:45:00.000Z',
    stats: { enrolled: 128, inFlight: 41, completed: 87 },
    flow: {
      nodes: [
        node('trigger', 'trigger', 'Lead enters campaign', 360, 0),
        node('email-1', 'email', 'Send Initial Outreach', 360, 140, bindTemplate('Initial Outreach')),
        node('wait-1', 'wait', 'Wait 3 days', 360, 290, { waitValue: 3 }),
        node('cond-1', 'condition', 'Did the lead reply?', 360, 430, { branches: ['Replied', 'No reply'] }),
        node('end-engaged-1', 'end', 'Mark Engaged', 120, 600),
        node('ai-1', 'aiEmail', 'Send AI Follow-up', 640, 580, { ...bindTemplate('Warm Follow-up'), aiTone: 'Warm' }),
        node('wait-2', 'wait', 'Wait 2 days', 640, 730, { waitValue: 2 }),
        node('cond-2', 'condition', 'How did they react?', 640, 870, {
          branches: ['Replied', 'Clicked link', 'Marked spam', 'Opened, no click', 'No reply']
        }),
        node('end-engaged-2', 'end', 'Mark Engaged', 140, 1070),
        node('action-1', 'action', 'Wait 2 days, then send reminder', 420, 1060, { actionType: 'Schedule reminder' }),
        node('end-engaged-3', 'end', 'Mark Engaged', 420, 1210),
        node('end-suppress', 'end', 'Do nothing — suppress', 720, 1070, { outcome: 'suppressed' }),
        node('action-2', 'action', 'Send gentle nudge', 1000, 1060, { actionType: 'Notify rep' }),
        node('end-cold', 'end', 'Mark Cold', 1280, 1070, { outcome: 'cold' })
      ],
      edges: [
        edge('trigger', 'email-1'),
        edge('email-1', 'wait-1'),
        edge('wait-1', 'cond-1'),
        edge('cond-1', 'end-engaged-1', 'Replied', 'Replied'),
        edge('cond-1', 'ai-1', 'No reply', 'No reply'),
        edge('ai-1', 'wait-2'),
        edge('wait-2', 'cond-2'),
        edge('cond-2', 'end-engaged-2', 'Replied', 'Replied'),
        edge('cond-2', 'action-1', 'Clicked link', 'Clicked link'),
        edge('action-1', 'end-engaged-3'),
        edge('cond-2', 'end-suppress', 'Marked spam', 'Marked spam'),
        edge('cond-2', 'action-2', 'Opened, no click', 'Opened, no click'),
        edge('cond-2', 'end-cold', 'No reply', 'No reply')
      ]
    }
  }
];

export const newBlankCampaign = () => {
  const stamp = new Date().toISOString();
  return {
    id: `camp-${Date.now()}`,
    name: 'Untitled Campaign',
    description: 'A new automated flow.',
    status: 'Draft',
    createdAt: stamp,
    updatedAt: stamp,
    stats: { enrolled: 0, inFlight: 0, completed: 0 },
    flow: { nodes: [node('trigger', 'trigger', 'Lead enters campaign', 320, 80)], edges: [] }
  };
};

export const loadCampaigns = () => {
  if (typeof window === 'undefined') return seedCampaigns();
  try {
    const raw = window.localStorage.getItem(CAMPAIGNS_LOCAL_KEY);
    if (!raw) {
      const seeded = seedCampaigns();
      window.localStorage.setItem(CAMPAIGNS_LOCAL_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : seedCampaigns();
  } catch {
    return seedCampaigns();
  }
};

export const saveCampaigns = (campaigns) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CAMPAIGNS_LOCAL_KEY, JSON.stringify(campaigns));
};

export const getCampaign = (id) => loadCampaigns().find((campaign) => campaign.id === id) ?? null;

export const upsertCampaign = (campaign) => {
  const next = [campaign, ...loadCampaigns().filter((item) => item.id !== campaign.id)];
  saveCampaigns(next);
};
