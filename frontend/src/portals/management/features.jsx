// ══════════════════════════════════════════════════════════════════════════════
// EduSphere Enterprise — Management Portal Feature Modules
// New enterprise features split into separate file for maintainability
// ══════════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Icon, ICONS } from '../../components/Layout.jsx';
import {
  PageHeader, StatCard, DataTable, StatusBadge, Tabs, FilterBar,
  CalendarWidget, TimetableGrid, Timeline, BarChart, DonutChart,
  ProgressRing, MiniSparkline, AIChatInterface, NotificationCenter,
  EmptyState, Modal, CommandPalette, WorkflowTimeline, ApprovalCard
} from '../../components/shared/index.jsx';
import {
  TIMETABLE as MOCK_TIMETABLE, CALENDAR_EVENTS as MOCK_CALENDAR_EVENTS,
  DISCUSSIONS as MOCK_DISCUSSIONS, DISCUSSION_REPLIES as MOCK_DISCUSSION_REPLIES,
  TRANSCRIPTS as MOCK_TRANSCRIPTS, FEE_RECORDS as MOCK_FEE_RECORDS,
  DOWNLOADS as MOCK_DOWNLOADS, ACTIVITY_LOG as MOCK_ACTIVITY_LOG,
  LIBRARY_RESOURCES as MOCK_LIBRARY_RESOURCES, PLACEMENT_DRIVES as MOCK_PLACEMENT_DRIVES,
  ANNOUNCEMENTS as MOCK_ANNOUNCEMENTS, NOTIFICATIONS as MOCK_NOTIFICATIONS,
  ENROLLMENTS as MOCK_ENROLLMENTS, ATTENDANCE_RECORDS as MOCK_ATTENDANCE_RECORDS,
  COURSES as MOCK_COURSES, ASSIGNMENTS as MOCK_ASSIGNMENTS,
  USERS as MOCK_USERS, DEPT_PERFORMANCE as MOCK_DEPT_PERFORMANCE,
  INSTITUTIONAL_KPIS as MOCK_INSTITUTIONAL_KPIS, BUDGET_DATA as MOCK_BUDGET_DATA,
  RESEARCH_STATS as MOCK_RESEARCH_STATS, RISK_ALERTS as MOCK_RISK_ALERTS,
  APPROVAL_QUEUE as MOCK_APPROVAL_QUEUE, PREDICTIVE_DATA as MOCK_PREDICTIVE_DATA
} from '../../mockData.js';
import {
  useLiveCourses, useLiveDepartments, useLiveAdminUsers, useLiveAuditLogs,
  useLiveDepartmentPerformance, useLiveFacultyPerformance, useLivePlacementStats,
  useLivePlacementDrives, useLiveKPIForecast, useLiveBudgets, useLiveKPIs
} from '../../api/liveData.js';

// ── INSTITUTIONAL KPIS ──────────────────────────────────────────────────────
export function InstitutionalKPIs({ user }) {
  const kpi = INSTITUTIONAL_KPIS.overall;
  return (
    <div>
      <PageHeader
        title="Institutional KPIs"
        subtitle="Key Performance Indicators of the University"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'KPIs' }]}
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <StatCard label="NAAC Rating" value={kpi.naacGrade} trend="✓ Accredited" trendType="up" icon="🏆" />
        <StatCard label="Success Rate" value={`${kpi.studentSuccessRate}%`} trend="Overall student clearance" icon="📈" />
        <StatCard label="Placement Rate" value={`${kpi.placementRate}%`} trend="Target: 90%" trendType="neutral" icon="💼" />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>KPI Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>Yearly Placement Trend (%)</h4>
            <BarChart
              data={INSTITUTIONAL_KPIS.yearlyTrend.map(t => ({ label: t.year, value: t.placement }))}
              valueKey="value"
              labelKey="label"
              color="var(--accent)"
            />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>Yearly Research Index</h4>
            <BarChart
              data={INSTITUTIONAL_KPIS.yearlyTrend.map(t => ({ label: t.year, value: t.research }))}
              valueKey="value"
              labelKey="label"
              color="var(--secondary)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FACULTY PERFORMANCE ─────────────────────────────────────────────────────
