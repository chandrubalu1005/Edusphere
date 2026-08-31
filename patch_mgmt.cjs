const fs = require('fs');
let code = fs.readFileSync('frontend/src/portals/ManagementPortal.jsx', 'utf8');

// 1. Add hook import
code = code.replace(
  /} from '\.\.\/api\/liveData\.js';/,
  ', useLivePlacementStats } from \'../api/liveData.js\';'
);

// 2. Insert useLivePlacementStats into AnalyticsReports component
code = code.replace(
  'const { data: DEPT_PERFORMANCE = [] } = useLiveDepartmentPerformance();',
  'const { data: DEPT_PERFORMANCE = [] } = useLiveDepartmentPerformance();\n  const { data: PLACEMENT_STATS } = useLivePlacementStats();'
);

// 3. Replace Placement Stats JSX
const placementStatsRegex = /<div className="card-title">Placement Statistics — AY 2025-26<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newPlacementStatsJSX = `<div className="card-title">Placement Statistics — AY 2025-26</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Depts Participating', value: PLACEMENT_STATS?.total || 0 },
              { label: 'Students Evaluated', value: PLACEMENT_STATS?.departments?.reduce((sum, d) => sum + (d.eligibleStudents || 0), 0) || 0 },
              { label: 'Total Passed', value: PLACEMENT_STATS?.departments?.reduce((sum, d) => sum + (d.passedCount || 0), 0) || 0 },
              { label: 'Avg Assessment Score', value: (PLACEMENT_STATS?.departments?.reduce((sum, d) => sum + (d.avgAssessmentScore || 0), 0) / (PLACEMENT_STATS?.total || 1)).toFixed(1) || 0 },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {(PLACEMENT_STATS?.departments || []).slice(0, 8).map(d => (
              <div key={d.department} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-2)' }}>{d.passedCount} Passed</div>
                <div style={{
                  width: '100%',
                  height: \`\${Math.max(10, ((d.passedCount || 0) / 100) * 80)}px\`,
                  background: 'linear-gradient(180deg, var(--secondary), var(--secondary-light))',
                  borderRadius: '3px 3px 0 0', opacity: 0.85,
                }}></div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'center' }}>{d.department}</div>
              </div>
            ))}
          </div>
        </div>
      </div>`;

code = code.replace(placementStatsRegex, newPlacementStatsJSX);

fs.writeFileSync('frontend/src/portals/ManagementPortal.jsx', code);
console.log('Success ManagementPortal');
