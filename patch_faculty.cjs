const fs = require('fs');
let code = fs.readFileSync('frontend/src/portals/FacultyPortal.jsx', 'utf8');

// 1. Imports
code = code.replace(
  /} from '\.\.\/api\/hooks\.js';/,
  ', useCreateQRSession, useCourseAttendance, useAssignments } from \'../api/hooks.js\';'
);

// 2. Add Component
const rowComponent = `
function CourseAnalyticsRow({ course, index }) {
  const { data: attendance } = useCourseAttendance(course.id || course._id);
  const { data: assignments } = useAssignments(course.id || course._id);
  
  let attPercent = 0;
  if (attendance && attendance.records && attendance.records.length > 0) {
    const total = attendance.records.length;
    const present = attendance.records.filter(r => r.status === 'present').length;
    attPercent = Math.round((present / total) * 100);
  }

  let avgGrade = 0;

  return (
    <tr key={course.id || course._id}>
      <td>
        <div style={{ fontWeight: 600 }}>{course.code}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{course.title}</div>
      </td>
      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{course.enrolledStudents?.length || 0}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="progress-bar" style={{ width: 60, height: 6, margin: 0 }}>
            <div className={\`progress-fill \${attPercent < 75 ? 'bg-danger' : 'bg-success'}\`} style={{ width: \`\${attPercent}%\` }}></div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{attPercent}%</span>
        </div>
      </td>
      <td>
        <div className="badge badge-warning" style={{ background: 'var(--warning-soft)', color: 'var(--warning)', fontWeight: 700 }}>
          {avgGrade} / 100
        </div>
      </td>
      <td>
        <span className={\`badge \${course.status === 'published' ? 'badge-success' : 'badge-neutral'}\`}>
          {course.status === 'published' ? 'Active' : 'Setup'}
        </span>
      </td>
    </tr>
  );
}
`;
code = code.replace('// ── FACULTY ANALYTICS', rowComponent + '\n// ── FACULTY ANALYTICS');

// 3. Replace table body for FacultyAnalytics
const tableRegex = /\{myCourses\.map\(\(c, i\) => \{\s*const att = \[89, 72, 95\]\[i % 3\];\s*const avgGrade = \[82, 77, 91\]\[i % 3\];\s*return \([\s\S]*?\);\s*\}\)\}/;
code = code.replace(tableRegex, '{myCourses.map((c, i) => <CourseAnalyticsRow key={c.id || c._id} course={c} index={i} />)}');

// 4. QR Logic
code = code.replace(
  'const [qrTime, setQrTime] = useState(300);',
  'const [qrTime, setQrTime] = useState(300);\n  const createQRSession = useCreateQRSession();\n  const [sessionData, setSessionData] = useState(null);\n  const handleStartQR = () => {\n    if (!selectedCourse) {\n      toast.error("Please select a course first");\n      return;\n    }\n    createQRSession.mutate({ courseId: selectedCourse, date, windowMins: 5 }, {\n      onSuccess: (data) => {\n        setSessionData(data);\n        setQrTime(5 * 60);\n        setQrModal(true);\n      }\n    });\n  };'
);

// 5. QR Button
code = code.replace(
  '<button className="btn btn-outline btn-sm" onClick={() => { setQrTime(300); setQrModal(true); }}>🔲 QR Code Mode</button>',
  '<button className="btn btn-outline btn-sm" onClick={handleStartQR} disabled={createQRSession.isPending}>{createQRSession.isPending ? "Starting..." : "🔲 QR Code Mode"}</button>'
);

// 6. QR Modal Data
code = code.replace('{qrModal && (', '{qrModal && sessionData && (');

const oldPinDiv = `<div style={{ fontSize: 42, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '4px', color: 'var(--text-1)', lineHeight: 1 }}>
                    742819
                  </div>`;
const newPinDiv = `<div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '2px', color: 'var(--text-1)', lineHeight: 1 }}>
                    {sessionData.sessionId?.split("-")[0].toUpperCase()}
                  </div>`;
code = code.replace(oldPinDiv, newPinDiv);

const qrRegex = /<div style=\{\{ width: '100%', height: '100%', background: '#000', borderRadius: 4, display: 'grid', gridTemplateColumns: 'repeat\(5, 1fr\)', gap: 2, padding: 4 \}\}>[\s\S]*?<\/div>/;
code = code.replace(qrRegex, '<img src={sessionData.qrBase64} alt="QR Code" style={{ width: "100%", height: "100%", objectFit: "contain" }} />');

fs.writeFileSync('frontend/src/portals/FacultyPortal.jsx', code);
console.log('Success');