export function FacultyPerformance({ user }) {
  const { data: facultyList, isLoading } = useLiveFacultyPerformance();

  return (
    <div>
      <PageHeader
        title="Faculty Workload & Performance"
        subtitle="Assess faculty ratings, designated workloads, and research output statistics"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Faculty Performance' }]}
      />

      <DataTable
        columns={[
          { key: 'firstName', label: 'Faculty Name', render: (_, row) => <strong>{row.firstName} {row.lastName}</strong> },
          { key: 'designation', label: 'Designation' },
          { key: 'department', label: 'Department', width: 90 },
          { key: 'rating', label: 'Rating', width: 80, render: v => `★ ${v}` },
          { key: 'publications', label: 'Publications', width: 110 },
          { key: 'experience', label: 'Experience', render: v => `${v} yrs` }
        ]}
        data={facultyList || []}
      />
    </div>
  );
}

// ── STUDENT PERFORMANCE (INSTITUTIONAL) ─────────────────────────────────────
export function MgmtStudentPerf({ user }) {
  const { data: deptPerformance } = useLiveDepartmentPerformance();
  return (
    <div>
      <PageHeader
        title="Academic Performance Analytics"
        subtitle="Overall clearance rate, CGPA trends and department benchmarking"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Student Performance' }]}
      />

      <DataTable
        columns={[
          { key: 'departmentName', label: 'Department', render: v => <strong>{v}</strong> },
          { key: 'averageAttendance', label: 'Avg Attendance', render: v => `${v}%` },
          { key: 'passRate', label: 'Pass Rate', render: v => `${v}%` },
          { key: 'satisfactionIndex', label: 'Satisfaction Index', render: v => `★ ${v}` }
        ]}
        data={deptPerformance || []}
        searchable={false}
      />
    </div>
  );
}

// ── PLACEMENT ANALYTICS ─────────────────────────────────────────────────────
export function PlacementAnalytics({ user }) {
  const { data: drives } = useLivePlacementDrives();
  const activeDrives = drives ? drives.filter(d => d.status === 'ongoing').length : 0;
  
  return (
    <div>
      <PageHeader
        title="Placement Statistics"
        subtitle="Track student hiring stats, package metrics, and target drive details"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Placement Analytics' }]}
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <StatCard label="Overall Placement" value={`${INSTITUTIONAL_KPIS.overall.placementRate}%`} icon="💼" />
        <StatCard label="Active Drives" value={activeDrives} icon="🏢" />
        <StatCard label="Highest Package" value="₹45 LPA" icon="💵" />
      </div>

      <DataTable
        columns={[
          { key: 'company', label: 'Company' },
          { key: 'role', label: 'Role' },
          { key: 'package', label: 'Package' },
          { key: 'eligible', label: 'Eligible', width: 80 },
          { key: 'applied', label: 'Applied', width: 80 },
          { key: 'selected', label: 'Selected', width: 80 },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> }
        ]}
        data={drives || []}
      />
    </div>
  );
}

// ── RESEARCH STATISTICS ─────────────────────────────────────────────────────
export function ResearchStats({ user }) {
  return (
    <div>
      <PageHeader
        title="Research Statistics"
        subtitle="Manage funding parameters, index publications, and track ongoing research grants"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Research' }]}
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <StatCard label="Total Publications" value={RESEARCH_STATS.totalPublications} icon="📚" />
        <StatCard label="Total Citations" value={RESEARCH_STATS.totalCitations} icon="🔬" />
        <StatCard label="h-index" value={RESEARCH_STATS.hIndex} icon="📊" />
        <StatCard label="Total Funding" value={`₹${(RESEARCH_STATS.totalFunding / 10000000).toFixed(1)} Cr`} icon="💰" />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Publications List</h3>
        <DataTable
          columns={[
            { key: 'title', label: 'Publication Title', render: v => <strong>{v}</strong> },
            { key: 'authors', label: 'Authors', width: 150 },
            { key: 'journal', label: 'Journal/Conference' },
            { key: 'year', label: 'Year', width: 80 },
            { key: 'citations', label: 'Citations', width: 95 }
          ]}
          data={RESEARCH_STATS.recentPublications}
        />
      </div>
    </div>
  );
}

