import React, { useState } from 'react';
import { BookOpen, Calendar, GraduationCap, LayoutDashboard, Settings, Plus, Edit2, Trash2 } from 'lucide-react';
import { useLiveAcademicProgrammes, useLiveAcademicCourseMaster } from '../../api/liveData';

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

export default function AcademicManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: programmes, isLoading: progLoading } = useLiveAcademicProgrammes();
  const { data: courses, isLoading: courseLoading } = useLiveAcademicCourseMaster();

  return (
    <div className="academic-management">
      <PageHeader 
        title="Enterprise Academic Core" 
        subtitle="Configure institution hierarchy, programmes, and curricula."
      >
        <button className="btn btn-primary">
          <Plus size={16} style={{ marginRight: 8 }} />
          New Configuration
        </button>
      </PageHeader>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={16} /> Overview
        </button>
        <button 
          className={`tab ${activeTab === 'programmes' ? 'active' : ''}`}
          onClick={() => setActiveTab('programmes')}
        >
          <GraduationCap size={16} /> Programmes
        </button>
        <button 
          className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <BookOpen size={16} /> Course Catalog
        </button>
      </div>

      <div className="tab-content" style={{ marginTop: 24 }}>
        {activeTab === 'overview' && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Active Programmes</div>
              <div className="stat-value">{programmes?.length || 0}</div>
              <div className="stat-trend trend-up">Across {new Set(programmes?.map(p => p.department?.name || 'various')).size || 0} departments</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Published Curricula</div>
              <div className="stat-value">34</div>
              <div className="stat-trend trend-neutral">Awaiting review: 2</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Course Master</div>
              <div className="stat-value">{courses?.length || 0}</div>
              <div className="stat-trend trend-up">Active courses</div>
            </div>
          </div>
        )}

        {activeTab === 'programmes' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Academic Programmes</div>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {progLoading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>Loading programmes...</td></tr>
                  ) : programmes?.length > 0 ? programmes.map(p => (
                    <tr key={p.code}>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td>{p.level}</td>
                      <td>{p.durationYears} Years</td>
                      <td><span className={`badge ${p.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{p.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn"><Edit2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No programmes found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Central Course Catalog</div>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Credits</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courseLoading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>Loading courses...</td></tr>
                  ) : courses?.length > 0 ? courses.map(c => (
                    <tr key={c.code}>
                      <td>{c.code}</td>
                      <td>{c.title}</td>
                      <td>{c.type}</td>
                      <td>{c.credits}</td>
                      <td><span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn"><Edit2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No courses found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
