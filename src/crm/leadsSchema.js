export const LEAD_FIELDS = [
  { key: 'full_name', label: 'Full Name', type: 'text', hint: "Contact's full name" },
  { key: 'email', label: 'Email', type: 'email', hint: 'Primary email address' },
  { key: 'phone_no', label: 'Phone No', type: 'phone', hint: 'Phone number' },
  { key: 'city', label: 'City', type: 'text', hint: 'City' },
  { key: 'country', label: 'Country', type: 'text', hint: 'Country' },
  { key: 'lead_date', label: 'Lead Date', type: 'date', hint: 'Date the lead was created' },
  { key: 'lead_source', label: 'Lead Source', type: 'text', hint: 'Where the lead came from' },
  { key: 'lead_category', label: 'Lead Category', type: 'text', hint: 'Segment / category' },
  { key: 'lead_status', label: 'Lead Status', type: 'text', hint: 'Pipeline status' },
  { key: 'last_contacted', label: 'Last Contacted', type: 'timestamp', hint: 'Last contact time' }
];

export const LEAD_FIELD_KEYS = LEAD_FIELDS.map((field) => field.key);

export const parseToDate = (value) => {
  const input = String(value || '').trim();
  if (!input) return null;

  const native = new Date(input);
  if (!Number.isNaN(native.getTime())) return native;

  const match = input.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (!match) return null;

  let [, firstRaw, secondRaw, yearRaw] = match;
  let year = Number(yearRaw);
  if (year < 100) year += 2000;

  const first = Number(firstRaw);
  const second = Number(secondRaw);
  const month = first > 12 ? second : first;
  const day = first > 12 ? first : second;
  const parsed = new Date(year, month - 1, day);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const coerceValue = (type, raw) => {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim();
  if (!value) return null;

  if (type === 'date' || type === 'timestamp') {
    const parsed = parseToDate(value);
    if (!parsed) return null;
    return type === 'date' ? parsed.toISOString().slice(0, 10) : parsed.toISOString();
  }

  return value;
};