// ── BUDGET OVERVIEW ─────────────────────────────────────────────────────────
export function BudgetOverview({ user }) {
  const [data, setData] = useState(MOCK_BUDGET_DATA);
  const [modalOpen, setModalOpen] = useState(false);
  const [fromSector, setFromSector] = useState('');
  const [toSector, setToSector] = useState('');
  const [amount, setAmount] = useState('');
  const [transferring, setTransferring] = useState(false);

  const totalAllocated = data.categories.reduce((s, c) => s + c.allocated, 0);
  const totalSpent = data.categories.reduce((s, c) => s + c.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;

  function handleTransfer(e) {
    e.preventDefault();
    if (fromSector === toSector) {
      toast.error('Source and destination sectors must be different.');
      return;
    }
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid transfer amount.');
      return;
    }

    const sourceCat = data.categories.find(c => c.name === fromSector);
    if (val > (sourceCat.allocated - sourceCat.spent)) {
      toast.error(`Insufficient remaining funds in ${fromSector}.`);
      return;
    }

    setTransferring(true);
    setTimeout(() => {
      setTransferring(false);
      setData(prev => ({
        ...prev,
        categories: prev.categories.map(c => {
          if (c.name === fromSector) return { ...c, allocated: c.allocated - val };
          if (c.name === toSector) return { ...c, allocated: c.allocated + val };
          return c;
        })
      }));
      setModalOpen(false);
      setAmount('');
      toast.success(`Successfully reallocated ₹${val.toLocaleString()} to ${toSector}!`);
    }, 1200);
  }

  return (
    <div>
      <PageHeader
        title="Budget & Finance"
        subtitle="Review budget allocations versus spent metrics across administrative sectors"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Budget Overview' }]}
      >
        <button className="btn btn-primary btn-sm" onClick={() => {
          if (data.categories.length > 1) {
            setFromSector(data.categories[0].name);
            setToSector(data.categories[1].name);
          }
          setModalOpen(true);
        }}>🔄 Reallocate Funds</button>
      </PageHeader>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <StatCard label="Total Allocated" value={`₹${(totalAllocated / 10000000).toFixed(2)} Cr`} icon="💰" />
        <StatCard label="Total Spent" value={`₹${(totalSpent / 10000000).toFixed(2)} Cr`} icon="📉" />
        <StatCard label="Remaining Budget" value={`₹${(totalRemaining / 10000000).toFixed(2)} Cr`} icon="📊" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Allocated vs Spent</h3>
          {data.categories.map(cat => (
            <div key={cat.name} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>{cat.icon} {cat.name}</span>
                <strong>₹{(cat.spent / 100000).toFixed(1)}L / ₹{(cat.allocated / 100000).toFixed(1)}L</strong>
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 4, height: 8 }}>
                <div style={{ width: `${Math.min((cat.spent / cat.allocated) * 100, 100)}%`, height: '100%', borderRadius: 4, background: 'var(--accent)' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DonutChart value={totalSpent} total={totalAllocated} label="Spent" color="var(--accent)" />
        </div>
      </div>

      <Modal open={modalOpen} title="Reallocate Budget Funds" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleTransfer}>
          <div className="form-group">
            <label className="form-label">Source Sector (From)</label>
            <select className="form-select" value={fromSector} onChange={e => setFromSector(e.target.value)} disabled={transferring}>
              {data.categories.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name} (Remaining: ₹{(c.allocated - c.spent).toLocaleString()})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Target Sector (To)</label>
            <select className="form-select" value={toSector} onChange={e => setToSector(e.target.value)} disabled={transferring}>
              {data.categories.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Transfer Amount (₹)</label>
            <input type="number" className="form-input" placeholder="e.g. 500000" required value={amount} onChange={e => setAmount(e.target.value)} disabled={transferring} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)} disabled={transferring}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={transferring}>
              {transferring ? '🔄 Processing Transfer...' : '🔄 Confirm Reallocation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── RISK ALERTS ─────────────────────────────────────────────────────────────
export function RiskAlerts({ user }) {
  return (
    <div>
      <PageHeader
        title="Institutional Risk Alerts"
        subtitle="Proactive notifications regarding compliance, dropout patterns, or budget thresholds"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Risk Alerts' }]}
      />

      <DataTable
        columns={[
          { key: 'date', label: 'Date', width: 100 },
          { key: 'category', label: 'Category', width: 100 },
          { key: 'title', label: 'Alert Title', render: (v, row) => <strong>{v}</strong> },
          { key: 'description', label: 'Description' },
          { key: 'severity', label: 'Severity', render: v => <StatusBadge status={v} /> }
        ]}
        data={RISK_ALERTS}
      />
    </div>
  );
}

// ── APPROVAL CENTER ─────────────────────────────────────────────────────────
export function ApprovalCenter({ user }) {
  const [queue, setQueue] = useState(APPROVAL_QUEUE);

  function handleApprove(id) {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
  }

  function handleReject(id, reason) {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected', details: `${item.details} (Rejected Reason: ${reason})` } : item));
  }

  return (
    <div>
      <PageHeader
        title="Governance Approval Queue"
        subtitle="Approve/reject new courses, budget queries, leaves, and research allocations"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Approval Queue' }]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {queue.map(item => (
          <ApprovalCard key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} />
        ))}
      </div>
    </div>
  );
}

