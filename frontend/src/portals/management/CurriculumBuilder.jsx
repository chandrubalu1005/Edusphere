import React, { useState } from 'react';
import { Book, Save, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useLiveAcademicCurricula } from '../../api/liveData';

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

export default function CurriculumBuilder() {
  const { data: curricula, isLoading } = useLiveAcademicCurricula();
  const currentCurriculum = curricula && curricula.length > 0 ? curricula[0] : null;

  const [semesters, setSemesters] = useState([
    { id: 1, name: 'Semester 1', credits: 20, groups: [] },
    { id: 2, name: 'Semester 2', credits: 24, groups: [] }
  ]);

  return (
    <div className="curriculum-builder">
      <PageHeader 
        title="Curriculum Builder" 
        subtitle={isLoading ? "Loading..." : currentCurriculum ? `${currentCurriculum.programmeId?.name || 'Programme'} - ${currentCurriculum.regulationId?.name || 'Regulation'} (${currentCurriculum.status} ${currentCurriculum.versionString})` : "No curriculum found"}
      >
        <button className="btn btn-secondary" style={{ marginRight: 12 }}>
          <AlertCircle size={16} style={{ marginRight: 8 }} />
          Validate
        </button>
        <button className="btn btn-primary">
          <Save size={16} style={{ marginRight: 8 }} />
          Save Draft
        </button>
      </PageHeader>

      <div className="stats-row" style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ flex: 1, padding: 20 }}>
          <div className="stat-label">Total Credits Planned</div>
          <div className="stat-value" style={{ color: 'var(--brand)' }}>{currentCurriculum?.totalCredits || 160}</div>
          <div className="stat-trend trend-neutral">Target: {currentCurriculum?.totalCredits || 160}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 20 }}>
          <div className="stat-label">Core Credits</div>
          <div className="stat-value">72</div>
          <div className="stat-trend trend-success"><CheckCircle size={12}/> Valid</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 20 }}>
          <div className="stat-label">Elective Credits</div>
          <div className="stat-value">20</div>
          <div className="stat-trend trend-success"><CheckCircle size={12}/> Valid</div>
        </div>
      </div>

      <div className="curriculum-grid" style={{ display: 'grid', gap: 24 }}>
        {semesters.map(sem => (
          <div key={sem.id} className="card semester-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">{sem.name}</div>
              <div className="badge badge-primary">{sem.credits} Credits</div>
            </div>
            <div className="card-body" style={{ padding: '20px' }}>
              <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--text-3)' }}>
                Drag and drop course groups here
                <br/>
                <button className="btn btn-outline" style={{ marginTop: 12 }}>
                  <Plus size={16} style={{ marginRight: 8 }} /> Add Group
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
