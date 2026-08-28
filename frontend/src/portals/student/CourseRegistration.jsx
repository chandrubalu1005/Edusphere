import React, { useState } from 'react';
import { Search, PlusCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

import { useLiveAcademicSections } from '../../api/liveData';
import { useRegisterEnrollment } from '../../api/hooks';

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

export default function CourseRegistration({ user }) {
  const { data: sections, isLoading } = useLiveAcademicSections();
  const registerMutation = useRegisterEnrollment();
  const [courses, setCourses] = useState([]);

  React.useEffect(() => {
    if (sections) {
      // Map API sections to UI course rows for the table
      const mapped = sections.map(sec => {
        const course = sec.courseOfferingId?.courseId || {};
        const isFull = sec.capacity && sec.enrolledCount >= sec.capacity;
        
        return {
          id: sec._id || course.code, // use section ID if available
          code: course.code || 'UNKNOWN',
          title: course.title || 'Unknown Course',
          type: course.type || 'Core',
          credits: course.credits || 4,
          seats: sec.capacity ? sec.capacity - (sec.enrolledCount || 0) : 10,
          conflict: false,
          prereqMet: true,
          prereqMissing: null,
          isFull
        };
      });
      // Fallback merge for UI demonstration if data is sparse
      if (mapped.length === 0) {
         setCourses([
          { id: '1', code: 'AI501', title: 'Machine Learning', type: 'Honours Elective', credits: 4, seats: 12, conflict: false, prereqMet: true },
          { id: '2', code: 'CS502', title: 'Computer Networks', type: 'Core', credits: 4, seats: 45, conflict: false, prereqMet: true },
          { id: '3', code: 'CS601', title: 'Advanced Algorithms', type: 'Professional Elective', credits: 4, seats: 0, conflict: false, prereqMet: false, prereqMissing: 'CS401' },
          { id: '4', code: 'BA501', title: 'Business Analytics', type: 'Minor Requirement', credits: 4, seats: 5, conflict: true, conflictDetails: 'Clashes with CS502 (Mon 10:00 AM)', prereqMet: true }
         ]);
      } else {
         setCourses(mapped);
      }
    }
  }, [sections]);

  const handleRegister = (c) => {
    if (c.isFull || c.conflict || !c.prereqMet) return;
    registerMutation.mutate({
      studentId: user?.id || 'demo_student',
      sectionId: c.id,
      courseId: c.code,
      academicTermId: 'current_term'
    });
  };

  return (
    <div className="course-registration">
      <PageHeader 
        title="Course Registration" 
        subtitle="Select your courses for Odd Semester 2026-2027"
      >
        <button className="btn btn-primary">
          Submit Registration
        </button>
      </PageHeader>

      <div className="alert alert-info" style={{ display: 'flex', gap: 12, padding: 16, background: 'var(--brand-soft)', borderRadius: 8, color: 'var(--brand)', marginBottom: 24 }}>
        <Clock size={20} />
        <div>
          <strong>Registration Window Open</strong>
          <p style={{ margin: 0, fontSize: 13 }}>You have 3 days remaining to complete your course registration. Max allowed credits: 24.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="card-title">Eligible Courses</div>
          <div className="search-bar" style={{ position: 'relative', width: 250 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-3)' }} />
            <input type="text" className="input input-sm" placeholder="Search courses..." style={{ paddingLeft: 36, width: '100%' }} />
          </div>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Requirement</th>
                <th>Credits</th>
                <th>Seats</th>
                <th>Eligibility</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.code}>
                  <td style={{ fontWeight: 600 }}>{c.code}</td>
                  <td>{c.title}</td>
                  <td><span className="badge badge-neutral">{c.type}</span></td>
                  <td>{c.credits}</td>
                  <td>
                    {c.seats > 0 ? (
                      <span style={{ color: 'var(--success)' }}>{c.seats} remaining</span>
                    ) : (
                      <span style={{ color: 'var(--danger)' }}>Full</span>
                    )}
                  </td>
                  <td>
                    {!c.prereqMet ? (
                      <div style={{ color: 'var(--danger)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={12}/> Prerequisite Missing ({c.prereqMissing})
                      </div>
                    ) : c.conflict ? (
                      <div style={{ color: 'var(--warning)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={12}/> Timetable Conflict
                      </div>
                    ) : (
                      <div style={{ color: 'var(--success)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={12}/> Eligible
                      </div>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline" 
                      disabled={!c.prereqMet || c.seats === 0 || c.conflict || registerMutation.isPending}
                      onClick={() => handleRegister(c)}
                    >
                      <PlusCircle size={14} style={{ marginRight: 6 }} /> Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div style={{ padding: 20, textAlign: 'center' }}>Loading eligible sections...</div>}
        </div>
      </div>
    </div>
  );
}
