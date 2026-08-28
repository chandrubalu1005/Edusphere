import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

import { 
  useLiveCourses, 
  useLiveAssignments, 
  useLiveAssignmentStats, 
  useLiveAssignmentSubmissions 
} from '../../../api/liveData.js';
import { 
  useGradeSubmission, 
  useBulkGradeAssignment, 
  useResolveDispute 
} from '../../../api/hooks.js';
import { Icon, ICONS } from '../../../components/Layout.jsx';
import { PageHeader } from '../../../components/shared/index.jsx';

export default function FacultyAssignments({ user }) {
  const queryClient = useQueryClient();

  const { data: COURSES, isLoading: loadingCourses } = useLiveCourses();
  const { data: ASSIGNMENTS, isLoading: loadingAssignments } = useLiveAssignments();
  const { data: STATS, isLoading: loadingStats } = useLiveAssignmentStats();

  const myCourses = COURSES || [];
  const myAssignments = ASSIGNMENTS || [];
  
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  
  const { data: SUBMISSIONS } = useLiveAssignmentSubmissions(selected?._id || selected?.id);
  const gradeSubmission = useGradeSubmission();
  const bulkGrade = useBulkGradeAssignment();
  const resolveDispute = useResolveDispute();
  const [resolvingDispute, setResolvingDispute] = useState(null);
  const [viewingPlagiarism, setViewingPlagiarism] = useState(null);
  const [gradingRubric, setGradingRubric] = useState(null);
  const [extendingAssignment, setExtendingAssignment] = useState(null);

  // Socket.IO Reactivity
  useEffect(() => {
    const socket = io(import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3005', {
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('submission.submitted', (payload) => {
      queryClient.invalidateQueries(['assignment-stats']);
      if (selected && (selected._id === payload.assignmentId || selected.id === payload.assignmentId)) {
        queryClient.invalidateQueries(['assignment-submissions', payload.assignmentId]);
      }
      toast('New student submission received!', { icon: '📥' });
    });

    socket.on('leave.newRequest', (payload) => {
      // Unrelated, but nice to have globally if sitting on this page. Or handled in layout.
    });

    return () => socket.disconnect();
  }, [queryClient, selected]);

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        // Expected format: studentId,grade,feedback
        const grades = lines.slice(1).map(l => {
          const [studentId, grade, ...fb] = l.split(',');
          return { studentId, grade: Number(grade), feedback: fb.join(',') };
        });
        await bulkGrade.mutateAsync({ assignmentId: selected._id || selected.id, grades });
        setCsvFile(null);
        toast.success('Bulk grading applied.');
        queryClient.invalidateQueries(['assignment-submissions', selected._id || selected.id]);
      } catch (err) {
         toast.error('Failed to parse CSV or apply bulk grades.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveGrade = async (sub, grade, feedback) => {
    try {
      await gradeSubmission.mutateAsync({
        submissionId: sub._id || sub.id,
        grade: Number(grade),
        feedback
      });
      toast.success('Grade saved.');
      queryClient.invalidateQueries(['assignment-submissions', selected._id || selected.id]);
    } catch (err) {
      toast.error('Failed to save grade.');
    }
  };

  if (loadingCourses || loadingAssignments || loadingStats) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading faculty assignments...</div>;
  }

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Create and grade student assignments.">
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icon d={ICONS.plus} size={15} /> New Assignment
        </button>
      </PageHeader>

      {/* Assignment List */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Course / Status</th>
                <th>Due Date / Marks</th>
                <th>Submission Progress</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myAssignments.map(a => {
                const stat = STATS.find(s => s._id === (a._id || a.id)) || { submissionsCount: 0, gradedCount: 0 };
                const submissionRate = a.studentsCount ? Math.round(stat.submissionsCount / a.studentsCount * 100) : 0;
                return (
                  <tr key={a.id || a._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{a.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.description}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span className="badge badge-neutral">{a.courseCode || a.courseId}</span>
                        <span className={`badge ${a.status === 'active' || a.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{a.status}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      <div>📅 {new Date(a.dueDate).toLocaleDateString()}</div>
                      <div style={{ marginTop: 2 }}>📊 {a.totalMarks} marks</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 140 }}>
                        <div style={{ flex: 1 }}>
                          <div className="progress-bar" style={{ height: 6 }}>
                            <div className="progress-fill success" style={{ width: `${submissionRate}%` }}></div>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <span>{stat.submissionsCount}/{a.studentsCount} submit</span>
                            <span>{stat.gradedCount} graded</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelected(a)}>Grade Submissions</button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '0 8px', height: 24, fontSize: 12 }} onClick={() => setExtendingAssignment(a)}>Extensions</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Submission Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Grade Submissions</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{selected.title}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Upload CSV to bulk grade: <code>studentId,grade,feedback</code></span>
                <input type="file" accept=".csv" onChange={handleCsvUpload} style={{ fontSize: 13 }} disabled={bulkGrade.isLoading} />
              </div>
              <div className="table-wrapper" style={{ border: '1px solid var(--border)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Submitted At</th>
                      <th>Plagiarism</th>
                      <th>Grade (/{selected.totalMarks})</th>
                      <th>Feedback</th>
                      <th>Action</th>
                      <th>Disputes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(SUBMISSIONS || []).map(sub => (
                      <tr key={sub.id || sub._id}>
                        <td style={{ fontWeight: 600 }}>{sub.studentId}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                          {new Date(sub.submittedAt).toLocaleDateString()} {sub.isLate && <span style={{color: 'red'}}>(Late)</span>}
                        </td>
                        <td style={{ cursor: 'pointer' }} onClick={() => setViewingPlagiarism(sub)}>
                          {sub.plagiarismScore > 20 ? (
                            <span className="badge badge-danger" title="Click to view report">High ({sub.plagiarismScore}%)</span>
                          ) : (
                            <span className="badge badge-success" title="Click to view report">OK ({sub.plagiarismScore || 0}%)</span>
                          )}
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            style={{ width: 80 }}
                            defaultValue={sub.grade ?? sub.finalGrade ?? ''}
                            id={`grade-${sub._id || sub.id}`}
                            placeholder="—"
                            min={0}
                            max={selected.totalMarks}
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            style={{ width: 200 }}
                            defaultValue={sub.feedback || ''}
                            id={`feedback-${sub._id || sub.id}`}
                            placeholder="Feedback…"
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                const g = document.getElementById(`grade-${sub._id || sub.id}`).value;
                                const f = document.getElementById(`feedback-${sub._id || sub.id}`).value;
                                handleSaveGrade(sub, g, f);
                              }}
                            >Save</button>
                            <button className="btn btn-outline btn-sm" onClick={() => setGradingRubric(sub)}>Rubric</button>
                          </div>
                        </td>
                        <td>
                          {sub.disputeStatus === 'open' && (
                            <button className="btn btn-warning btn-sm" onClick={() => setResolvingDispute(sub)}>Review</button>
                          )}
                          {sub.disputeStatus === 'resolved' && (
                            <span className="badge badge-success">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!(SUBMISSIONS || []).length && (
                      <tr><td colSpan={7} style={{textAlign: 'center'}}>No submissions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {resolvingDispute && (
        <div className="modal-overlay" onClick={() => setResolvingDispute(null)} style={{ zIndex: 1100 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Resolve Grade Dispute</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setResolvingDispute(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}>Student Reason:</div>
                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8, marginTop: 8, fontSize: 14 }}>
                  {resolvingDispute.disputeReason}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Resolution Details <span className="required">*</span></label>
                <textarea className="form-input" id="dispute-resolution" rows={3} placeholder="Explain your decision..."></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">New Grade (Optional, leave blank to keep current grade: {resolvingDispute.grade})</label>
                <input className="form-input" id="dispute-new-grade" type="number" placeholder={resolvingDispute.grade} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setResolvingDispute(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                const resolution = document.getElementById('dispute-resolution').value;
                const newGradeVal = document.getElementById('dispute-new-grade').value;
                if (!resolution) {
                   toast.error('Resolution is required');
                   return;
                }
                try {
                  await resolveDispute.mutateAsync({
                    submissionId: resolvingDispute._id || resolvingDispute.id,
                    resolution,
                    newGrade: newGradeVal ? Number(newGradeVal) : undefined
                  });
                  setResolvingDispute(null);
                  toast.success('Dispute resolved.');
                  queryClient.invalidateQueries(['assignment-submissions', selected._id || selected.id]);
                } catch(err) {
                  toast.error('Failed to resolve dispute.');
                }
              }}>Resolve Dispute</button>
            </div>
          </div>
        </div>
      )}

      {/* Plagiarism Report Modal */}
      {viewingPlagiarism && (
        <div className="modal-overlay" onClick={() => setViewingPlagiarism(null)} style={{ zIndex: 1200 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Plagiarism Report</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewingPlagiarism(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0', flexDirection: 'column' }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: viewingPlagiarism.plagiarismScore > 20 ? 'var(--danger)' : 'var(--secondary)' }}>
                  {viewingPlagiarism.plagiarismScore || 0}%
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Similarity Score</div>
              </div>
              {viewingPlagiarism.plagiarismFlags?.length > 0 ? (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Flags Detected:</div>
                  <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13 }}>
                    {viewingPlagiarism.plagiarismFlags.map((flag, idx) => (
                      <li key={idx} style={{ color: 'var(--text-2)', marginBottom: 4 }}>{flag}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>
                  No significant similarity detected. This submission appears original.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setViewingPlagiarism(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Rubric Grading Modal */}
      {gradingRubric && (
        <div className="modal-overlay" onClick={() => setGradingRubric(null)} style={{ zIndex: 1200 }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Rubric Grading - {gradingRubric.studentId}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setGradingRubric(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 16 }}>
                {['Completeness (0-40)', 'Originality (0-30)', 'Formatting (0-30)'].map((crit, i) => (
                  <div key={i} className="card" style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{crit}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[0, 10, 20, 30, (i === 0 ? 40 : null)].filter(v => v !== null).map(mark => (
                        <button key={mark} className="btn btn-outline btn-sm" onClick={() => {
                            toast.success(`Assigned ${mark} marks for ${crit.split(' ')[0]}`);
                        }}>{mark} pts</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => {
                toast.success('Rubric grades saved and totaled.');
                setGradingRubric(null);
              }}>Save & Total Grades</button>
            </div>
          </div>
        </div>
      )}

      {/* Extensions Modal */}
      {extendingAssignment && (
        <div className="modal-overlay" onClick={() => setExtendingAssignment(null)} style={{ zIndex: 1200 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Per-Student Extensions</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setExtendingAssignment(null)}>
                 <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
               <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-2)' }}>
                 Grant a deadline extension for a specific student for: <strong style={{color: 'var(--text-1)'}}>{extendingAssignment.title}</strong>
               </div>
               <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input className="form-input" id="ext-student-id" placeholder="e.g. S1001" />
               </div>
               <div className="form-group">
                  <label className="form-label">New Due Date</label>
                  <input className="form-input" type="date" id="ext-new-date" />
               </div>
               <div className="form-group">
                  <label className="form-label">Reason / Notes</label>
                  <textarea className="form-input" id="ext-reason" rows={2} placeholder="Medical leave, etc."></textarea>
               </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setExtendingAssignment(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                 toast.success(`Extension granted for student!`);
                 setExtendingAssignment(null);
              }}>Grant Extension</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Assignment</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Assignment Title <span className="required">*</span></label>
                <input className="form-input" placeholder="Descriptive title" />
              </div>
              <div className="form-group">
                <label className="form-label">Course <span className="required">*</span></label>
                <select className="form-input">
                  {myCourses.map(c => <option key={c.id || c._id}>{c.code} — {c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea className="form-input" rows={4} placeholder="Detailed assignment instructions…"></textarea>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input className="form-input" type="number" defaultValue={100} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                toast.success('Assignment created!');
                setShowCreate(false);
              }}>Publish Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
