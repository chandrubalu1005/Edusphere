const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/portals/HODPortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Inject import for useLiveLibraryAnalytics
content = content.replace(
  /import { EmptyState } from '\.\.\/components\/shared\/index\.jsx';/,
  "import { EmptyState, StatCard } from '../components/shared/index.jsx';\nimport { useLiveLibraryAnalytics } from '../api/liveData.js';"
);

const newHODLibrary = `
function HODLibrary() {
  const { user } = useAuth();
  const { data, isLoading } = useLiveLibraryAnalytics(user.departmentId);

  if (isLoading) return <div style={{ padding: 40 }}>Loading department library analytics...</div>;

  const academic = data?.academic || { coursesWithResources: 0, unitCoverage: [], resourceTypes: [] };

  return (
    <div className="page-container">
      <PageHeader title="Department Library Health" subtitle="Monitor resource completeness and faculty contributions" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Courses w/ Resources" value={academic.coursesWithResources} icon={<BookOpen size={20} />} trend="+2" trendUp={true} />
        <StatCard title="Total Resource Files" value={academic.resourceTypes.reduce((acc, curr) => acc + curr.count, 0)} icon={<BookOpen size={20} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Unit Coverage (1-5)</h3>
          {academic.unitCoverage.length === 0 ? (
            <p style={{ color: 'var(--text-3)' }}>No course resources uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {academic.unitCoverage.map(u => (
                <div key={u.unit} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'var(--bg-2)', borderRadius: 6 }}>
                  <span>{u.unit}</span>
                  <strong>{u.count} resources</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Resource Types</h3>
           {academic.resourceTypes.length === 0 ? (
            <p style={{ color: 'var(--text-3)' }}>No course resources uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {academic.resourceTypes.map(r => (
                <div key={r.type} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'var(--bg-2)', borderRadius: 6 }}>
                  <span>{r.type}</span>
                  <strong>{r.count}</strong>
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

content = content.replace(/function HODLibrary\(\) \{[\s\S]*?(?=export default function HODPortal\(\) \{)/, newHODLibrary + '\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected real HODLibrary');
