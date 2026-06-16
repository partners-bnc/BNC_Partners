import { supabase } from '../lib/supabaseClient';
import { getTemplateById, getTemplateByName } from './templatesStore';
import { sanitizeEmailHtml } from './emailTemplates';

// Default merge values applied at publish time for variables not derived from the lead.
export const PUBLISH_DEFAULTS = {
  CompanyName: 'your team',
  ProductName: 'BNC Partner Growth',
  AgentName: 'BNC CRM',
  FollowupDate: ''
};

// Resolve each email/aiEmail node's template (which lives in browser localStorage) and
// inline its content, so the server engine can send without access to the browser.
const embedTemplates = (flow) => {
  const nodes = (flow?.nodes || []).map((node) => {
    const kind = node.type || node.data?.kind;
    if (kind !== 'email' && kind !== 'aiEmail') return node;

    const template =
      getTemplateById(node.data?.templateId) || getTemplateByName(node.data?.templateName);
    if (!template) {
      throw new Error(`Node "${node.data?.label || node.id}" has no resolvable template.`);
    }

    return {
      ...node,
      data: {
        ...node.data,
        subject: template.subject,
        preheader: template.preheader,
        html_body: sanitizeEmailHtml(template.html_body),
        plain_text_body: template.plain_text_body,
        variables: template.variables
      }
    };
  });

  return { ...flow, nodes, defaults: PUBLISH_DEFAULTS };
};

// Snapshot the campaign (with embedded templates) to the server so the engine can run it.
export const publishCampaign = async (campaign) => {
  const flow = embedTemplates(campaign.flow);
  const { data, error } = await supabase.functions.invoke('campaign-admin', {
    body: {
      action: 'publish',
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        flow
      }
    }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};

// Enroll one or more leads into a published campaign.
export const enrollLeads = async (campaignId, leadIds) => {
  const { data, error } = await supabase.functions.invoke('campaign-admin', {
    body: { action: 'enroll', campaign_id: campaignId, lead_ids: leadIds }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};
