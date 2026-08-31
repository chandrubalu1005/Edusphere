const fs = require('fs');

// 1. Add useRateCourse to hooks.js
let hooks = fs.readFileSync('frontend/src/api/hooks.js', 'utf8');
if (!hooks.includes('useRateCourse')) {
  const useRateCourseCode = `
export const useRateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, rating, comment }) => {
      const res = await api.post(\`/courses/\${courseId}/rate\`, { rating, comment });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Course rated successfully!');
      queryClient.invalidateQueries(['enrolledCourses']);
    }
  });
};
`;
  // Insert before the last closing brace or just append
  hooks = hooks + useRateCourseCode;
  fs.writeFileSync('frontend/src/api/hooks.js', hooks);
}

// 2. Update StudentPortal.jsx
let sp = fs.readFileSync('frontend/src/portals/StudentPortal.jsx', 'utf8');

// A. Import useRateCourse and useLivePlacementDrives
if (!sp.includes('useRateCourse')) {
  sp = sp.replace(
    'useScanQRSession } from \'../api/hooks.js\';',
    'useScanQRSession, useRateCourse } from \'../api/hooks.js\';'
  );
}
if (!sp.includes('useLivePlacementDrives')) {
  sp = sp.replace(
    'useLiveEnrollments } from \'../api/liveData.js\';',
    'useLiveEnrollments, useLivePlacementDrives } from \'../api/liveData.js\';'
  );
}

// B. BUG-007: Fix Campus Drives mock
if (sp.includes("{ company: 'Google', date: 'Jul 18', slots: 5 }")) {
  const oldDrivesBlock = `              <div className="card-header"><div className="card-title">Campus Drives</div></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { company: 'Google', date: 'Jul 18', slots: 5 },
                  { company: 'Microsoft', date: 'Jul 22', slots: 8 },
                  { company: 'Infosys', date: 'Aug 1', slots: 25 },
                ].map(d => (
                  <div key={d.company} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{d.company}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)' }}>📅 {d.date} · {d.slots} openings</div>
                    </div>
                    <button className="btn btn-primary btn-sm">Register</button>
                  </div>
                ))}
              </div>`;

  const newDrivesBlock = `              <div className="card-header"><div className="card-title">Campus Drives</div></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CampusDrivesWidget />
              </div>`;
  sp = sp.replace(oldDrivesBlock, newDrivesBlock);
  
  // Add CampusDrivesWidget component
  const widgetComponent = `
function CampusDrivesWidget() {
  const { data: drives = [] } = useLivePlacementDrives('upcoming');
  if (!drives || drives.length === 0) return <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No upcoming drives.</div>;
  
  return (
    <>
      {drives.slice(0, 3).map(d => (
        <div key={d.id || d.company} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{d.company}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>📅 {new Date(d.date).toLocaleDateString()} · {d.openings || 0} openings</div>
          </div>
          <button className="btn btn-primary btn-sm">Register</button>
        </div>
      ))}
    </>
  );
}
`;
  sp = sp.replace('// ── MAIN DASHBOARD ────────────────────────────────────────────────────────', widgetComponent + '\n// ── MAIN DASHBOARD ────────────────────────────────────────────────────────');
}

// C. BUG-006: Fix Course Rating Mock
if (sp.includes("toast.error(`Service unavailable (Rating API not connected)`)")) {
  sp = sp.replace(
    'const myCourses = COURSES.filter(c => ENROLLMENTS.some(e => e.courseId === c.id));',
    'const myCourses = COURSES.filter(c => ENROLLMENTS.some(e => e.courseId === c.id));\n    const rateCourse = useRateCourse();'
  );
  
  sp = sp.replace(
    /const rating = prompt\("Rate this course \(1-5\):"\);\s*if \(rating >= 1 && rating <= 5\) toast\.error\(`Service unavailable \(Rating API not connected\)`\);/,
    "const rating = prompt(\"Rate this course (1-5):\");\n                              if (rating >= 1 && rating <= 5) rateCourse.mutate({ courseId: c.id, rating: parseInt(rating, 10), comment: '' });"
  );
}

fs.writeFileSync('frontend/src/portals/StudentPortal.jsx', sp);
console.log('Success StudentPortal BUG-006 & BUG-007 fixed');
