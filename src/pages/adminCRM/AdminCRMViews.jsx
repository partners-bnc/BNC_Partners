import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { supabase } from '../../lib/supabaseClient';
import { LEAD_FIELDS, coerceValue } from '../../crm/leadsSchema';
import { SAMPLE_REVERT } from '../../crm/sampleRevert';
import {
  SAMPLE_VARIABLES,
  STARTER_EMAIL_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_STATUSES,
  buildPreviewDocument,
  normalizeVariables,
  renderTemplateVariables,
  sanitizeEmailHtml
} from '../../crm/emailTemplates';
import { TEMPLATES_LOCAL_KEY, getTemplateById, loadAllTemplates } from '../../crm/templatesStore';
import {
  NODE_KIND_META,
  PALETTE_KINDS,
  defaultNodeData,
  getCampaign,
  loadCampaigns,
  newBlankCampaign,
  upsertCampaign
} from '../../crm/campaigns';
import { nodeTypes as campaignNodeTypes, KIND_ICONS } from './CampaignNodes';
import { publishCampaign, enrollLeads } from '../../crm/campaignPublish';

const DND_MIME = 'application/campaign-node';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const fmtDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const initials = (name) => {
  if (!name) return '?';
  return String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
};

const leadStatusStyle = (status) => {
  const value = String(status || '').toLowerCase();
  if (/(won|closed won|converted|customer)/.test(value)) return 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20';
  if (/(lost|dead|closed lost|unqualified)/.test(value)) return 'bg-rose-500/10 text-rose-700 border border-rose-500/20';
  if (/(new|fresh)/.test(value)) return 'bg-blue-500/10 text-blue-700 border border-blue-500/20';
  if (/(contacted|follow|nurtur|progress|working|qualified)/.test(value)) return 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
  return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
};