// ── ACCREDITATION ───────────────────────────────────────────────────────────
export function Accreditation({ user }) {
  return (
    <div>
      <PageHeader
        title="Accreditation Documentation"
        subtitle="Manage and build NAAC, NBA and international ranking self-study documentation parameters"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Accreditation' }]}
      />
      <EmptyState icon="🏆" message="Accreditation Center Ready" description="Review metrics, pass percentages and department records required for official accreditation." />
    </div>
  );
}

// ── AI INSIGHTS ─────────────────────────────────────────────────────────────
export function AIInsights({ user }) {
  const suggestions = [
    "Give institutional summary",
    "Analyze student risk trends",
    "Placement performance forecast",
    "Identify department issues",
  ];

  return (
    <div>
      <PageHeader title="AI Insights" subtitle="Powered by EduSphere AI — Get boardroom summaries and strategic metrics"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'AI Insights' }]}
      />

      <AIChatInterface
        title="EduSphere Boardroom AI"
        placeholder="Ask for strategic analysis, budget reports, or department rankings..."
        suggestions={suggestions}
        messages={[
          { role: 'assistant', content: `👋 Boardroom AI Initialized.\n\nReady to analyze institutional parameters. Ask me for:\n• **Institutional Summary** — NAAC standing, CGPA, research index\n• **Risk Alerts Analysis** — Compliance warnings, budget issues\n• **Academic Performance Forecast** — predicted pass/fail trends\n• **Placement Analytics** — package trends and eligibility cohorts`, time: '09:00 AM' }
        ]}
      />
    </div>
  );
}

// ── PREDICTIVE ANALYTICS ────────────────────────────────────────────────────
export function PredictiveAnalytics({ user }) {
  return (
    <div>
      <PageHeader
        title="Predictive Insights"
        subtitle="Machine Learning forecasts for graduation rates, placement ratios and student dropout risks"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Predictive Insights' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Dropout Risk */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>High-Risk Dropout Cohort</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Student' },
              { key: 'department', label: 'Dept', width: 70 },
              { key: 'riskScore', label: 'Risk Index', render: v => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{v}%</span> }
            ]}
            data={PREDICTIVE_DATA.dropoutRisk}
            searchable={false}
          />
        </div>

        {/* Placement prediction */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Placement Rate Predictions</h3>
          <DataTable
            columns={[
              { key: 'department', label: 'Department' },
              { key: 'current', label: 'Current Rate', render: v => `${v}%` },
              { key: 'predicted', label: 'AI Predicted', render: v => <strong style={{ color: 'var(--secondary)' }}>{v}%</strong> }
            ]}
            data={PREDICTIVE_DATA.placementPrediction}
            searchable={false}
          />
        </div>
      </div>
    </div>
  );
}

