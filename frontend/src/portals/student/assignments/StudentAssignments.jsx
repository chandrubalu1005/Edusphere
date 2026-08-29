import React, { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

import { useLiveAssignments, useLiveSubmissions } from '../../../api/liveData.js';
import { useSubmitAssignment, useDisputeGrade } from '../../../api/hooks.js';
import { Icon, ICONS } from '../../../components/Layout.jsx';
import { PageHeader } from '../../../components/shared/index.jsx';

export default function StudentAssignments({ user }) {
  const queryClient = useQueryClient();
  const { data: ASSIGNMENTS, isLoading: loadingAssignments } = useLiveAssignments();
  
  // Real API fetching for submissions
  const { data: SUBMISSIONS, isLoading: loadingSubmissions } = useLiveSubmissions(user.userId || user.id);
  const mySubmissions = SUBMISSIONS || [];

  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState('');
  
  const [disputing, setDisputing] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const disputeGrade = useDisputeGrade();
  const [viewingPlagiarism, setViewingPlagiarism] = useState(null);
  
  const submitAssignment = useSubmitAssignment();

  // Socket.IO Reactivity
  useEffect(() => {
    const socket = io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('assignment.published', () => {
      queryClient.invalidateQueries(['assignments']);
      toast('New assignment published!', { icon: '📝' });
    });

    socket.on('grade.updated', (payload) => {
      queryClient.invalidateQueries(['submissions']);
      toast.success(`Grade updated! You scored ${payload.score}/${payload.totalMarks}`);
    });

    return () => socket.disconnect();
  }, [queryClient]);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    multiple: false
  });

  const handleSubmit = async () => {
    if (!file || !selected) return;
    try {
      await submitAssignment.mutateAsync({
        assignmentId: selected.id || selected._id,
        file,
        remarks
      });
      toast.success('Submission recorded successfully.');
      setSelected(null);
      setFile(null);
      setRemarks('');
      // Invalidate to reflect state change immediately
      queryClient.invalidateQueries(['submissions']);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    }
  };

  const handleDispute = async () => {
    if (!disputing || !disputeReason) return;
    try {
      await disputeGrade.mutateAsync({ submissionId: disputing.id || disputing._id, reason: disputeReason });
      setDisputing(null);
      setDisputeReason('');
      queryClient.invalidateQueries(['submissions']);
      toast.success('Dispute opened.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to open dispute');
    }
  };

  if (loadingAssignments || loadingSubmissions) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading assignments...</div>;
  }

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Submit and track your assignments." />

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Status / Grade</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ASSIGNMENTS.map(a => {
                const submission = mySubmissions.find(s => s.assignmentId === a.id || s.assignmentId === a._id);
                const dueDate = new Date(a.dueDate);
                const today = new Date();
                const daysLeft = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0;

                return (
                  <tr key={a._id || a.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{a.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.description}
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{a.courseCode || a.courseId}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {a.status !== 'closed' && (
                        <div style={{ marginTop: 4 }}>
                          {isOverdue 
                            ? <span className="badge badge-danger">Overdue</span> 
                            : <span className="badge badge-warning">{daysLeft}d left</span>}
                        </div>
                      )}
                    </td>
                    <td>
                      {submission?.status === 'graded'
                        ? (
                          <div>
                            <span className="badge badge-success">Graded: {submission.finalGrade}/{a.totalMarks}</span>
                            {submission.plagiarismScore != null && (
                              <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text-2)', cursor: 'pointer' }} onClick={() => setViewingPlagiarism(submission)}>
                                Similarity: {submission.plagiarismScore}% 🔍
                              </div>
                            )}
                          </div>
                        )
                        : submission?.status === 'submitted'
                        ? <span className="badge badge-info">Submitted</span>
                        : a.status === 'closed'
                        ? <span className="badge badge-neutral">Closed</span>
                        : <span className="badge badge-outline">Pending</span>
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {submission?.status === 'graded' && (!submission.disputeStatus || submission.disputeStatus === 'none') && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setDisputing(submission)}>
                            Dispute Grade
                          </button>
                        )}
                        {submission?.disputeStatus === 'open' && (
                          <span className="badge badge-warning">Dispute Pending</span>
                        )}
                        {submission?.disputeStatus === 'resolved' && (
                          <span className="badge badge-success">Dispute Resolved</span>
                        )}
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelected(a)}
                          disabled={a.status === 'closed'}
                        >
                          {submission?.status === 'submitted' || submission?.status === 'graded' ? 'View Details' : 'Submit'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Submit Assignment</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700 }}>{selected.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Due: {new Date(selected.dueDate).toLocaleDateString()}</div>
              </div>
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'dragover' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <input {...getInputProps()} />
                <div className="dropzone-icon">📂</div>
                {file
                  ? <div className="dropzone-text">✓ {file.name}</div>
                  : <>
                    <div className="dropzone-text">Drag & drop your file here, or click to select</div>
                    <div className="dropzone-hint">PDF, ZIP, DOC · Max 50MB</div>
                  </>
                }
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Remarks (Optional)</label>
                <textarea 
                  className="form-input" 
                  placeholder="Any notes for your instructor…" 
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                disabled={!file || submitAssignment.isLoading} 
                onClick={handleSubmit}
              >
                {submitAssignment.isLoading ? 'Uploading...' : '↑ Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputing && (
        <div className="modal-overlay" onClick={() => setDisputing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Dispute Grade</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDisputing(null)}>
                <Icon d={ICONS.x} size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700 }}>Request a Re-evaluation</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  Provide a clear and concise reason for disputing your grade. Your course faculty will review this request.
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Justification / Reason</label>
                <textarea 
                  className="form-input" 
                  placeholder="e.g. My submission was marked down for criterion X, but the requirement was met on page 3..." 
                  rows={4}
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDisputing(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                disabled={!disputeReason || disputeGrade.isLoading} 
                onClick={handleDispute}
              >
                {disputeGrade.isLoading ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plagiarism Report Modal */}
      {viewingPlagiarism && (
        <div className="modal-overlay" onClick={() => setViewingPlagiarism(null)} style={{ zIndex: 1200 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Originality Report</div>
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
                  No significant similarity detected. Your submission appears original.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setViewingPlagiarism(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