function CrmHeader({ title, subtitle, action }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-heading text-[22px] font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-sm text-ink/50">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

export function LeadsPipeline({ onNavigate }) {
  const [leads, setLeads] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const refreshLeads = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const { data, error } = await supabase.from('crm_leads').select('*').order('created_at', { ascending: false });
    if (error) {
      setLoadError(error.message || 'Could not load leads.');
      setLeads([]);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      refreshLeads();
    });
  }, [refreshLeads]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) =>
      [lead.full_name, lead.email, lead.city, lead.country, lead.lead_source, lead.lead_category, lead.lead_status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [leads, query]);

  const stats = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter((lead) => lead.last_contacted).length;
    const converted = leads.filter((lead) => /(won|closed won|converted|customer)/i.test(lead.lead_status || '')).length;
    return { total, contacted, converted, rate: total ? Math.round((converted / total) * 100) : 0 };
  }, [leads]);

  const deleteLead = async (id) => {
    setDeletingId(id);
    const { error } = await supabase.from('crm_leads').delete().eq('id', id);
    if (error) {
      setLoadError(error.message || 'Could not delete lead.');
    } else {
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      setSelected((lead) => (lead?.id === id ? null : lead));
      setConfirmId(null);
    }
    setDeletingId(null);
  };

  return (
    <div className="crm-surface min-h-full overflow-y-auto px-7 py-6">
      <CrmHeader
        title="Leads Pipeline"
        subtitle="Manage imported leads, outreach status, and customer segments."
        action={
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search leads..."
              className="w-64 rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            <button onClick={() => onNavigate('importLeads')} className="rounded-xl bg-accent px-5 py-2 text-sm font-bold text-white">
              Import Leads
            </button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Total Leads" value={stats.total} />
        <Metric label="Contacted" value={stats.contacted} />
        <Metric label="Won Deals" value={stats.converted} />
        <Metric label="Conversion Rate" value={`${stats.rate}%`} />
      </div>

      {loadError ? <Banner tone="error">{loadError}</Banner> : null}

      {loading ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-ink/50">Loading leads...</div>
      ) : leads.length === 0 ? (
        <EmptyLeads onImport={() => onNavigate('importLeads')} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/40 text-[10px] font-bold uppercase tracking-wider text-ink/40">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Contacted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {filtered.map((lead) => (
                  <tr key={lead.id} onClick={() => setSelected(lead)} className="cursor-pointer hover:bg-violet-500/[0.03]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-700">
                          {initials(lead.full_name)}
                        </span>
                        <span className="font-bold text-ink">{lead.full_name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink/80">{lead.email || '-'}</div>
                      <div className="mt-0.5 text-xs text-ink/40">{lead.phone_no || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-ink/70">{[lead.city, lead.country].filter(Boolean).join(', ') || '-'}</td>
                    <td className="px-6 py-4 text-ink/70">{lead.lead_source || '-'}</td>
                    <td className="px-6 py-4 text-ink/70">{lead.lead_category || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={cx('rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', leadStatusStyle(lead.lead_status))}>
                        {lead.lead_status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink/70">{fmtDate(lead.last_contacted)}</td>
                    <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                      {confirmId === lead.id ? (
                        <span className="inline-flex gap-2">
                          <button
                            onClick={() => deleteLead(lead.id)}
                            disabled={deletingId === lead.id}
                            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-60"
                          >
                            {deletingId === lead.id ? 'Deleting...' : 'Delete'}
                          </button>
                          <button onClick={() => setConfirmId(null)} className="rounded-lg border border-line px-3 py-1 text-xs font-bold text-ink/60">
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirmId(lead.id)} className="rounded-lg px-3 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LeadDrawer lead={selected} onClose={() => setSelected(null)} onDelete={deleteLead} deleting={selected && deletingId === selected.id} />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink/40">{label}</div>
      <div className="mt-2 font-heading text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}

function Banner({ tone = 'info', children }) {
  const styles = tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-800';
  return <div className={cx('mb-5 rounded-xl border px-4 py-3 text-sm font-medium', styles)}>{children}</div>;
}

function EmptyLeads({ onImport }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line bg-surface px-6 py-16 text-center shadow-sm">
      <h2 className="font-heading text-lg font-bold text-ink">No leads yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink/50">Import a CSV or Excel file to populate the pipeline.</p>
      <button onClick={onImport} className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white">
        Import your first leads
      </button>
    </div>
  );
}

function LeadDrawer({ lead, onClose, onDelete, deleting }) {
  const [confirm, setConfirm] = useState(false);
  const [enroll, setEnroll] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    setConfirm(false);
    setEnroll({ status: 'idle', message: '' });
  }, [lead?.id]);

  const handleEnroll = async () => {
    if (!lead?.id) return;
    if (!lead?.email) {
      setEnroll({ status: 'error', message: 'Lead has no email address.' });
      return;
    }
    setEnroll({ status: 'working', message: 'Enrolling...' });
    try {
      const result = await enrollLeads('lead-re-engagement', [lead.id]);
      setEnroll(
        result?.enrolled
          ? { status: 'done', message: 'Enrolled in Lead Re-engagement.' }
          : { status: 'done', message: 'Already enrolled in this campaign.' }
      );
    } catch (error) {
      setEnroll({ status: 'error', message: error?.message || 'Enrollment failed.' });
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={cx('fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] transition-opacity', lead ? 'opacity-100' : 'pointer-events-none opacity-0')}
      />
      <aside
        className={cx(
          'fixed right-0 top-0 z-50 flex h-screen w-[min(92vw,460px)] flex-col border-l border-line bg-surface shadow-2xl transition-transform',
          lead ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {lead ? (
          <>
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/10 text-sm font-bold text-violet-700">
                  {initials(lead.full_name)}
                </span>
                <div>
                  <div className="font-heading text-base font-bold text-ink">{lead.full_name || 'Unnamed lead'}</div>
                  <div className="text-xs text-ink/45">{lead.email || 'No email address'}</div>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg bg-slate-500/5 px-3 py-2 text-sm font-bold text-ink/50">
                Close
              </button>
            </div>
            <div className="scroll-thin flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-ink/30">Lead Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Detail label="Phone" value={lead.phone_no} />
                  <Detail label="Location" value={[lead.city, lead.country].filter(Boolean).join(', ')} />
                  <Detail label="Source" value={lead.lead_source} />
                  <Detail label="Category" value={lead.lead_category} />
                  <Detail label="Status" value={lead.lead_status} />
                  <Detail label="Lead Date" value={fmtDate(lead.lead_date)} />
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-ink/30">Outreach Stats</h3>
                <div className="grid grid-cols-4 gap-2">
                  <SmallStat label="Sent" value={SAMPLE_REVERT.emailsSent} />
                  <SmallStat label="Opens" value={SAMPLE_REVERT.opens} />
                  <SmallStat label="Clicks" value={SAMPLE_REVERT.clicks} />
                  <SmallStat label="Replies" value={SAMPLE_REVERT.replies} />
                </div>
              </div>
              <div className="rounded-xl border border-line bg-violet-500/[0.04] p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Sample AI Summary</div>
                <p className="mt-2 text-xs leading-relaxed text-ink/70">{SAMPLE_REVERT.headline}</p>
              </div>
              <ol className="relative ml-2.5 border-l-2 border-line/60">
                {SAMPLE_REVERT.events.map((event, index) => (
                  <li key={`${event.title}-${index}`} className="relative pb-6 pl-6 last:pb-0">
                    <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-violet-500" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-ink">{event.title}</span>
                      <span className="text-[10px] text-ink/40">{event.date}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink/50">{event.detail}</p>
                  </li>
                ))}
              </ol>
            </div>
            {enroll.message ? (
              <div
                className={cx(
                  'border-t px-6 py-2 text-xs',
                  enroll.status === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                )}
              >
                {enroll.message}
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-line px-6 py-4">
              <button
                onClick={handleEnroll}
                disabled={enroll.status === 'working'}
                className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                title="Enroll this lead into the Lead Re-engagement campaign"
              >
                {enroll.status === 'working' ? 'Enrolling...' : 'Enroll in campaign'}
              </button>
              {confirm ? (
                <span className="flex gap-2">
                  <button onClick={() => onDelete(lead.id)} disabled={deleting} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
                    {deleting ? 'Deleting...' : 'Confirm'}
                  </button>
                  <button onClick={() => setConfirm(false)} className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink/60">
                    Cancel
                  </button>
                </span>
              ) : (
                <button onClick={() => setConfirm(true)} className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600">
                  Delete Lead
                </button>
              )}
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5">
      <div className="text-[9px] font-bold uppercase tracking-wider text-ink/30">{label}</div>
      <div className="mt-1 truncate text-xs font-medium text-ink">{value || '-'}</div>
    </div>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/40 py-2.5 text-center">
      <div className="font-heading text-base font-bold text-ink">{value}</div>
      <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-ink/30">{label}</div>
    </div>
  );
}

const normalizeHeader = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const aliases = (key) => ({
  full_name: ['name', 'fullname', 'contact', 'contactname', 'lead'],
  email: ['emailaddress', 'mail', 'e-mail'],
  phone_no: ['phone', 'phonenumber', 'mobile', 'contactno', 'number'],
  city: ['town'],
  country: ['nation'],
  lead_date: ['date', 'createddate', 'createdat', 'datecreated'],
  lead_source: ['source', 'channel', 'origin'],
  lead_category: ['category', 'segment', 'type'],
  lead_status: ['status', 'stage'],
  last_contacted: ['lastcontact', 'lastcontacted', 'lastcontactedon', 'lastactivity']
}[key] || []);

const guessMapping = (headers) => {
  const normHeaders = headers.map(normalizeHeader);
  const mapping = {};
  for (const field of LEAD_FIELDS) {
    const candidates = [field.key, field.label, ...aliases(field.key)].map(normalizeHeader);
    let found = '';
    for (let i = 0; i < normHeaders.length; i += 1) {
      if (candidates.includes(normHeaders[i])) {
        found = i;
        break;
      }
    }
    if (found === '') {
      for (let i = 0; i < normHeaders.length; i += 1) {
        if (candidates.some((candidate) => candidate && (normHeaders[i].includes(candidate) || candidate.includes(normHeaders[i])))) {
          found = i;
          break;
        }
      }
    }
    mapping[field.key] = found;
  }
  return mapping;
};

export function ImportLeads({ onNavigate }) {
  const inputRef = useRef(null);
  const [parsed, setParsed] = useState(null);
  const [mapping, setMapping] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (file) => {
    setParseError('');
    setResult(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '', blankrows: false });
      if (!matrix.length) {
        setParseError('That file appears to be empty.');
        return;
      }
      const headers = matrix[0].map((header, index) => String(header ?? '').trim() || `Column ${index + 1}`);
      const rows = matrix.slice(1).map((row) => headers.map((_, index) => String(row[index] ?? '').trim()));
      setParsed({ name: file.name, headers, rows });
      setMapping(guessMapping(headers));
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Could not read that file. Try a CSV or XLSX export.');
    }
  };

  const mappedCount = useMemo(() => Object.values(mapping).filter((value) => value !== '').length, [mapping]);

  const reset = () => {
    setParsed(null);
    setMapping({});
    setParseError('');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const runImport = async () => {
    if (!parsed) return;
    setImporting(true);
    setResult(null);
    const records = [];

    for (const row of parsed.rows) {
      const record = {};
      let hasValue = false;
      for (const field of LEAD_FIELDS) {
        const index = mapping[field.key];
        if (index === '' || index === undefined) continue;
        const value = coerceValue(field.type, row[index]);
        record[field.key] = value;
        if (value !== null) hasValue = true;
      }
      if (hasValue) records.push(record);
    }

    if (!records.length) {
      setResult({ ok: false, message: 'Nothing to import. Map at least one column with data.' });
      setImporting(false);
      return;
    }

    try {
      let inserted = 0;
      for (let i = 0; i < records.length; i += 500) {
        const batch = records.slice(i, i + 500);
        const { error } = await supabase.from('crm_leads').insert(batch);
        if (error) throw error;
        inserted += batch.length;
      }
      setResult({ ok: true, message: `Imported ${inserted} lead${inserted === 1 ? '' : 's'}.` });
    } catch (error) {
      setResult({ ok: false, message: error instanceof Error ? error.message : 'Import failed. Check your database connection.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="crm-surface min-h-full overflow-y-auto px-7 py-6">
      <CrmHeader title="Import Leads Wizard" subtitle="Upload CSV or Excel files, then map columns to the CRM lead schema." />
      {!parsed ? (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            const file = event.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={cx(
            'flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-16 text-center transition',
            dragOver ? 'border-accent bg-violet-500/[0.04]' : 'border-line bg-surface hover:border-accent/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-600">+</div>
          <p className="font-heading text-base font-bold text-ink">Drag and drop your file here</p>
          <p className="mt-1 text-xs font-medium text-ink/40">or click to browse local files - CSV, XLSX, or XLS</p>
          {parseError ? <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600">{parseError}</p> : null}
        </label>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-6 py-4 shadow-sm">
            <div>
              <div className="text-sm font-bold text-ink">{parsed.name}</div>
              <div className="mt-0.5 text-xs font-medium text-ink/40">
                {parsed.rows.length} rows - {parsed.headers.length} columns - {mappedCount} of {LEAD_FIELDS.length} fields mapped
              </div>
            </div>
            <button onClick={reset} className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink/70">
              Choose another file
            </button>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SchemaCard />
            <UploadedCard parsed={parsed} />
          </div>
          <MappingTable parsed={parsed} mapping={mapping} onChange={setMapping} />
          {result ? (
            <div className={cx('rounded-2xl border p-4 text-xs font-bold', result.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>
              {result.message}
              {result.ok ? (
                <button onClick={() => onNavigate('leads')} className="ml-2 underline">
                  View Leads Pipeline
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-4">
            <span className="text-xs font-medium text-ink/40">{mappedCount} fields mapped for import</span>
            <button onClick={runImport} disabled={importing || mappedCount === 0} className="rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-white disabled:opacity-40">
              {importing ? 'Importing...' : `Import ${parsed.rows.length} leads`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SchemaCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink">CRM Schema Fields</h2>
        <p className="mt-0.5 text-[10px] font-medium text-ink/40">Destination fields in crm_leads table</p>
      </div>
      <ul className="divide-y divide-line/40">
        {LEAD_FIELDS.map((field) => (
          <li key={field.key} className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-xs font-bold text-ink">{field.label}</div>
              <div className="mt-0.5 text-[10px] text-ink/45">{field.hint}</div>
            </div>
            <code className="rounded-md border border-line/60 bg-canvas px-2 py-0.5 text-[10px] font-bold text-ink/65">{field.type}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UploadedCard({ parsed }) {
  const preview = parsed.rows.slice(0, 4);
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink">Uploaded Document Preview</h2>
        <p className="mt-0.5 text-[10px] font-medium text-ink/40">Headers and first rows</p>
      </div>
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-canvas/40 text-[9px] font-bold uppercase tracking-wider text-ink/40">
              {parsed.headers.map((header, index) => (
                <th key={`${header}-${index}`} className="whitespace-nowrap px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/30">
            {preview.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {parsed.headers.map((_, colIndex) => (
                  <td key={colIndex} className="max-w-[160px] truncate px-4 py-2.5 text-ink/75">
                    {row[colIndex] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MappingTable({ parsed, mapping, onChange }) {
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink">Map Columns</h2>
        <p className="mt-0.5 text-[10px] font-medium text-ink/40">Route uploaded headers to CRM destination fields.</p>
      </div>
      <div className="divide-y divide-line/40">
        {LEAD_FIELDS.map((field) => {
          const selected = mapping[field.key];
          const sample = selected !== '' && selected !== undefined ? parsed.rows.slice(0, 3).map((row) => row[selected]).filter(Boolean).join(', ') : '';
          return (
            <div key={field.key} className="grid grid-cols-1 items-center gap-3 px-5 py-4 sm:grid-cols-[1.1fr_1.5fr]">
              <div>
                <div className="text-xs font-bold text-ink">{field.label}</div>
                <code className="mt-0.5 block text-[9px] font-bold text-ink/35">{field.key}</code>
              </div>
              <div>
                <select
                  value={selected === undefined ? '' : selected}
                  onChange={(event) => onChange({ ...mapping, [field.key]: event.target.value === '' ? '' : Number(event.target.value) })}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                >
                  <option value="">Skip / do not import</option>
                  {parsed.headers.map((header, index) => (
                    <option key={`${header}-${index}`} value={index}>
                      {header}
                    </option>
                  ))}
                </select>
                {sample ? <div className="mt-1.5 truncate px-1 text-[10px] font-medium text-ink/40">Sample: {sample}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const EMPTY_TEMPLATE = {
  id: null,
  name: 'Untitled Template',
  category: 'Follow-up',
  subject: '',
  preheader: '',
  html_body: '',
  plain_text_body: '',
  variables: ['ContactName', 'CompanyName', 'AgentName'],
  status: 'Draft',
  source: 'Manual'
};

const seedTemplates = () => STARTER_EMAIL_TEMPLATES.map((template, index) => ({ ...template, id: `starter-${index + 1}` }));

const normalizeForDraft = (template) => ({
  ...EMPTY_TEMPLATE,
  ...(template || {}),
  html_body: sanitizeEmailHtml(template?.html_body || template?.html || ''),
  variables: normalizeVariables(template?.variables || EMPTY_TEMPLATE.variables)
});

const loadLocalTemplates = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TEMPLATES_LOCAL_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeForDraft) : [];
  } catch {
    return [];
  }
};

const persistLocalTemplates = (templates) => {
  const local = templates.filter((template) => String(template.id || '').startsWith('local-'));
  window.localStorage.setItem(TEMPLATES_LOCAL_KEY, JSON.stringify(local));
};

export function EmailTemplatesView() {
  const initialTemplateState = useMemo(() => {
    const merged = [...loadLocalTemplates(), ...seedTemplates()];
    return {
      templates: merged,
      selectedId: merged[0]?.id ?? null,
      draft: normalizeForDraft(merged[0] ?? EMPTY_TEMPLATE)
    };
  }, []);
  const [templates, setTemplates] = useState(initialTemplateState.templates);
  const [selectedId, setSelectedId] = useState(initialTemplateState.selectedId);
  const [draft, setDraft] = useState(initialTemplateState.draft);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [sampleVariables, setSampleVariables] = useState(SAMPLE_VARIABLES);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return templates.filter((template) => {
      const categoryMatch = categoryFilter === 'All' || template.category === categoryFilter;
      const queryMatch = !needle || [template.name, template.subject, template.category, template.status].join(' ').toLowerCase().includes(needle);
      return categoryMatch && queryMatch;
    });
  }, [templates, categoryFilter, query]);

  const previewDoc = useMemo(() => buildPreviewDocument(draft, sampleVariables), [draft, sampleVariables]);
  const renderedSubject = renderTemplateVariables(draft.subject, sampleVariables);
  const detectedVars = normalizeVariables(draft.variables);

  const selectTemplate = (template) => {
    setSelectedId(template.id);
    setDraft(normalizeForDraft(template));
    setNotice('');
    setError('');
  };

  const updateDraft = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const createBlank = () => {
    const blank = {
      ...EMPTY_TEMPLATE,
      id: `local-${Date.now()}`,
      name: 'New Follow-up Template',
      subject: 'Following up with {{CompanyName}}',
      html_body: STARTER_EMAIL_TEMPLATES[1]?.html_body || ''
    };
    const next = [blank, ...templates];
    setTemplates(next);
    persistLocalTemplates(next);
    setSelectedId(blank.id);
    setDraft(normalizeForDraft(blank));
    setNotice('Draft created. Edit and save to keep it.');
  };

  const saveTemplate = () => {
    setError('');
    setNotice('');
    if (!draft.name?.trim() || !draft.subject?.trim() || !draft.html_body?.trim()) {
      setError('Name, subject, and HTML body are required.');
      return;
    }
    const id = String(draft.id || '').startsWith('local-') ? draft.id : `local-${Date.now()}`;
    const saved = { ...draft, id, source: 'Manual', html_body: sanitizeEmailHtml(draft.html_body), variables: normalizeVariables(draft.variables) };
    const next = [saved, ...templates.filter((template) => template.id !== draft.id && template.id !== id)];
    setTemplates(next);
    persistLocalTemplates(next);
    setSelectedId(saved.id);
    setDraft(normalizeForDraft(saved));
    setNotice('Template saved to this browser.');
  };

  const deleteTemplate = () => {
    if (!draft.id) return;
    const next = templates.filter((template) => template.id !== draft.id);
    const first = next[0] ?? EMPTY_TEMPLATE;
    setTemplates(next);
    persistLocalTemplates(next);
    setSelectedId(next[0]?.id ?? null);
    setDraft(normalizeForDraft(first));
    setNotice('Template removed.');
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(sanitizeEmailHtml(draft.html_body));
    setNotice('HTML copied to clipboard.');
  };

  return (
    <div className="crm-surface flex h-full flex-col overflow-hidden px-7 py-6">
      <CrmHeader
        title="Email Templates"
        subtitle="Craft and preview outreach templates that campaign email steps can reuse."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={createBlank} className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-bold text-ink/70">New</button>
            <button onClick={copyHtml} className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-bold text-ink/70">Copy HTML</button>
            <button onClick={saveTemplate} className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white">Save</button>
          </div>
        }
      />
      {notice || error ? <Banner tone={error ? 'error' : 'info'}>{error || notice}</Banner> : null}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(340px,0.9fr)_minmax(400px,1.1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="border-b border-line p-4">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates..." className="w-full rounded-xl border border-line px-3 py-2 text-xs text-ink outline-none" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['All', ...TEMPLATE_CATEGORIES].map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={cx('rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider', categoryFilter === category ? 'bg-accent text-white' : 'bg-canvas text-ink/60')}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="scroll-thin min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {filtered.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className={cx('w-full rounded-xl border p-3.5 text-left', selectedId === template.id ? 'border-accent/40 bg-violet-500/[0.04]' : 'border-line/40 hover:bg-canvas/40')}
              >
                <div className="truncate text-xs font-bold text-ink">{template.name}</div>
                <div className="mt-1 truncate text-[10px] font-medium text-ink/40">{template.subject}</div>
                <div className="mt-3 text-[9px] font-bold uppercase tracking-wider text-ink/40">{template.category} - {template.status}</div>
              </button>
            ))}
          </div>
        </aside>
        <section className="scroll-thin min-h-0 overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-ink">Template Parameters</h2>
            <button onClick={deleteTemplate} className="rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50">Delete</button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Template name"><input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} className="crm-field" /></Field>
            <Field label="Category"><select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} className="crm-field">{TEMPLATE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></Field>
            <Field label="Status"><select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)} className="crm-field">{TEMPLATE_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></Field>
            <Field label="Variables"><input value={detectedVars.join(', ')} onChange={(event) => updateDraft('variables', event.target.value)} className="crm-field" /></Field>
          </div>
          <div className="mt-4 space-y-4">
            <Field label="Subject line"><input value={draft.subject} onChange={(event) => updateDraft('subject', event.target.value)} className="crm-field" /></Field>
            <Field label="Preheader"><input value={draft.preheader} onChange={(event) => updateDraft('preheader', event.target.value)} className="crm-field" /></Field>
            <Field label="HTML body"><textarea value={draft.html_body} onChange={(event) => updateDraft('html_body', event.target.value)} rows={12} className="crm-field font-mono text-xs" /></Field>
            <Field label="Plain text backup"><textarea value={draft.plain_text_body} onChange={(event) => updateDraft('plain_text_body', event.target.value)} rows={4} className="crm-field" /></Field>
          </div>
        </section>
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-line p-4">
            <div>
              <div className="text-xs font-bold text-ink">Live Preview</div>
              <p className="mt-1 truncate text-[10px] font-medium text-ink/40">{renderedSubject || 'Provide a subject to render preview.'}</p>
            </div>
            <div className="flex rounded-xl border border-line bg-canvas/60 p-1">
              {['desktop', 'mobile'].map((mode) => (
                <button key={mode} onClick={() => setPreviewMode(mode)} className={cx('rounded-lg px-3 py-1 text-[10px] font-bold uppercase', previewMode === mode ? 'bg-surface text-accent shadow-sm' : 'text-ink/50')}>
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="border-b border-line bg-canvas/20 p-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {Object.entries(sampleVariables).map(([key, value]) => (
                <label key={key} className="text-[9px] font-bold text-ink/40">
                  {key}
                  <input value={value} onChange={(event) => setSampleVariables((prev) => ({ ...prev, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-line px-2.5 py-1 text-xs" />
                </label>
              ))}
            </div>
          </div>
          <div className="scroll-thin flex min-h-0 flex-1 justify-center overflow-auto bg-canvas/50 p-6">
            <div className={cx('overflow-hidden border border-line bg-white shadow-xl', previewMode === 'mobile' ? 'h-[620px] w-[320px] rounded-[28px]' : 'h-full w-full max-w-[850px] rounded-xl')}>
              <iframe title="Email template preview" sandbox="allow-same-origin" srcDoc={previewDoc} className="h-full w-full border-0 bg-white" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink/60">{label}</span>
      {children}
    </label>
  );
}

export function CampaignsView({ onOpenCampaign }) {
  const [campaigns, setCampaigns] = useState(() => loadCampaigns());

  const createCampaign = () => {
    const campaign = newBlankCampaign();
    upsertCampaign(campaign);
    setCampaigns(loadCampaigns());
    onOpenCampaign(campaign.id);
  };

  return (
    <div className="crm-surface min-h-full overflow-y-auto px-7 py-6">
      <CrmHeader
        title="Campaign Automations"
        subtitle="Automated branching flows that nurture leads from first touch to outcome."
        action={<button onClick={createCampaign} className="rounded-xl bg-accent px-5 py-2 text-sm font-bold text-white">New Campaign</button>}
      />
      <Banner>Open a campaign and click "Publish &amp; Activate" to run it live. Enroll leads from the Leads Pipeline.</Banner>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <button key={campaign.id} onClick={() => onOpenCampaign(campaign.id)} className="rounded-2xl border border-line bg-surface p-5 text-left shadow-sm hover:border-accent/40 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-xl bg-violet-500/10 px-3 py-2 text-sm font-bold text-violet-700">Flow</span>
              <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/60">{campaign.status}</span>
            </div>
            <h2 className="mt-4 font-heading text-base font-bold text-ink">{campaign.name}</h2>
            <p className="mt-1.5 h-10 text-xs leading-relaxed text-ink/50">{campaign.description || 'No description provided.'}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line/60 pt-4">
              <SmallStat label="Enrolled" value={campaign.stats.enrolled} />
              <SmallStat label="In flight" value={campaign.stats.inFlight} />
              <SmallStat label="Done" value={campaign.stats.completed} />
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-medium text-ink/40">
              <span>{campaign.flow.nodes.length} steps</span>
              <span>Updated {fmtDate(campaign.updatedAt)}</span>
            </div>
          </button>
        ))}
        <button onClick={createCampaign} className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-surface/50 p-5 text-center hover:border-accent/40">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-2xl text-violet-700">+</span>
          <span className="font-heading text-sm font-bold text-ink">Create Campaign</span>
          <span className="mt-1 max-w-[160px] text-xs leading-normal text-ink/40">Start a blank automated sequence</span>
        </button>
      </div>
    </div>
  );
}

export function CampaignBuilderView({ campaignId, onBack }) {
  const campaign = useMemo(() => getCampaign(campaignId), [campaignId]);

  if (!campaign) {
    return (
      <div className="crm-surface flex h-full flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-heading text-xl text-ink">Campaign not found</h1>
        <button onClick={onBack} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white">Back to campaigns</button>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <FlowCanvas campaign={campaign} onBack={onBack} />
    </ReactFlowProvider>
  );
}

function FlowCanvas({ campaign, onBack }) {
  const base = useRef(campaign);
  const [name, setName] = useState(campaign.name);
  const [status, setStatus] = useState(campaign.status);
  const [nodes, setNodes, onNodesChange] = useNodesState(campaign.flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(campaign.flow.edges);
  const [selectedId, setSelectedId] = useState(null);
  const [templates] = useState(() => loadAllTemplates());
  const [previewId, setPreviewId] = useState(null);
  const [savedAt, setSavedAt] = useState('');
  const [publishState, setPublishState] = useState({ status: 'idle', message: '' });
  const { screenToFlowPosition } = useReactFlow();

  const handlePublish = useCallback(async () => {
    setPublishState({ status: 'working', message: 'Publishing...' });
    try {
      await publishCampaign({ ...base.current, name, status, flow: { nodes, edges } });
      setPublishState({ status: 'done', message: `Published ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` });
    } catch (error) {
      setPublishState({ status: 'error', message: error?.message || 'Publish failed.' });
    }
  }, [name, status, nodes, edges]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const updated = {
        ...base.current,
        name,
        status,
        updatedAt: new Date().toISOString(),
        flow: { nodes, edges }
      };
      base.current = updated;
      upsertCampaign(updated);
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
    return () => clearTimeout(handle);
  }, [nodes, edges, name, status]);

  const onConnect = useCallback((params) => setEdges((current) => addEdge({ ...params, type: 'smoothstep' }, current)), [setEdges]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData(DND_MIME);
      if (!kind) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode = {
        id: `n-${Date.now()}`,
        type: kind,
        position,
        data: defaultNodeData(kind)
      };
      setNodes((current) => current.concat(newNode));
      setSelectedId(newNode.id);
    },
    [screenToFlowPosition, setNodes]
  );

  const updateNodeData = (id, patch) => {
    setNodes((current) => current.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...patch } } : node)));
  };

  const deleteNode = (id) => {
    setNodes((current) => current.filter((node) => node.id !== id));
    setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedId(null);
  };

  const selectedNode = nodes.find((node) => node.id === selectedId) || null;

  return (
    <div className="crm-surface flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink/60">Back</button>
          <div>
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-72 rounded-lg px-2 py-0.5 font-heading text-base font-bold text-ink outline-none focus:bg-canvas" />
            <div className="mt-0.5 px-2 text-[10px] font-medium text-ink/40">{savedAt ? `Autosaved ${savedAt}` : 'Changes save locally to this browser'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink">
            {['Active', 'Draft', 'Paused'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button
            onClick={handlePublish}
            disabled={publishState.status === 'working'}
            className="rounded-xl bg-accent px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {publishState.status === 'working' ? 'Publishing...' : 'Publish & Activate'}
          </button>
        </div>
      </header>
      <div
        className={cx(
          'border-b px-6 py-2 text-xs',
          publishState.status === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : publishState.status === 'done'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-line bg-surface text-ink/50'
        )}
      >
        {publishState.message ||
          'Edits autosave to this browser. Click "Publish & Activate" to push the live flow to the server engine.'}
      </div>
      <div className="campaign-flow flex min-h-0 flex-1">
        <NodePalette />
        <div className="relative min-w-0 flex-1" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            nodeTypes={campaignNodeTypes}
            defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#7c3aed', strokeWidth: 2 } }}
            fitView
          >
            <Background color="#d9d6cd" gap={20} />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable nodeColor="#cbb8f4" maskColor="rgba(248,250,252,0.75)" />
          </ReactFlow>
        </div>
        <NodeInspector
          node={selectedNode}
          templates={templates}
          onChange={updateNodeData}
          onDelete={deleteNode}
          onPreview={setPreviewId}
          onClose={() => setSelectedId(null)}
        />
      </div>
      <TemplatePreviewModal templateId={previewId} onClose={() => setPreviewId(null)} />
    </div>
  );
}

function NodePalette() {
  return (
    <div className="flex w-56 shrink-0 flex-col gap-3 border-r border-line bg-surface p-4">
      <div className="border-b border-line/50 px-1 pb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-ink/30">Canvas Steps</div>
        <p className="mt-1 text-[10px] leading-relaxed text-ink/40">Drag steps onto the canvas grid.</p>
      </div>
      {PALETTE_KINDS.map((kind) => {
        const meta = NODE_KIND_META[kind];
        const Icon = KIND_ICONS[kind];
        return (
          <div
            key={kind}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(DND_MIME, kind);
              event.dataTransfer.effectAllowed = 'move';
            }}
            className="flex cursor-grab items-center gap-3 rounded-xl border border-line bg-surface p-2.5 hover:border-accent/40 hover:bg-accent-soft/30"
          >
            <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', meta.chip)}>
              {Icon ? <Icon className="h-4 w-4" strokeWidth={2.5} /> : '+'}
            </span>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-ink">{meta.label}</div>
              <div className="mt-0.5 truncate text-[10px] text-ink/45">{meta.blurb}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NodeInspector({ node, templates, onChange, onDelete, onPreview, onClose }) {
  if (!node) {
    return (
      <div className="flex w-80 shrink-0 flex-col items-center justify-center border-l border-line bg-surface p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-600">+</div>
        <p className="text-xs font-bold text-ink">Properties Inspector</p>
        <p className="mt-1 max-w-[200px] text-[10px] leading-relaxed text-ink/40">Click any step on the canvas to edit its properties.</p>
      </div>
    );
  }

  const data = node.data || {};
  const isEmail = data.kind === 'email' || data.kind === 'aiEmail';
  const set = (patch) => onChange(node.id, patch);

  return (
    <div className="scroll-thin flex w-80 shrink-0 flex-col overflow-y-auto border-l border-line bg-surface shadow-2xl">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <span className="text-xs font-bold text-ink">{NODE_KIND_META[data.kind]?.label || 'Step'}</span>
        <button onClick={onClose} className="rounded-lg px-2 py-1 text-xs font-bold text-ink/40">Close</button>
      </div>
      <div className="space-y-5 p-5">
        <Field label="Label"><input value={data.label || ''} onChange={(event) => set({ label: event.target.value })} className="crm-field" /></Field>
        {isEmail ? (
          <>
            <Field label="Email template">
              <select
                value={data.templateId || ''}
                onChange={(event) => {
                  const template = templates.find((item) => item.id === event.target.value);
                  set({ templateId: template?.id, templateName: template?.name });
                }}
                className="crm-field"
              >
                {!data.templateId ? <option value="">Select template</option> : null}
                {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
              <button onClick={() => onPreview(data.templateId)} className="mt-2.5 w-full rounded-xl border border-line py-2 text-xs font-bold text-ink/70">Preview Email HTML</button>
            </Field>
            {data.kind === 'aiEmail' ? (
              <>
                <Field label="AI tone"><select value={data.aiTone || 'Professional'} onChange={(event) => set({ aiTone: event.target.value })} className="crm-field">{['Professional', 'Warm', 'Concise', 'Premium', 'Urgent'].map((tone) => <option key={tone}>{tone}</option>)}</select></Field>
                <Field label="AI instructions"><textarea value={data.aiPrompt || ''} onChange={(event) => set({ aiPrompt: event.target.value })} rows={4} className="crm-field" /></Field>
              </>
            ) : null}
          </>
        ) : null}
        {data.kind === 'wait' ? (
          <Field label="Delay">
            <div className="flex gap-2">
              <input type="number" min={1} value={data.waitValue || 1} onChange={(event) => set({ waitValue: Number(event.target.value) })} className="crm-field w-20" />
              <select value={data.waitUnit || 'days'} onChange={(event) => set({ waitUnit: event.target.value })} className="crm-field flex-1">
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </div>
          </Field>
        ) : null}
        {data.kind === 'condition' ? (
          <Field label="Question"><input value={data.question || ''} onChange={(event) => set({ question: event.target.value })} className="crm-field" /></Field>
        ) : null}
        {data.kind !== 'trigger' ? (
          <button onClick={() => onDelete(node.id)} className="w-full rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-600">Delete step</button>
        ) : null}
      </div>
    </div>
  );
}

function TemplatePreviewModal({ templateId, onClose }) {
  const template = useMemo(() => (templateId ? getTemplateById(templateId) : null), [templateId]);
  const previewDoc = useMemo(() => (template ? buildPreviewDocument(template, SAMPLE_VARIABLES) : ''), [template]);

  if (!templateId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wide text-accent">Email template</div>
            <h2 className="font-heading text-lg text-ink">{template?.name ?? 'Template not found'}</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-ink/5 px-3 py-2 text-sm font-bold text-ink/60">Close</button>
        </div>
        <div className="scroll-thin min-h-0 flex-1 overflow-auto bg-canvas p-4">
          {template ? (
            <div className="mx-auto max-w-[640px] overflow-hidden rounded-lg border border-line bg-white shadow">
              <iframe title="Template preview" sandbox="allow-same-origin" srcDoc={previewDoc} className="h-[520px] w-full bg-white" />
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-ink/60">This step is not bound to a template yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
