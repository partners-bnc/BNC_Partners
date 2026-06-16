import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Mail, Sparkles, Clock, GitBranch, Workflow, Flag, Eye } from 'lucide-react';
import { NODE_KIND_META } from '../../crm/campaigns';

export const KIND_ICONS = {
  trigger: Zap,
  email: Mail,
  aiEmail: Sparkles,
  wait: Clock,
  condition: GitBranch,
  action: Workflow,
  end: Flag
};

const cx = (...classes) => classes.filter(Boolean).join(' ');

const HANDLE_CLASS = 'campaign-handle';

// Shared card shell: icon tile + uppercase category label + bold title, plus optional secondary row.
function NodeCard({ kind, data, accent, children, selected }) {
  const meta = NODE_KIND_META[kind] || {};
  const Icon = KIND_ICONS[kind] || Zap;
  return (
    <div
      className={cx(
        'w-[210px] overflow-hidden rounded-2xl border bg-surface text-left shadow-sm transition',
        selected ? 'border-accent shadow-lg ring-2 ring-accent/20' : 'border-line hover:shadow-md',
        accent
      )}
    >
      <div className="flex items-center gap-2 px-3 pt-3">
        <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', meta.chip)}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink/35">{meta.label}</span>
      </div>
      <div className="px-3 pb-1 pt-1.5 text-[13px] font-bold leading-tight text-ink">{data.label}</div>
      {children}
    </div>
  );
}

function MutedRow({ children }) {
  return <div className="px-3 pb-3 text-[11px] font-medium text-ink/45">{children}</div>;
}

function TemplateRow({ data }) {
  return (
    <div className="mx-3 mb-3 mt-1 flex items-center justify-between gap-2 rounded-xl border border-line/70 bg-canvas px-2.5 py-1.5">
      <div className="min-w-0">
        <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink/35">Template</div>
        <div className="truncate text-[11px] font-semibold text-ink/80">{data.templateName || 'No template'}</div>
      </div>
      <Eye className="h-3.5 w-3.5 shrink-0 text-ink/30" />
    </div>
  );
}

function TriggerNode({ data, selected }) {
  return (
    <NodeCard kind="trigger" data={data} selected={selected}>
      <MutedRow>Entry point</MutedRow>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeCard>
  );
}

function EmailNode({ data, selected }) {
  return (
    <NodeCard kind="email" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <TemplateRow data={data} />
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeCard>
  );
}

function AiEmailNode({ data, selected }) {
  return (
    <NodeCard kind="aiEmail" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <TemplateRow data={data} />
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeCard>
  );
}

function WaitNode({ data, selected }) {
  return (
    <NodeCard kind="wait" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <MutedRow>{`Wait ${data.waitValue ?? 1} ${data.waitUnit || 'days'}`}</MutedRow>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeCard>
  );
}

function ActionNode({ data, selected }) {
  return (
    <NodeCard kind="action" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <MutedRow>{data.actionType || 'Internal action'}</MutedRow>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </NodeCard>
  );
}

function EndNode({ data, selected }) {
  return (
    <NodeCard kind="end" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <MutedRow>{`Outcome: ${data.outcome || 'done'}`}</MutedRow>
    </NodeCard>
  );
}

function ConditionNode({ data, selected }) {
  const branches = Array.isArray(data.branches) && data.branches.length ? data.branches : ['Yes', 'No'];
  return (
    <NodeCard kind="condition" data={data} selected={selected}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <div className="relative px-3 pb-4 pt-1">
        <div className="flex flex-wrap gap-1">
          {branches.map((branch) => (
            <span
              key={branch}
              className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700"
            >
              {branch}
            </span>
          ))}
        </div>
        {branches.map((branch, index) => (
          <Handle
            key={branch}
            id={branch}
            type="source"
            position={Position.Bottom}
            className={HANDLE_CLASS}
            style={{ left: `${((index + 0.5) / branches.length) * 100}%` }}
          />
        ))}
      </div>
    </NodeCard>
  );
}

export const nodeTypes = {
  trigger: TriggerNode,
  email: EmailNode,
  aiEmail: AiEmailNode,
  wait: WaitNode,
  condition: ConditionNode,
  action: ActionNode,
  end: EndNode
};
