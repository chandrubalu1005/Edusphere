const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/portals/management/features.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Inject the useLiveLibraryAnalytics hook
content = content.replace(
  /useLiveFinance/g,
  'useLiveFinance, useLiveLibraryAnalytics'
);

// We need to replace the old export function LibraryAnalytics({ user }) 
// with the real data-driven implementation.
const newLibraryAnalytics = `
// ── INSTITUTIONAL LIBRARY ANALYTICS ─────────────────────────────────────────
export function LibraryAnalytics({ user }) {
  const { data, isLoading } = useLiveLibraryAnalytics();

  if (isLoading) return <div style={{ padding: 40 }}>Loading institutional library analytics...</div>;

  const circulation = data?.circulation || { activeLoans: 0, overdueLoans: 0 };
  const financials = data?.financials || { unpaidFines: 0 };
  const inventory = data?.inventory || { totalCopies: 0, missingCopies: 0, missingPercentage: 0 };
  const academic = data?.academic || { coursesWithResources: 0, unitCoverage: [], resourceTypes: [] };

  return (
    <div>
      <PageHeader
        title="Library Analytics"
        subtitle="Global real-time overview of the CampusSphere Enterprise Library"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Library' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Physical Inventory" value={inventory.totalCopies} icon={<BookOpen size={20} />} trend="Global" />
        <StatCard title="Active Loans" value={circulation.activeLoans} icon={<Activity size={20} />} trend={circulation.overdueLoans + " overdue"} trendUp={false} />
        <StatCard title="Courses with Resources" value={academic.coursesWithResources} icon={<CheckCircle2 size={20} />} />
        <StatCard title="Unpaid Fines" value={"$" + financials.unpaidFines} icon={<TrendingUp size={20} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Physical Inventory Health</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-2)', borderRadius: 8, marginBottom: 8 }}>
            <span>Missing / Lost Copies</span>
            <strong style={{ color: 'var(--danger)' }}>{inventory.missingCopies} ({inventory.missingPercentage}%)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-2)', borderRadius: 8 }}>
            <span>Circulation Utilization</span>
            <strong>{inventory.totalCopies > 0 ? ((circulation.activeLoans / inventory.totalCopies) * 100).toFixed(1) : 0}%</strong>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Course Resource Coverage (Units 1-5)</h3>
          {academic.unitCoverage.length === 0 ? (
            <p style={{ color: 'var(--text-3)' }}>No resources uploaded globally.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {academic.unitCoverage.map(u => (
                <div key={u.unit} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-2)', borderRadius: 8 }}>
                  <span>{u.unit}</span>
                  <strong>{u.count} Assets</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

// Replace the old implementation
content = content.replace(
  /\/\/ ── INSTITUTIONAL LIBRARY ANALYTICS ─────────────────────────────────────────[\s\S]*?(?=\/\/ ── [A-Z ]+ ─────────────────────────────────────────)/,
  newLibraryAnalytics + '\n\n'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected real LibraryAnalytics');
