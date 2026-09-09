const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/portals/faculty/features.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Inject useLiveCourseResources
content = content.replace(
  /useLiveLeaveRecords, useLiveLeaveBalance, useLiveUsers/,
  'useLiveLeaveRecords, useLiveLeaveBalance, useLiveUsers,\n  useLiveCourseResources'
);

// Inject useUploadCourseResource
content = content.replace(
  /useAnnouncements, useCreateAnnouncement/,
  'useAnnouncements, useCreateAnnouncement,\n  useUploadCourseResource'
);

// Append the new real FacultyLibrary
const newLibraryComponent = `

// ── FACULTY LIBRARY (Units 1-5 & Catalog) ──────────────────────────────────
export function FacultyLibrary({ user }) {
  const [tab, setTab] = useState('resources');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  const { data: COURSES } = useLiveCourses();
  const assignedCourses = (COURSES || []).filter(c => c.instructor === user.id || c.instructor === user.userId || c.instructor === user.username);
  
  const { data: courseResources, isLoading } = useLiveCourseResources(
    selectedCourse?._id, 
    selectedCourse?.departmentId || user.departmentId, 
    selectedUnit
  );
  
  const uploadMutation = useUploadCourseResource();

  const handleUpload = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    form.append('courseOfferingId', selectedCourse._id);
    form.append('departmentId', selectedCourse.departmentId || user.departmentId || 'GENERAL');
    form.append('unitNumber', selectedUnit);
    
    uploadMutation.mutate(form, {
      onSuccess: () => {
        e.target.reset();
        toast.success('Resource uploaded successfully');
      }
    });
  };

  return (
    <div>
      <PageHeader title="Course Library & Resources" subtitle="Upload and manage academic resources for your assigned courses"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Course Library' }]}
      />
      <Tabs tabs={[
        { id: 'resources', label: 'Course Resources (Units 1-5)', icon: <BookOpen size={16} /> },
        { id: 'catalog', label: 'Physical Library Search', icon: <BookOpen size={16} /> },
      ]} active={tab} onChange={setTab} />
      
      {tab === 'resources' && (
        <div className="card" style={{ marginTop: 24, padding: 20 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Select Assigned Course</label>
              <select className="select" onChange={e => {
                const c = assignedCourses.find(x => x._id === e.target.value);
                setSelectedCourse(c);
                setSelectedUnit(1); // Default to unit 1
              }}>
                <option value="">-- Choose Course --</option>
                {assignedCourses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
              </select>
            </div>
            {selectedCourse && (
              <div style={{ flex: 1 }}>
                <label className="form-label">Select Unit</label>
                <select className="select" value={selectedUnit || ''} onChange={e => setSelectedUnit(Number(e.target.value))}>
                  <option value={1}>Unit 1</option>
                  <option value={2}>Unit 2</option>
                  <option value={3}>Unit 3</option>
                  <option value={4}>Unit 4</option>
                  <option value={5}>Unit 5</option>
                </select>
              </div>
            )}
          </div>

          {selectedCourse && selectedUnit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3>Upload New Resource (Unit {selectedUnit})</h3>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  <input type="text" name="title" className="input" placeholder="Resource Title" required />
                  <textarea name="description" className="input" placeholder="Description (Optional)"></textarea>
                  <select name="resourceType" className="select" required>
                    <option value="">-- Type --</option>
                    <option value="LECTURE_NOTES">Lecture Notes</option>
                    <option value="PRESENTATION">Presentation</option>
                    <option value="QUESTION_BANK">Question Bank</option>
                    <option value="VIDEO">Video Link</option>
                    <option value="SYLLABUS">Syllabus</option>
                  </select>
                  <input type="file" name="file" className="input" required />
                  <button type="submit" className="btn btn-primary" disabled={uploadMutation.isLoading}>
                    {uploadMutation.isLoading ? 'Uploading...' : 'Upload Resource'}
                  </button>
                </form>
              </div>
              
              <div>
                <h3>Current Resources (Unit {selectedUnit})</h3>
                {isLoading ? <p>Loading...</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {(courseResources || []).length === 0 ? (
                      <p style={{ color: 'var(--text-3)' }}>No resources uploaded for this unit yet.</p>
                    ) : courseResources.map(r => (
                      <div key={r._id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                        <strong>{r.title}</strong> <span className="badge badge-neutral">{r.resourceType}</span>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                          Version {r.activeVersionId?.versionNumber || 1} • {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;

content += newLibraryComponent;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected real FacultyLibrary');
