// ══════════════════════════════════════════════════════════════════════════════
// EduSphere Enterprise — Shared UI Components
// Reusable across all portals for consistent enterprise-level UX
// ══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Icon, ICONS } from '../Layout.jsx';

// ── PAGE HEADER ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, breadcrumbs, children }) {
  return (
    <div className="page-header">
      {breadcrumbs && (
        <div className="breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={i}>
              {i > 0 && <span className="breadcrumb-sep">/</span>}
              {b.onClick
                ? <span className="breadcrumb-link" onClick={b.onClick}>{b.label}</span>
                : <span className="breadcrumb-current">{b.label}</span>
              }
            </span>
          ))}
        </div>
      )}
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

// ── STAT CARD ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, trend, trendType = 'neutral', icon, onClick, color }) {
  return (
    <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : undefined}>{value}</div>
      {trend && <div className={`stat-trend trend-${trendType}`}>{trend}</div>}
      {icon && <div className="stat-icon">{icon}</div>}
    </div>
  );
}

// ── DATA TABLE ──────────────────────────────────────────────────────────────
export function DataTable({ columns, data, searchable = true, paginated = true, pageSize = 10, exportable = false, emptyMessage = 'No data found', onRowClick, selectable = false }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(row =>
        columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortCol) {
      rows.sort((a, b) => {
        const va = a[sortCol] ?? '', vb = b[sortCol] ?? '';
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, sortCol, sortDir, columns]);

  const totalPages = paginated ? Math.ceil(filtered.length / pageSize) : 1;
  const pageData = paginated ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered;

  useEffect(() => { setPage(1); }, [search]);

  function handleSort(key) {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(key); setSortDir('asc'); }
  }

  function toggleAll() {
    if (selected.size === pageData.length) setSelected(new Set());
    else setSelected(new Set(pageData.map((_, i) => (page - 1) * pageSize + i)));
  }

  function handleExport() {
    const header = columns.map(c => c.label).join(',');
    const rows = filtered.map(r => columns.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'export.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="data-table-container">
      {(searchable || exportable) && (
        <div className="data-table-toolbar">
          {searchable && (
            <div className="data-table-search">
              <Icon d={ICONS.search} size={14} />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          )}
          <div className="data-table-actions">
            <span className="data-table-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            {exportable && <button className="btn btn-outline btn-sm" onClick={handleExport}><Icon d={ICONS.download} size={13} /> Export CSV</button>}
          </div>
        </div>
      )}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {selectable && <th style={{ width: 40 }}><input type="checkbox" onChange={toggleAll} checked={selected.size === pageData.length && pageData.length > 0} /></th>}
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)} style={col.width ? { width: col.width } : undefined} className={col.sortable !== false ? 'sortable' : ''}>
                  {col.label}
                  {sortCol === col.key && <span className="sort-indicator">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr><td colSpan={columns.length + (selectable ? 1 : 0)}><EmptyState message={emptyMessage} compact /></td></tr>
            ) : (
              pageData.map((row, i) => (
                <tr key={row.id || i} onClick={() => onRowClick?.(row)} className={onRowClick ? 'clickable-row' : ''}>
                  {selectable && <td><input type="checkbox" checked={selected.has((page - 1) * pageSize + i)} onChange={() => {
                    const idx = (page - 1) * pageSize + i;
                    const next = new Set(selected);
                    next.has(idx) ? next.delete(idx) : next.add(idx);
                    setSelected(next);
                  }} /></td>}
                  {columns.map(col => (
                    <td key={col.key} style={col.style}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginated && totalPages > 1 && (
        <div className="data-table-pagination">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
          <div className="pagination-pages">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p;
              if (totalPages <= 7) p = i + 1;
              else if (page <= 4) p = i + 1;
              else if (page >= totalPages - 3) p = totalPages - 6 + i;
              else p = page - 3 + i;
              return (
                <button key={p} className={`pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              );
            })}
          </div>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

// ── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', message = 'No data available', description, action, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'compact' : ''}`}>
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-message">{message}</div>
      {description && <div className="empty-state-desc">{description}</div>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

// ── LOADING SKELETON ────────────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 16, count = 1, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ width, height, borderRadius: 6 }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <Skeleton width="60%" height={20} />
      <Skeleton width="100%" height={14} count={3} style={{ marginTop: 12 }} />
    </div>
  );
}

// ── CONFIRM DIALOG ──────────────────────────────────────────────────────────
export function ConfirmDialog({ open, title = 'Confirm Action', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, variant = 'danger' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="icon-btn" onClick={onCancel}><Icon d={ICONS.x} size={16} /></button>
        </div>
        <div className="modal-body"><p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>{message}</p></div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn btn-${variant}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL ───────────────────────────────────────────────────────────────────
export function Modal({ open, title, onClose, children, size = 'md', footer }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="icon-btn" onClick={onClose}><Icon d={ICONS.x} size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── TABS ────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span style={{ marginRight: 6 }}>{tab.icon}</span>}
          {tab.label}
          {tab.badge != null && <span className="tab-badge">{tab.badge}</span>}
        </div>
      ))}
    </div>
  );
}

// ── FILTER BAR ──────────────────────────────────────────────────────────────
export function FilterBar({ filters, values, onChange }) {
  return (
    <div className="filter-bar">
      {filters.map(f => (
        <div key={f.key} className="filter-item">
          <label className="filter-label">{f.label}</label>
          {f.type === 'select' ? (
            <select className="filter-select" value={values[f.key] || ''} onChange={e => onChange({ ...values, [f.key]: e.target.value })}>
              <option value="">All</option>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input type={f.type || 'text'} className="filter-input" placeholder={f.placeholder} value={values[f.key] || ''} onChange={e => onChange({ ...values, [f.key]: e.target.value })} />
          )}
        </div>
      ))}
      {Object.values(values).some(v => v) && (
        <button className="btn btn-ghost btn-sm" onClick={() => onChange({})}>Clear Filters</button>
      )}
    </div>
  );
}

// ── TIMELINE ────────────────────────────────────────────────────────────────
export function Timeline({ items, maxItems }) {
  const displayed = maxItems ? items.slice(0, maxItems) : items;
  return (
    <div className="timeline">
      {displayed.map((item, i) => (
        <div key={item.id || i} className="timeline-item">
          <div className="timeline-dot">{item.icon || '●'}</div>
          <div className="timeline-content">
            <div className="timeline-title">{item.title || item.description}</div>
            {item.subtitle && <div className="timeline-subtitle">{item.subtitle}</div>}
            <div className="timeline-time">{item.timestamp || item.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CALENDAR WIDGET ─────────────────────────────────────────────────────────
export function CalendarWidget({ events = [], onDateClick, selectedDate }) {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function getEventsForDay(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr || (e.date <= dateStr && e.endDate && e.endDate >= dateStr));
  }

  const eventColors = { exam: 'var(--danger)', holiday: 'var(--secondary)', deadline: 'var(--warning)', event: 'var(--info)', academic: 'var(--accent)', placement: '#8B5CF6' };

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(new Date(year, month - 1, 1))}>←</button>
        <span className="calendar-month">{monthNames[month]} {year}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(new Date(year, month + 1, 1))}>→</button>
      </div>
      <div className="calendar-grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}
        {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} className="calendar-day empty" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          return (
            <div
              key={day}
              className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length ? 'has-events' : ''}`}
              onClick={() => onDateClick?.(dateStr, dayEvents)}
            >
              <span>{day}</span>
              {dayEvents.length > 0 && (
                <div className="calendar-dots">
                  {dayEvents.slice(0, 3).map((ev, ei) => (
                    <span key={ei} className="calendar-dot" style={{ background: eventColors[ev.type] || 'var(--accent)' }} title={ev.title} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TIMETABLE GRID ──────────────────────────────────────────────────────────
export function TimetableGrid({ slots, days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], periods = 6 }) {
  const periodTimes = ['09:00 - 09:50', '10:00 - 10:50', '11:00 - 11:50', '12:00 - 12:50', '02:00 - 02:50', '03:00 - 03:50'];
  const typeColors = { lecture: 'var(--accent)', lab: 'var(--secondary)', tutorial: 'var(--info)', seminar: '#8B5CF6' };

  return (
    <div className="timetable-container">
      <div className="timetable-grid" style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}>
        <div className="timetable-corner">Period</div>
        {days.map(d => <div key={d} className="timetable-day-header">{d}</div>)}
        {Array.from({ length: periods }, (_, p) => (
          <>
            <div key={`p${p}`} className="timetable-period-label">
              <div className="period-num">P{p + 1}</div>
              <div className="period-time">{periodTimes[p] || ''}</div>
            </div>
            {days.map(day => {
              const slot = slots.find(s => s.day === day && s.period === p + 1);
              return (
                <div key={`${day}-${p}`} className={`timetable-cell ${slot ? 'filled' : 'free'}`}>
                  {slot ? (
                    <div className="timetable-slot" style={{ borderLeft: `3px solid ${typeColors[slot.type] || 'var(--accent)'}` }}>
                      <div className="slot-code">{slot.courseCode}</div>
                      <div className="slot-title">{slot.courseTitle}</div>
                      <div className="slot-meta">
                        <span>📍 {slot.room}</span>
                        {slot.type !== 'lecture' && <span className="slot-type-badge" style={{ color: typeColors[slot.type] }}>{slot.type}</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="free-slot">—</div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ── CHARTS (Pure CSS/SVG) ───────────────────────────────────────────────────
export function BarChart({ data, valueKey = 'value', labelKey = 'label', color = 'var(--accent)', height = 160, showValues = true }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="chart-bar" style={{ height }}>
      <div className="chart-bars" style={{ height: height - 24 }}>
        {data.map((d, i) => (
          <div key={i} className="chart-bar-item">
            {showValues && <div className="chart-bar-value">{d[valueKey]}</div>}
            <div className="chart-bar-fill" style={{ height: `${(d[valueKey] / max) * 100}%`, background: d.color || color }} />
            <div className="chart-bar-label">{d[labelKey]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ value, total, label, color = 'var(--accent)', size = 120 }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = (size - 12) / 2;
  const c = Math.PI * 2 * r;
  const offset = c - (c * pct / 100);
  return (
    <div className="chart-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s var(--ease)' }}
        />
      </svg>
      <div className="donut-center">
        <div className="donut-value">{pct}%</div>
        {label && <div className="donut-label">{label}</div>}
      </div>
    </div>
  );
}

export function MiniSparkline({ data, height = 40, color = 'var(--accent)' }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const w = 100;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / (max - min || 1)) * (height - 4) - 2}`).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="sparkline">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── PROGRESS RING ───────────────────────────────────────────────────────────
export function ProgressRing({ value, size = 64, strokeWidth = 6, color = 'var(--accent)', label }) {
  const r = (size - strokeWidth) / 2;
  const c = Math.PI * 2 * r;
  const offset = c - (c * Math.min(value, 100) / 100);
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s var(--ease)' }}
        />
      </svg>
      <div className="progress-ring-center">
        <span className="progress-ring-value">{Math.round(value)}%</span>
        {label && <span className="progress-ring-label">{label}</span>}
      </div>
    </div>
  );
}

// ── BADGE / STATUS ──────────────────────────────────────────────────────────
export function StatusBadge({ status, map }) {
  const defaultMap = {
    active: { label: 'Active', cls: 'badge-success' },
    published: { label: 'Published', cls: 'badge-success' },
    completed: { label: 'Completed', cls: 'badge-success' },
    approved: { label: 'Approved', cls: 'badge-success' },
    resolved: { label: 'Resolved', cls: 'badge-success' },
    healthy: { label: 'Healthy', cls: 'badge-success' },
    paid: { label: 'Paid', cls: 'badge-success' },
    graded: { label: 'Graded', cls: 'badge-success' },
    pending: { label: 'Pending', cls: 'badge-warning' },
    upcoming: { label: 'Upcoming', cls: 'badge-info' },
    'in-progress': { label: 'In Progress', cls: 'badge-info' },
    in_progress: { label: 'In Progress', cls: 'badge-info' },
    ongoing: { label: 'Ongoing', cls: 'badge-info' },
    submitted: { label: 'Submitted', cls: 'badge-info' },
    partial: { label: 'Partial', cls: 'badge-warning' },
    warning: { label: 'Warning', cls: 'badge-warning' },
    monitoring: { label: 'Monitoring', cls: 'badge-warning' },
    not_started: { label: 'Not Started', cls: 'badge-neutral' },
    draft: { label: 'Draft', cls: 'badge-neutral' },
    open: { label: 'Open', cls: 'badge-accent' },
    closed: { label: 'Closed', cls: 'badge-neutral' },
    rejected: { label: 'Rejected', cls: 'badge-danger' },
    inactive: { label: 'Inactive', cls: 'badge-danger' },
    overdue: { label: 'Overdue', cls: 'badge-danger' },
    high: { label: 'High', cls: 'badge-danger' },
    medium: { label: 'Medium', cls: 'badge-warning' },
    low: { label: 'Low', cls: 'badge-info' },
  };
  const m = { ...defaultMap, ...map };
  const entry = m[status] || { label: status, cls: 'badge-neutral' };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
}

// ── COMMAND PALETTE (⌘K SEARCH) ─────────────────────────────────────────────
export function CommandPalette({ open, onClose, items = [], onSelect }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 100); } }, [open]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose?.(); }
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    if (!query) return items.slice(0, 8);
    const q = query.toLowerCase();
    return items.filter(i =>
      i.title.toLowerCase().includes(q) || i.subtitle?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query, items]);

  if (!open) return null;

  return (
    <div className="modal-overlay command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-palette-input-wrap">
          <Icon d={ICONS.search} size={18} />
          <input ref={inputRef} type="text" placeholder="Search students, courses, departments, assignments..." value={query} onChange={e => setQuery(e.target.value)} className="command-palette-input" />
          <kbd className="command-kbd">ESC</kbd>
        </div>
        <div className="command-palette-results">
          {filtered.length === 0 ? (
            <div className="command-palette-empty">No results found for "{query}"</div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="command-palette-item" onClick={() => { onSelect?.(item); onClose?.(); }}>
                <span className="command-palette-icon">{item.icon || '📄'}</span>
                <div className="command-palette-item-info">
                  <div className="command-palette-item-title">{item.title}</div>
                  {item.subtitle && <div className="command-palette-item-subtitle">{item.subtitle}</div>}
                </div>
                {item.category && <span className="command-palette-category">{item.category}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── WORKFLOW TIMELINE ───────────────────────────────────────────────────────
export function WorkflowTimeline({ steps }) {
  return (
    <div className="workflow-timeline">
      {steps.map((step, i) => (
        <div key={i} className={`workflow-step ${step.status}`}>
          <div className="workflow-step-indicator">
            {step.status === 'completed' ? '✓' : step.status === 'active' ? '●' : (i + 1)}
          </div>
          {i < steps.length - 1 && <div className={`workflow-step-line ${step.status === 'completed' ? 'completed' : ''}`} />}
          <div className="workflow-step-content">
            <div className="workflow-step-title">{step.title}</div>
            {step.subtitle && <div className="workflow-step-subtitle">{step.subtitle}</div>}
            {step.date && <div className="workflow-step-date">{step.date}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI CHAT INTERFACE ───────────────────────────────────────────────────────
export function AIChatInterface({ title = 'AI Assistant', placeholder = 'Ask me anything...', onSend, messages = [], suggestions = [] }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState(messages);
  const chatRef = useRef(null);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [localMessages]);

  async function handleSend(text) {
    const msg = text || input;
    if (!msg.trim()) return;
    setLocalMessages(prev => [...prev, { role: 'user', content: msg, time: new Date().toLocaleTimeString() }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    const response = onSend ? await onSend(msg) : getDefaultResponse(msg);
    setTimeout(() => {
      setLocalMessages(prev => [...prev, { role: 'assistant', content: response, time: new Date().toLocaleTimeString() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  }

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="ai-chat-avatar">🤖</div>
        <div>
          <div className="ai-chat-title">{title}</div>
          <div className="ai-chat-status">{isTyping ? 'Typing...' : 'Online'}</div>
        </div>
      </div>
      <div className="ai-chat-messages" ref={chatRef}>
        {localMessages.map((msg, i) => (
          <div key={i} className={`ai-chat-message ${msg.role}`}>
            <div className="ai-chat-bubble">
              {msg.role === 'assistant' && <span className="ai-badge">AI</span>}
              <div className="ai-chat-text" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
              <div className="ai-chat-time">{msg.time}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="ai-chat-message assistant">
            <div className="ai-chat-bubble">
              <span className="ai-badge">AI</span>
              <div className="ai-typing-indicator"><span /><span /><span /></div>
            </div>
          </div>
        )}
      </div>
      {suggestions.length > 0 && localMessages.length === 0 && (
        <div className="ai-suggestions">
          {suggestions.map((s, i) => (
            <button key={i} className="ai-suggestion-chip" onClick={() => handleSend(s)}>{s}</button>
          ))}
        </div>
      )}
      <div className="ai-chat-input-wrap">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={placeholder} onKeyDown={e => e.key === 'Enter' && handleSend()} className="ai-chat-input" />
        <button className="btn btn-primary btn-sm ai-send-btn" onClick={() => handleSend()} disabled={!input.trim()}>
          <Icon d={ICONS.zap} size={14} /> Send
        </button>
      </div>
    </div>
  );
}

function getDefaultResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('attendance')) return "📊 **Attendance Analysis**\n\nYour overall attendance is **78.5%** across 3 enrolled courses.\n\n• CS101: 85% ✅\n• CS302: 40% ⚠️ (Below threshold)\n• CS450: 75% ✅\n\n**Recommendation:** Prioritize attending CS302 classes to meet the 75% minimum requirement.";
  if (q.includes('gpa') || q.includes('grade')) return "🎓 **Academic Performance**\n\nYour current CGPA is **8.74** (out of 10).\n\n• Semester 1: SGPA 8.2\n• Semester 2: SGPA 8.5\n• Semester 3: SGPA 8.9\n• Semester 4: In Progress\n\n**Trend:** Consistently improving! You're on track for First Class with Distinction.";
  if (q.includes('assignment') || q.includes('deadline')) return "📝 **Upcoming Deadlines**\n\n1. **CS101 — Sorting Algorithm** → Due July 15 (3 days left)\n2. **CS302 — Database Schema** → Due July 20 (8 days left)\n3. **CS101 — Data Structures** → Due July 25 (13 days left)\n\n**Tip:** Start with the Sorting Algorithm assignment first as it has the closest deadline.";
  if (q.includes('placement') || q.includes('job')) return "💼 **Placement Updates**\n\n• **Microsoft** — Full Stack Developer (₹38 LPA) — Ongoing, 98 applied\n• **Google** — Software Engineer (₹45 LPA) — Opens July 25\n• **Meta** — Research Scientist (₹50 LPA) — Opens Aug 5\n\n**Your Eligibility:** Based on your CGPA (8.74) and skills, you're eligible for all upcoming drives.";
  if (q.includes('recommend') || q.includes('course')) return "📚 **Course Recommendations**\n\nBased on your academic profile and industry trends:\n\n1. **CS501 — Cloud Computing** — High demand in placement drives\n2. **CS502 — Cybersecurity** — Growing field with 35% salary premium\n3. **CS503 — Full Stack Development** — Most requested by recruiters\n\nThese align with your strong foundation in CS and Database Systems.";
  return "🤖 I've analyzed your query. Based on the EduSphere data:\n\n• Your academic profile is strong with CGPA 8.74\n• You have 3 active course enrollments\n• 2 upcoming assignment deadlines\n• Placement season is active with 3 upcoming drives\n\nWould you like me to dive deeper into any of these areas? You can ask about:\n• Attendance analysis\n• Grade predictions\n• Assignment priorities\n• Placement preparation\n• Course recommendations";
}

// ── NOTIFICATION CENTER ─────────────────────────────────────────────────────
export function NotificationCenter({ notifications, onMarkRead, onMarkAllRead, onNavigate }) {
  const [filter, setFilter] = useState('all');
  const types = ['all', 'assignment', 'quiz', 'attendance', 'certificate', 'announcement', 'grade', 'system'];
  const typeIcons = { assignment: '📝', quiz: '⚡', attendance: '📅', certificate: '🏆', announcement: '📢', grade: '🎯', system: '⚙️' };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div>
      <PageHeader title="Notification Center" subtitle={`${unread} unread notification${unread !== 1 ? 's' : ''}`}>
        {unread > 0 && <button className="btn btn-outline btn-sm" onClick={onMarkAllRead}>Mark All Read</button>}
      </PageHeader>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {types.map(t => (
          <div key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? '📬 All' : `${typeIcons[t] || '📄'} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
          </div>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="🔔" message="No notifications" description={filter !== 'all' ? `No ${filter} notifications found.` : 'You\'re all caught up!'} />
      ) : (
        <div className="notification-list">
          {filtered.map(n => (
            <div key={n.id} className={`notification-card ${!n.read ? 'unread' : ''}`} onClick={() => onMarkRead?.(n.id)}>
              <div className="notification-icon">{typeIcons[n.type] || '📄'}</div>
              <div className="notification-content">
                <div className="notification-title">{n.title}</div>
                <div className="notification-desc">{n.description}</div>
                <div className="notification-meta">
                  <span className="notification-time">{n.createdAt}</span>
                  <StatusBadge status={n.type} map={{ assignment: { label: 'Assignment', cls: 'badge-accent' }, quiz: { label: 'Quiz', cls: 'badge-info' }, attendance: { label: 'Attendance', cls: 'badge-warning' }, certificate: { label: 'Certificate', cls: 'badge-success' }, announcement: { label: 'Announcement', cls: 'badge-neutral' }, grade: { label: 'Grade', cls: 'badge-accent' }, system: { label: 'System', cls: 'badge-neutral' } }} />
                </div>
              </div>
              {!n.read && <div className="notification-unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── APPROVAL WORKFLOW CARD ──────────────────────────────────────────────────
export function ApprovalCard({ item, onApprove, onReject, showWorkflow = true }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="approval-card">
      <div className="approval-card-header">
        <div>
          <StatusBadge status={item.priority || item.status} />
          <span className="approval-type-tag">{item.type}</span>
        </div>
        <span className="approval-date">{item.requestedAt}</span>
      </div>
      <h4 className="approval-title">{item.title}</h4>
      <p className="approval-details">{item.details}</p>
      <div className="approval-meta">
        <span>Requested by: <strong>{item.requestedBy}</strong></span>
      </div>
      {showWorkflow && (
        <WorkflowTimeline steps={[
          { title: 'Request Submitted', status: 'completed', date: item.requestedAt },
          { title: 'Under Review', status: item.status === 'pending' ? 'active' : 'completed' },
          { title: item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Awaiting Decision', status: item.status === 'pending' ? 'pending' : 'completed' },
        ]} />
      )}
      {item.status === 'pending' && (
        <div className="approval-actions">
          {showReject ? (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <input className="form-input" style={{ flex: 1 }} placeholder="Reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              <button className="btn btn-danger btn-sm" onClick={() => { onReject?.(item.id, rejectReason); setShowReject(false); }}>Reject</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReject(false)}>Cancel</button>
            </div>
          ) : (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => onApprove?.(item.id)}>✓ Approve</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowReject(true)}>✗ Reject</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