// ── EXECUTIVE REPORTS ───────────────────────────────────────────────────────
// ── EXECUTIVE REPORTS ───────────────────────────────────────────────────────
export function ExecutiveReports({ user }) {
  const [sector, setSector] = useState('financials');
  const [quarter, setQuarter] = useState('Q2 2026');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: budgets } = useLiveBudgets();
  const { data: placementDrives } = useLivePlacementDrives();
  const { data: kpis } = useLiveKPIs();
  const { data: forecast } = useLiveKPIForecast();

  function handleCompile() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (sector === 'financials') {
        const totalAllocated = (budgets || []).reduce((s, c) => s + c.allocated, 0);
        const totalSpent = (budgets || []).reduce((s, c) => s + c.spent, 0);
        const utilization = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;
        
        setReport({
          title: `Executive Financial Audit — ${quarter}`,
          summary: `The university budget utilization stands at **${utilization}%**. Overall Research funding has expanded by 14% year-over-year, while infrastructure upkeep costs are 2% below budget due to utility optimizations.`,
          kpis: [
            { label: 'Total Allocated', val: `₹${(totalAllocated / 100000).toFixed(1)} L` },
            { label: 'Total Spent', val: `₹${(totalSpent / 100000).toFixed(1)} L` },
            { label: 'Forecast', val: forecast ? forecast.message : '+4.2%' }
          ],
          risks: '⚠️ Tuition arrears from final year students (CS/EE) need immediate follow-up.'
        });
      } else if (sector === 'research') {
        setReport({
          title: `Strategic Research Index Report — ${quarter}`,
          summary: `University publication velocity remains strong, indexing **1,245 papers** (h-index of 42). Total ongoing grants active stand at ₹14.5 Cr from national and international research foundations.`,
          kpis: [
            { label: 'Active Patents', val: '12 Filed' },
            { label: 'Avg Citations', val: '18.4' },
            { label: 'PhD Guides', val: '45 Active' }
          ],
          risks: '✓ All compliance reviews passed without exceptions.'
        });
      } else {
        const totalApplied = (placementDrives || []).reduce((s, d) => s + d.appliedCount, 0);
        const totalSelected = (placementDrives || []).reduce((s, d) => s + d.selectedCount, 0);
        const placementRatio = kpis ? kpis.placementRatio : 'N/A';

        setReport({
          title: `Hiring & Placement Performance Report — ${quarter}`,
          summary: `The seasonal placement rate has touched **${placementRatio}** across all disciplines. Computer Science leads at 92%, with Civil Engineering showing a 12% rise in infrastructure consultant hiring.`,
          kpis: [
            { label: 'Offers Released', val: `${totalSelected} Offers` },
            { label: 'Students Applied', val: `${totalApplied} Applied` },
            { label: 'Attendance Rate', val: kpis ? kpis.attendanceRate : 'N/A' }
          ],
          risks: '⚠️ Gap in mock DSA interview counts for 15% of the student batch.'
        });
      }
      toast.success("Executive Strategic Review compiled successfully!");
    }, 1500);
  }

  return (
    <div>
      <PageHeader
        title="Executive Reports"
        subtitle="Generate and export boardroom-ready reports (PDF, CSV, Excel) with customized sector metrics"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Executive Reports' }]}
      />

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Strategic Compiler</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Review Target Sector</label>
            <select className="form-select" value={sector} onChange={e => setSector(e.target.value)} disabled={loading}>
              <option value="financials">Financials & Budgets</option>
              <option value="research">Research Index & Patents</option>
              <option value="placements">Hiring & Placements</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Review Target Quarter</label>
            <select className="form-select" value={quarter} onChange={e => setQuarter(e.target.value)} disabled={loading}>
              <option value="Q1 2026">Q1 2026</option>
              <option value="Q2 2026">Q2 2026</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Q4 2026">Q4 2026</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleCompile} disabled={loading}>
          {loading ? '🔍 Compiling Strategic Indicators...' : '⚡ Compile Strategic Review'}
        </button>
      </div>

      {report && (
        <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{report.title}</h4>
            <button className="btn btn-outline btn-sm">⬇ Download PDF</button>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>{report.summary}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            {report.kpis.map(k => (
              <div key={k.label} style={{ padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{k.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>{k.val}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--surface-3)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--text-2)' }}>
            <strong>Risk Status:</strong> {report.risks}
          </div>
        </div>
      )}
    </div>
  );
}
