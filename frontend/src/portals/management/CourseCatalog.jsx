import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Link } from 'lucide-react';

import { useLiveAcademicCourseMaster } from '../../api/liveData';

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

export default function CourseCatalog() {
  const { data: courses, isLoading } = useLiveAcademicCourseMaster();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const stats = {
    total: courses?.length || 0,
    active: courses?.filter(c => c.status === 'Active')?.length || 0,
    deprecated: courses?.filter(c => c.status === 'Deprecated')?.length || 0
  };

  const filteredCourses = (courses || []).filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase()) || 
                          c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="course-catalog">
      <PageHeader 
        title="Course Master Catalog" 
        subtitle="Central repository of all institutional courses."
      >
        <button className="btn btn-primary">
          <Plus size={16} style={{ marginRight: 8 }} />
          New Course
        </button>
      </PageHeader>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: 16 }}>
          <div className="search-bar" style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-3)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search by code or title..." 
              style={{ paddingLeft: 36, width: '100%' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-outline">
            <Filter size={16} style={{ marginRight: 8 }} /> Filters
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length > 0 ? filteredCourses.map(c => (
                <tr key={c.code}>
                  <td style={{ fontWeight: 600 }}>{c.code}</td>
                  <td>{c.title}</td>
                  <td>{c.department?.name || c.department || 'N/A'}</td>
                  <td>{c.credits}</td>
                  <td><span className={`badge ${c.type === 'PRACTICAL' ? 'badge-secondary' : 'badge-primary'}`}>{c.type}</span></td>
                  <td>
                    <span className={`badge ${c.status === 'Active' ? 'badge-success' : c.status === 'Deprecated' ? 'badge-danger' : 'badge-neutral'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" title="Edit"><Edit2 size={14} /></button>
                      <button className="icon-btn" title="Prerequisites"><Link size={14} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>
                    {isLoading ? 'Loading Course Master...' : 'No courses found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
