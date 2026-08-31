import { Star, Megaphone, Activity } from 'lucide-react';
// ══════════════════════════════════════════════════════════════════════════════
// EduSphere Enterprise — Student Portal Feature Modules
// New enterprise features split into separate file for maintainability
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState, useMemo } from 'react';
import { useLiveLibraryLoans } from '../../api/liveData';
import { useReturnLoan, useIssueLoan, useSearchCatalog } from '../../api/hooks';
import { 
  BookOpen, Calendar as CalendarIcon, Clock, CreditCard, 
  FileText, GraduationCap, Users, Video, AlertCircle, CheckCircle, 
  MapPin, Phone, Mail, Award, Briefcase, Building, Book, Download,
  MessageSquare, Pin, CheckCircle2, TrendingUp, HelpCircle
} from 'lucide-react';
import { Icon, ICONS } from '../../components/Layout.jsx';
import {
  PageHeader, StatCard, DataTable, StatusBadge, Tabs, FilterBar,
  CalendarWidget, TimetableGrid, Timeline, BarChart, DonutChart,
  ProgressRing, MiniSparkline, AIChatInterface, NotificationCenter,
  EmptyState, Modal, CommandPalette, WorkflowTimeline
} from '../../components/shared/index.jsx';

import {
  useLiveTimetable, useLiveCalendarEvents, useLiveLibraryBooks,
  useLivePlacementDrives, useLivePlacementApplications, useLiveNotifications,
  useLiveDiscussionThreads, useLiveThreadDetails,
  useLiveLeaveRecords, useLiveLeaveBalance, useLiveCourses, useLiveEnrollments
} from '../../api/liveData.js';
import {
  useCreateReply, useApplyForLeave, useWithdrawLeave,
  useStudentGrades, useAllCourseResources, useAnnouncements,
  useCreateSupportTicket
} from '../../api/hooks.js';
import toast from 'react-hot-toast';


// ── WEEKLY TIMETABLE ────────────────────────────────────────────────────────
export function StudentTimetable({ user }) {
  const { data: TIMETABLE } = useLiveTimetable();
  const myTimetable = TIMETABLE;

  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const todaySlots = myTimetable.filter(s => s.day === todayName);

  return (
    <div>
      <PageHeader
        title="Weekly Timetable"
        subtitle="Your class schedule for the current semester"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Timetable' }]}
      />

      {/* Today's Summary */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 12, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarIcon size={18} color="var(--brand, #C43D3D)" /> Today — {todayName}
        </h3>
        {todaySlots.length === 0 ? (
          <p style={{ color: 'var(--text-3)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Star size={16} /> No classes scheduled today!</p>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {todaySlots.map(slot => (
              <div key={slot.id} style={{
                padding: '10px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)',
                borderLeft: `3px solid ${slot.type === 'lab' ? 'var(--secondary)' : slot.type === 'tutorial' ? 'var(--info)' : 'var(--accent)'}`,
                minWidth: 200, flex: '1 1 200px'
              }}>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{slot.courseCode}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{slot.time}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {slot.room} • {slot.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Timetable Grid */}
      <div className="card" style={{ padding: 20 }}>
        <TimetableGrid slots={myTimetable} />
      </div>
    </div>
  );
}

// ── ACADEMIC CALENDAR ───────────────────────────────────────────────────────
export function AcademicCalendar({ user }) {
  const { data: CALENDAR_EVENTS } = useLiveCalendarEvents();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [filter, setFilter] = useState('all');

  const typeColors = { exam: '#B23A32', holiday: '#4C7C59', deadline: '#D97706', event: '#0369A1', academic: '#C98A3B', placement: '#8B5CF6' };
  const filteredEvents = filter === 'all' ? CALENDAR_EVENTS : CALENDAR_EVENTS.filter(e => e.type === filter);

  return (
    <div>
      <PageHeader title="Academic Calendar" subtitle="Stay updated with academic events, exams, and deadlines"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Academic Calendar' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Calendar */}
        <div className="card" style={{ padding: 20 }}>
          <CalendarWidget
            events={CALENDAR_EVENTS}
            selectedDate={selectedDate}
            onDateClick={(date, events) => { setSelectedDate(date); setSelectedEvents(events); }}
          />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-1)' }}>
              {selectedDate ? `Events on ${selectedDate}` : 'Upcoming Events'}
            </h3>
            <select className="filter-select" style={{ minWidth: 100 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="exam">Exams</option>
              <option value="holiday">Holidays</option>
              <option value="deadline">Deadlines</option>
              <option value="event">Events</option>
              <option value="academic">Academic</option>
              <option value="placement">Placement</option>
            </select>
          </div>

          {(selectedDate ? selectedEvents : filteredEvents).length === 0 ? (
            <EmptyState icon={<CalendarIcon size={32} color="var(--text-3)" />} message="No events found" description={selectedDate ? 'No events on this date.' : 'No events match your filter.'} compact />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(selectedDate ? selectedEvents : filteredEvents).map(ev => (
                <div key={ev.id} style={{
                  padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)',
                  borderLeft: `3px solid ${typeColors[ev.type] || 'var(--accent)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{ev.title}</div>
                    <StatusBadge status={ev.type} map={{
                      exam: { label: 'Exam', cls: 'badge-danger' }, holiday: { label: 'Holiday', cls: 'badge-success' },
                      deadline: { label: 'Deadline', cls: 'badge-warning' }, event: { label: 'Event', cls: 'badge-info' },
                      academic: { label: 'Academic', cls: 'badge-accent' }, placement: { label: 'Placement', cls: 'badge-info' },
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    {ev.date}{ev.endDate ? ` → ${ev.endDate}` : ''}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{ev.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LEARNING PROGRESS ───────────────────────────────────────────────────────
export function LearningProgress({ user }) {
  const enrolled = ENROLLMENTS.filter(e => e.studentId === user.id);

  // Skills radar mock data
  const skills = [
    { name: 'Algorithms', value: 82 }, { name: 'Databases', value: 90 },
    { name: 'ML/AI', value: 55 }, { name: 'System Design', value: 68 },
    { name: 'Programming', value: 88 }, { name: 'Math', value: 75 },
  ];

  const weeklyHours = [4.5, 6.2, 5.8, 7.1, 3.2, 8.0, 6.5];

  return (
    <div>
      <PageHeader title="Learning Progress" subtitle="Track your academic journey and skill development"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Learning Progress' }]}
      />

      {/* Summary Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <StatCard label="CGPA" value={user.gpa || '8.74'} trend="↑ 0.4 from last sem" trendType="up" icon={<GraduationCap size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Courses Completed" value="8" trend="3 active" trendType="neutral" icon={<BookOpen size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Study Hours / Week" value="6.2h" trend="↑ 12% from last week" trendType="up" icon={<Clock size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Skills Mastered" value="4 / 6" trend="2 in progress" trendType="neutral" icon={<Star size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
      </div>

      {/* Activity Heatmap & Peer Comparison */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-1)' }}>Daily Learning Activity</h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>148 contributions in the last 12 weeks</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-3)' }}>
            <span>Less</span>
            <div style={{ width: 10, height: 10, background: 'var(--surface-2)', borderRadius: 2 }} />
            <div style={{ width: 10, height: 10, background: '#9be9a8', borderRadius: 2 }} />
            <div style={{ width: 10, height: 10, background: '#40c463', borderRadius: 2 }} />
            <div style={{ width: 10, height: 10, background: '#30a14e', borderRadius: 2 }} />
            <div style={{ width: 10, height: 10, background: '#216e39', borderRadius: 2 }} />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4, minWidth: 600 }}>
            {Array.from({ length: 12 }).map((_, weekIdx) => (
              <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const val = ((weekIdx * 7 + dayIdx * 3 + 2) % 5);
                  const colors = ['var(--surface-2)', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
                  return (
                    <div
                      key={dayIdx}
                      title={`Week ${weekIdx + 1}, Day ${dayIdx + 1}: ${val * 2} activities`}
                      style={{
                        width: '100%',
                        height: 12,
                        borderRadius: 2,
                        background: colors[val],
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Peer Comparison */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 6 }}><Star size={16} color="var(--brand, #C43D3D)" /> Class Peer Standing: Top 8%</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>You are performing better than 92% of students in your department cohort.</div>
          </div>
          <span className="badge badge-accent" style={{ fontSize: 13, padding: '6px 12px' }}>92nd Percentile</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Course Progress */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Course Progress</h3>
          {enrolled.map(enr => (
            <div key={enr.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{enr.courseCode}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', marginLeft: 8 }}>{enr.courseTitle}</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--accent)' }}>{enr.progress}%</span>
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 4, height: 8 }}>
                <div style={{ width: `${enr.progress}%`, height: '100%', borderRadius: 4, background: enr.progress > 70 ? 'var(--secondary)' : enr.progress > 40 ? 'var(--accent)' : 'var(--danger)', transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-3)' }}>
                <span>Grade: {enr.grade}</span>
                <span>Enrolled: {enr.enrolledAt}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Skills Radar */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Skills Assessment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {skills.map(skill => (
              <div key={skill.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{skill.name}</span>
                  <span style={{ color: skill.value >= 80 ? 'var(--secondary)' : skill.value >= 60 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>{skill.value}%</span>
                </div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${skill.value}%`, height: '100%', borderRadius: 4, background: skill.value >= 80 ? 'var(--secondary)' : skill.value >= 60 ? 'var(--accent)' : 'var(--danger)', transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>Weekly Study Hours</h4>
            <MiniSparkline data={weeklyHours} height={50} color="var(--accent)" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMMUNICATION HUB ───────────────────────────────────────────────────────
export function CommunicationHub({ user }) {
  const [activeTab, setActiveTab] = useState('forum');
  const [selectedThread, setSelectedThread] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const { data: threads = [] } = useLiveDiscussionThreads(courseFilter === 'all' ? undefined : courseFilter);
  const { data: threadDetails } = useLiveThreadDetails(selectedThread?._id || selectedThread?.id);
  const { data: announcementsData } = useAnnouncements();
  
  const replies = threadDetails?.replies || [];
  const createReply = useCreateReply();

  const announcements = announcementsData?.announcements || [];
  const displayAnnouncements = announcements.filter(a => a.targetRoles?.includes('student') || a.targetRoles?.length === 0);

  const tabs = [
    { id: 'forum', label: 'Discussion Forum', icon: <MessageSquare size={16} />, badge: threads.length },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={16} />, badge: displayAnnouncements.length },
    { id: 'queries', label: 'My Queries', icon: <HelpCircle size={16} /> },
  ];

  const filteredDiscussions = courseFilter === 'all'
    ? threads
    : threads.filter(d => (d.courseCode || d.courseId) === courseFilter);

  const handleReplySubmit = async () => {
    if (!newPost.trim() || !selectedThread) return;
    try {
      await createReply.mutateAsync({
        threadId: selectedThread._id || selectedThread.id,
        content: newPost
      });
      setNewPost('');
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  return (
    <div>
      <PageHeader title="Communication Hub" subtitle="Discussions, announcements, and academic collaboration"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Communication Hub' }]}
      />
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'forum' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <select className="filter-select" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
              <option value="all">All Courses</option>
              {[...new Set(threads.map(d => d.courseCode || d.courseId))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {selectedThread && (
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedThread(null)}>← Back to Forum</button>
            )}
          </div>

          {selectedThread ? (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  {selectedThread.pinned && <span className="badge badge-accent"><Pin size={10} style={{ marginRight: 4 }} /> Pinned</span>}
                  {selectedThread.resolved && <span className="badge badge-success"><CheckCircle2 size={10} style={{ marginRight: 4 }} /> Resolved</span>}
                  <span className="badge badge-neutral">{selectedThread.courseCode || selectedThread.courseId}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>{selectedThread.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{selectedThread.content}</p>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                  Posted by <strong>{selectedThread.authorName || selectedThread.author}</strong> • {selectedThread.createdAt} • ▲ {selectedThread.upvotes || 0}
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>{replies.length} Replies</h4>
                {replies.map(rep => (
                  <div key={rep.id || rep._id} style={{ padding: '12px 16px', background: rep.isAnswer ? 'rgba(76,124,89,0.06)' : 'var(--surface-2)', borderRadius: 'var(--r-md)', marginBottom: 8, borderLeft: rep.isAnswer ? '3px solid var(--secondary)' : 'none' }}>
                    {rep.isAnswer && <span className="badge badge-success" style={{ marginBottom: 6 }}><CheckCircle2 size={10} style={{ marginRight: 4 }} /> Best Answer</span>}
                    <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>{rep.content}</p>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {rep.authorRole === 'faculty' ? <Users size={12} /> : <Users size={12} />} {rep.authorName || rep.author} • {new Date(rep.createdAt || rep.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="form-input" style={{ flex: 1 }} placeholder="Write a reply..." value={newPost} onChange={e => setNewPost(e.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={handleReplySubmit} disabled={createReply.isLoading}>
                    {createReply.isLoading ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {filteredDiscussions.map(disc => (
                <div key={disc.id || disc._id} className={`discussion-card ${disc.pinned ? 'pinned' : ''}`} onClick={() => setSelectedThread(disc)}>
                  <div className="discussion-header">
                    {disc.pinned && <span style={{ fontSize: 14 }}><Pin size={14} color="var(--brand, #C43D3D)" /></span>}
                    <span className="discussion-title">{disc.title}</span>
                    <span className="badge badge-neutral">{disc.courseCode || disc.courseId}</span>
                    {disc.resolved && <span className="badge badge-success"><CheckCircle2 size={10} style={{ marginRight: 4 }} /> Resolved</span>}
                  </div>
                  <div className="discussion-body">{disc.content}</div>
                  <div className="discussion-footer">
                    <span className="discussion-stat" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{disc.authorRole === 'faculty' ? <Users size={12} /> : <Users size={12} />} {disc.authorName || disc.author}</span>
                    <span className="discussion-stat">▲ {disc.upvotes || 0}</span>
                    <span className="discussion-stat" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} /> {disc.replies || 0} replies</span>
                    <span className="discussion-stat" style={{ marginLeft: 'auto' }}>{new Date(disc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div style={{ marginTop: 16 }}>
          {displayAnnouncements.map(ann => (
            <div key={ann._id || ann.id} className="card" style={{ padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <StatusBadge status={ann.priority} />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginTop: 8 }}>{ann.title}</h4>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{new Date(ann.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginTop: 8 }}>{ann.content}</p>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>By {ann.author}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'queries' && (
        <div style={{ marginTop: 16 }}>
          <EmptyState icon={<HelpCircle size={32} color="var(--text-3)" />} message="No active queries" description="Post a query in the Discussion Forum to get help from faculty and peers." />
        </div>
      )}
    </div>
  );
}

// ── TRANSCRIPT & GRADES ─────────────────────────────────────────────────────
export function TranscriptGrades({ user }) {
  const { data: gradesData, isLoading } = useStudentGrades(user.userId || user.id);
  const transcripts = gradesData?.semesters || [];
  const cgpa = gradesData?.cgpa || 0;

  if (isLoading) return <div style={{ padding: 20 }}>Loading transcripts...</div>;

  return (
    <div>
      <PageHeader title="Grades & Transcript" subtitle="Your complete academic record"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Grades & Transcript' }]}
      >
        <button className="btn btn-outline btn-sm">📄 Export PDF</button>
      </PageHeader>

      {/* GPA Summary */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <StatCard label="CGPA" value={cgpa.toFixed(2)} trend="Cumulative" icon={<GraduationCap size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Latest SGPA" value={transcripts[transcripts.length - 1]?.sgpa || '—'} trend={transcripts[transcripts.length - 1]?.semester} icon={<TrendingUp size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Credits Earned" value={transcripts.reduce((sum, t) => sum + t.courses.reduce((s, c) => s + c.credits, 0), 0)} trend="Total accumulated" icon={<BookOpen size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Current Semester" value={transcripts[transcripts.length - 1]?.semester || 'S4'} trend="In Progress" icon={<CalendarIcon size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
      </div>

      {/* Semester-wise Grades */}
      {transcripts.map(t => (
        <div key={t.semester} className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-1)' }}>
                {t.semester}
              </h3>
            </div>
            {t.sgpa && <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>SGPA: {t.sgpa}</div>}
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Code</th><th>Course</th><th>Credits</th><th>Grade</th><th>Grade Point</th></tr>
              </thead>
              <tbody>
                {t.courses.map(c => (
                  <tr key={c.courseCode || c.courseId}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.courseCode || c.courseId}</span></td>
                    <td>{c.courseTitle}</td>
                    <td>{c.credits}</td>
                    <td><span className={`badge ${c.grade === 'A+' || c.grade === 'A' ? 'badge-success' : c.grade === 'In Progress' ? 'badge-info' : 'badge-accent'}`}>{c.grade || (c.passed ? 'P' : 'F')}</span></td>
                    <td>{c.gradePoints ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── FEE & PAYMENT ───────────────────────────────────────────────────────────
export function FeePayment({ user }) {
  const [fees, setFees] = useState(() => FEE_RECORDS.filter(f => f.studentId === user.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const totalPaid = fees.reduce((s, f) => s + f.paid, 0);
  const totalDue = fees.reduce((s, f) => s + (f.total - f.paid), 0);

  function handleProcessPayment() {
    toast.error('Service unavailable (Payment Gateway Not Connected)');
  }

  return (
    <div>
      <PageHeader title="Fee & Payments" subtitle="Fee structure, payment history, and receipts"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Fee & Payments' }]}
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <StatCard label="Total Paid" value={`₹${(totalPaid / 1000).toFixed(0)}K`} trend="All semesters" trendType="up" icon={<CheckCircle2 size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Outstanding" value={totalDue > 0 ? `₹${(totalDue / 1000).toFixed(0)}K` : '₹0'} trend={totalDue > 0 ? 'Payment pending' : 'No dues'} trendType={totalDue > 0 ? 'down' : 'up'} icon={<AlertCircle size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Scholarships" value="₹25K" trend="Merit scholarship applied" trendType="up" icon={<Star size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
      </div>

      <DataTable
        columns={[
          { key: 'semester', label: 'Semester', width: 120 },
          { key: 'tuition', label: 'Tuition', render: v => `₹${v?.toLocaleString()}` },
          { key: 'hostel', label: 'Hostel', render: v => `₹${v?.toLocaleString()}` },
          { key: 'total', label: 'Total', render: v => <strong>₹{v?.toLocaleString()}</strong> },
          { key: 'paid', label: 'Paid', render: v => `₹${v?.toLocaleString()}` },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
          { key: 'method', label: 'Method' },
          { key: 'receiptNo', label: 'Receipt', render: v => v ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{v}</span> : '—' },
          { key: 'id', label: 'Action', width: 110, render: (_, row) => (
            row.status === 'unpaid' ? (
              <button className="btn btn-accent btn-sm" onClick={() => { setSelectedFee(row); setIsModalOpen(true); }}>
                Pay Now
              </button>
            ) : (
              <span style={{ color: 'var(--text-3)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Paid</span>
            )
          ), sortable: false }
        ]}
        data={fees}
        searchable={false}
        exportable
      />

      <Modal open={isModalOpen} title={`Checkout — ${selectedFee?.semester}`} onClose={() => setIsModalOpen(false)}>
        <div style={{ padding: 8 }}>
          <div style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 'var(--r-md)', marginBottom: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
              <span style={{ color: 'var(--text-2)' }}>Semester Tuition:</span>
              <strong style={{ color: 'var(--text-1)' }}>₹{selectedFee?.tuition.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--text-2)' }}>Hostel & Mess:</span>
              <strong style={{ color: 'var(--text-1)' }}>₹{selectedFee?.hostel.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, fontSize: 15 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>Total Amount:</span>
              <strong style={{ color: 'var(--accent)', fontSize: 17 }}>₹{selectedFee?.total.toLocaleString()}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input className="form-input" placeholder="e.g. John Doe" value={cardName} onChange={e => setCardName(e.target.value)} disabled={isPaying} />
            </div>
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input className="form-input" placeholder="XXXX XXXX XXXX XXXX" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())} maxLength={19} disabled={isPaying} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Expiry Date</label>
                <input className="form-input" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} disabled={isPaying} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">CVV</label>
                <input className="form-input" type="password" placeholder="***" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={3} disabled={isPaying} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)} disabled={isPaying}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleProcessPayment} disabled={isPaying || !cardNumber || !cardExpiry || !cardCvv || !cardName}>
                {isPaying ? '🔄 Processing...' : '💳 Process Payment'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}


// ── DOWNLOAD CENTER ─────────────────────────────────────────────────────────
export function DownloadCenter({ user }) {
  const [category, setCategory] = useState('all');
  const { data: resources = [], isLoading } = useAllCourseResources();
  
  const categories = ['all', ...new Set(resources.map(d => d.type || 'document'))];
  const filtered = category === 'all' ? resources : resources.filter(d => (d.type || 'document') === category);

  if (isLoading) return <div style={{ padding: 20 }}>Loading resources...</div>;

  return (
    <div>
      <PageHeader title="Download Center" subtitle="Syllabi, notes, question papers, and resources"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Downloads' }]}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategory(c)}>
            {c === 'all' ? <><Download size={14} style={{ marginRight: 4 }} /> All</> : c}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: 'title', label: 'Document', render: (v, row) => (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{row.courseCode} • {row.type}</div>
            </div>
          )},
          { key: 'type', label: 'Type', width: 70, render: v => <span className="badge badge-neutral">{v}</span> },
          { key: 'courseTitle', label: 'Course' },
          { key: 'addedAt', label: 'Date', width: 100, render: v => v ? new Date(v).toLocaleDateString() : 'N/A' },
          { key: 'url', label: 'Action', width: 100, render: (v) => <a href={v} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><Download size={14} style={{ marginRight: 4 }} /> View</a>, sortable: false },
        ]}
        data={filtered}
        exportable
      />
    </div>
  );
}

// ── ACTIVITY TIMELINE ───────────────────────────────────────────────────────
export function ActivityTimeline({ user }) {
  const { data: auditLogs, isLoading } = useLiveAuditLogs({ userId: user.id });

  return (
    <div>
      <PageHeader title="Activity Timeline" subtitle="Your recent interactions across the platform"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Activity Timeline' }]}
      />
      <div className="card" style={{ padding: 24 }}>
        <Timeline
          items={(auditLogs || []).map(a => ({
            id: a._id || a.id,
            icon: a.icon || <Activity size={14} />,
            title: a.details || a.description || a.action,
            timestamp: a.createdAt || a.timestamp,
          }))}
        />
      </div>
    </div>
  );
}

// ── AI LEARNING ASSISTANT ───────────────────────────────────────────────────
export function AIAssistant({ user }) {
  const suggestions = [
    "What's my attendance percentage?",
    "Show my GPA trend",
    "What assignments are due?",
    "Recommend courses for next semester",
    "How can I improve my grades?",
    "Show placement eligibility",
  ];

  return (
    <div>
      <PageHeader title="AI Learning Assistant" subtitle="Powered by CampusSphere AI — Get instant academic insights"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'AI Assistant' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <AIChatInterface
          title="CampusSphere AI Assistant"
          placeholder="Ask about grades, attendance, deadlines, recommendations..."
          suggestions={suggestions}
          messages={[
            { role: 'assistant', content: `👋 Hello ${user.firstName}! I'm your AI Learning Assistant.\n\nI can help you with:\n• **Academic Performance** — GPA, grades, attendance\n• **Assignment Tracking** — Deadlines, submissions\n• **Course Recommendations** — Based on your profile\n• **Placement Preparation** — Eligibility, upcoming drives\n\nHow can I help you today?`, time: '09:00 AM' }
          ]}
        />

        {/* Quick Insights Panel */}
        <div>
          <div className="card" style={{ padding: 16, marginBottom: 12 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>🎯 Quick Insights</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '10px 12px', background: 'rgba(76,124,89,0.06)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--secondary)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)' }}>CGPA Trend</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>8.74</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>↑ 0.4 from last semester</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(201,138,59,0.06)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--accent)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Attendance Status</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>78.5%</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>CS302 needs attention (40%)</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(3,105,161,0.06)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--info)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--info)' }}>Upcoming Deadlines</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>3</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Next: CS101 Sorting (Jul 15)</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>📚 AI Recommendations</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Cloud Computing', 'Cybersecurity', 'DevOps Engineering'].map(course => (
                <div key={course} style={{ padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', fontSize: 13 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{course}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Recommended for next semester</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STUDENT NOTIFICATIONS (FULL PAGE) ───────────────────────────────────────
export function StudentNotifications({ user }) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS.filter(n => n.userId === user.id));

  function markRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return <NotificationCenter notifications={notifications} onMarkRead={markRead} onMarkAllRead={markAllRead} />;
}

// ── DIGITAL LIBRARY (Student View) ──────────────────────────────────────────

export function StudentLibrary({ user }) {
  const [tab, setTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({});
  const { data: searchResults, isLoading: searchLoading } = useSearchCatalog(searchQuery, searchFilters);
  const { data: LOANS, isLoading: loansLoading } = useLiveLibraryLoans(user.id, 'ACTIVE');
  const { data: digitalResources, isLoading: digitalLoading } = useDigitalResources();
  const returnMutation = useReturnLoan();
  const issueMutation = useIssueLoan();
  const accessMutation = useAccessResource();

  const handleReturn = (loanId) => {
    returnMutation.mutate({ loanId, conditionAtReturn: 'GOOD' });
  };

  const handleRequest = (bookId) => {
    toast.error('Service unavailable (Book reservation API not connected)');
  };

  const handleAccess = (resourceId, action = 'VIEW') => {
    accessMutation.mutate({ resourceId, memberId: user.id, action });
  };

  return (
    <div>
      <PageHeader title="Digital Library" subtitle="Books, journals, research papers, and e-resources"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Digital Library' }]}
      />
      <Tabs tabs={[
        { id: 'browse', label: 'Browse Catalog', icon: <BookOpen size={16} /> },
        { id: 'issued', label: 'My Issued Books', icon: <Book size={16} /> },
        { id: 'digital', label: 'E-Resources', icon: <FileText size={16} /> },
      ]} active={tab} onChange={setTab} />

      {tab === 'browse' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Search by title, author, keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <select 
              className="select" 
              value={searchFilters.format || ''} 
              onChange={(e) => setSearchFilters({...searchFilters, format: e.target.value || undefined})}
            >
              <option value="">All Formats</option>
              <option value="PRINT">Physical Books</option>
              <option value="EBOOK">E-Books</option>
              <option value="JOURNAL">Journals</option>
            </select>
            <select 
              className="select" 
              value={searchFilters.available || ''} 
              onChange={(e) => setSearchFilters({...searchFilters, available: e.target.value || undefined})}
            >
              <option value="">Availability</option>
              <option value="true">Available Now</option>
            </select>
          </div>
          
          {searchLoading ? (
             <div style={{ padding: 20 }}>Searching catalog...</div>
          ) : (
            <DataTable
              columns={[
                { key: 'title', label: 'Title', render: (v, row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{row.authors?.map(a => a.name).join(', ')}</div>
                  </div>
                )},
                { key: 'format', label: 'Format', render: v => <span className="badge badge-neutral">{v}</span> },
                { key: 'availableCopies', label: 'Available', render: (v, row) => row.format === 'PRINT' ? `${v} copies` : 'Unlimited' },
                { key: '_id', label: 'Action', width: 120, render: (_, row) => (
                  <button 
                    className="btn btn-outline btn-sm" 
                    disabled={row.format === 'PRINT' && row.availableCopies === 0}
                    onClick={() => row.digitalAvailable ? setTab('digital') : handleRequest(row._id)}
                  >
                    {row.digitalAvailable ? <><FileText size={14} style={{ marginRight: 4 }} /> Access</> : <><Book size={14} style={{ marginRight: 4 }} /> Request</>}
                  </button>
                ), sortable: false },
              ]}
              data={searchResults?.data || []}
            />
          )}
        </div>
      )}

      {tab === 'issued' && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loansLoading ? (
             <div style={{ padding: 20 }}>Loading your loans...</div>
          ) : LOANS.length === 0 ? (
             <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
                <Book size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <div>You currently have no active loans.</div>
             </div>
          ) : LOANS.map(loan => (
            <div key={loan._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 16, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ padding: 12, background: 'var(--brand-soft, #FDF3F3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Book size={28} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{loan.bookCopyId?.bookTitleId?.title || 'Unknown Title'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{loan.bookCopyId?.bookTitleId?.authors?.map(a => a.name).join(', ')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>Issued: {new Date(loan.issuedAt).toLocaleDateString()} • Due: {new Date(loan.dueAt).toLocaleDateString()}</div>
                  <div style={{ marginTop: 8 }}>
                    <StatusBadge status={loan.status.toLowerCase()} map={{ active: { label: 'Currently Issued', cls: 'badge-success' }, overdue: { label: 'Overdue', cls: 'badge-error' } }} />
                  </div>
                </div>
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ alignSelf: 'center' }}
                  onClick={() => handleReturn(loan._id)}
                  disabled={returnMutation.isLoading}
                >
                  {returnMutation.isLoading ? 'Returning...' : 'Return'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'digital' && (
        <div style={{ marginTop: 16 }}>
          {digitalLoading ? (
            <div style={{ padding: 20 }}>Loading digital resources...</div>
          ) : !digitalResources?.data || digitalResources.data.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <div>No digital resources available at the moment.</div>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'fileName', label: 'Resource', render: (v, row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{row.bookTitleId?.title || v}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{row.bookTitleId?.authors?.map(a=>a.name).join(', ')} • {(row.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                )},
                { key: 'fileType', label: 'Format', render: v => <span className="badge badge-info">{v}</span> },
                { key: '_id', label: 'Action', width: 140, render: (_, row) => (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => handleAccess(row._id, 'VIEW')}
                      disabled={accessMutation.isLoading}
                    >
                      <FileText size={14} style={{ marginRight: 4 }} /> Read
                    </button>
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => handleAccess(row._id, 'DOWNLOAD')}
                      disabled={accessMutation.isLoading}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ), sortable: false },
              ]}
              data={digitalResources.data}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── PLACEMENT PORTAL (Student View) ─────────────────────────────────────────
export function StudentPlacement({ user }) {
  const { data: PLACEMENT_DRIVES } = useLivePlacementDrives();
  const [tab, setTab] = useState('drives');

  return (
    <div>
      <PageHeader title="Placement Portal" subtitle="Campus recruitment drives, applications, and preparation"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Placement Portal' }]}
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <StatCard label="Upcoming Drives" value={PLACEMENT_DRIVES.filter(d => d.status === 'upcoming').length} icon={<Building size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Applications" value="2" trend="1 in progress" trendType="neutral" icon={<FileText size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Your CGPA" value={user.gpa || '8.74'} trend="Eligible for most drives" trendType="up" icon={<GraduationCap size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        <StatCard label="Offers Received" value="0" trend="Season in progress" trendType="neutral" icon={<Briefcase size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
      </div>

      <Tabs tabs={[
        { id: 'drives', label: 'Placement Drives', icon: <Building size={16} /> },
        { id: 'applied', label: 'My Applications', icon: <FileText size={16} /> },
        { id: 'preparation', label: 'Preparation', icon: <BookOpen size={16} /> },
      ]} active={tab} onChange={setTab} />

      {tab === 'drives' && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PLACEMENT_DRIVES.map(drive => (
            <div key={drive.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                  <div style={{ fontSize: 32, width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>{drive.logo}</div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{drive.company}</h4>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{drive.role}</div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarIcon size={12} /> {drive.date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={12} /> {drive.package}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {drive.eligible} eligible</span>
                      {drive.applied > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> {drive.applied} applied</span>}
                      {drive.selected > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} /> {drive.selected} selected</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <StatusBadge status={drive.status} />
                  {drive.status === 'upcoming' && <button className="btn btn-primary btn-sm">Apply Now</button>}
                  {drive.status === 'ongoing' && <button className="btn btn-outline btn-sm">View Details</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'applied' && (
        <div style={{ marginTop: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ padding: 12, background: 'var(--brand-soft, #FDF3F3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>Microsoft — Full Stack Developer</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Applied on July 12, 2026</div>
              </div>
              <StatusBadge status="in-progress" />
            </div>
            <WorkflowTimeline steps={[
              { title: 'Applied', status: 'completed', date: 'Jul 12' },
              { title: 'Resume Shortlisted', status: 'completed', date: 'Jul 14' },
              { title: 'Online Assessment', status: 'active', subtitle: 'Scheduled Jul 18' },
              { title: 'Interview', status: 'pending' },
              { title: 'Result', status: 'pending' },
            ]} />
          </div>
        </div>
      )}

      {tab === 'preparation' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { title: 'DSA Practice', icon: <BookOpen size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, desc: '150 problems solved', progress: 60 },
              { title: 'System Design', icon: <Building size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, desc: '8 case studies', progress: 35 },
              { title: 'Mock Interviews', icon: <MessageSquare size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, desc: '3 completed', progress: 25 },
              { title: 'Resume Building', icon: <FileText size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, desc: 'Last updated Jul 10', progress: 90 },
              { title: 'Aptitude Prep', icon: <TrendingUp size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, desc: '45 tests taken', progress: 70 },
              { title: 'Communication', icon: <Users size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />, desc: '2 sessions completed', progress: 40 },
            ].map(item => (
              <div key={item.title} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{item.desc}</div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 4, height: 6, marginTop: 12 }}>
                  <div style={{ width: `${item.progress}%`, height: '100%', borderRadius: 4, background: 'var(--accent)', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── STUDENT LEAVE MANAGEMENT ───────────────────────────────────────────────
export function StudentLeaveManagement({ user }) {
  const { data: leaves } = useLiveLeaveRecords({ role: 'student', userId: user.id });
  const { data: balanceData } = useLiveLeaveBalance(user.id);
  const { data: ENROLLMENTS } = useLiveEnrollments(user.id);
  
  const applyMutation = useApplyForLeave();
  const withdrawMutation = useWithdrawLeave();

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState('Casual Leave');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  
  const daysCount = useMemo(() => {
    if (from && to) {
      const d1 = new Date(from);
      const d2 = new Date(to);
      const diff = d2 - d1;
      if (diff >= 0) {
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    return 0;
  }, [from, to]);

  const [affectedCourses, setAffectedCourses] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    applyMutation.mutate({
      requesterId: user.id,
      requesterRole: 'student',
      leaveType: type,
      startDate: from,
      endDate: to,
      daysCount,
      affectedCourses,
      reason
    });
    setModalOpen(false);
  }

  function handleWithdraw(id) {
    withdrawMutation.mutate({ id, requesterId: user.id });
  }

  return (
    <div>
      <PageHeader
        title="Leave Management"
        subtitle="Apply for leave, check your balance, and track approvals"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Leave Management' }]}
      >
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Apply for Leave</button>
      </PageHeader>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {balanceData.map(b => (
          <StatCard key={b.type} label={`${b.type} Balance`} value={`${b.remaining} / ${b.total}`} icon={<CalendarIcon size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} trend={`${b.used} used`} trendType="neutral" />
        ))}
        {balanceData.length === 0 && (
           <StatCard label="Leave Policy" value="Loading..." icon={<FileText size={24} color="var(--brand, #C43D3D)" strokeWidth={1.5} />} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16, color: 'var(--text-1)' }}>Leave History</h3>
          <DataTable
            columns={[
              { key: 'leaveType', label: 'Type' },
              { key: 'startDate', label: 'From Date' },
              { key: 'endDate', label: 'To Date' },
              { key: 'daysCount', label: 'Days', width: 70 },
              { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
              { key: 'id', label: 'Action', render: (v, row) => (
                 row.status === 'pending' ? (
                   <button className="btn btn-outline btn-sm" onClick={() => handleWithdraw(row._id || row.id)}>Withdraw</button>
                 ) : null
              ), sortable: false }
            ]}
            data={leaves}
          />
        </div>

        <div className="card" style={{ padding: 20, alignSelf: 'start' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 12, color: 'var(--text-1)' }}>Upcoming Leaves</h3>
          {leaves.filter(l => l.status === 'approved' && new Date(l.startDate) >= new Date()).length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No upcoming approved leaves.</p>
          ) : (
            leaves.filter(l => l.status === 'approved' && new Date(l.startDate) >= new Date()).map(l => (
              <div key={l._id || l.id} style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8, marginBottom: 8, borderLeft: '3px solid var(--accent)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>{l.leaveType}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{l.startDate} to {l.endDate}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={modalOpen} title="Apply for Leave" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              {balanceData.map(b => <option key={b.type} value={b.type}>{b.type}</option>)}
              {balanceData.length === 0 && <option value="Casual Leave">Casual Leave</option>}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">From Date</label>
              <input type="date" className="form-input" required value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">To Date</label>
              <input type="date" className="form-input" required value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
          {daysCount > 0 && (
             <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-2)' }}>
               Total days: <strong>{daysCount}</strong>
               {(() => {
                  const bal = balanceData.find(b => b.type === type);
                  if (bal && bal.remaining < daysCount) {
                     return <span style={{ color: 'var(--danger)', marginLeft: 8 }}>⚠️ Exceeds quota!</span>;
                  }
                  return <span style={{ color: 'var(--success)', marginLeft: 8 }}>✓ Within quota</span>;
               })()}
             </div>
          )}
          <div className="form-group">
            <label className="form-label">Affected Courses (Optional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ENROLLMENTS.map(c => (
                 <label key={c.id || c._id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                   <input type="checkbox" checked={affectedCourses.includes(c.id || c._id)} onChange={(e) => {
                     if (e.target.checked) setAffectedCourses([...affectedCourses, c.id || c._id]);
                     else setAffectedCourses(affectedCourses.filter(id => id !== (c.id || c._id)));
                   }} />
                   {c.code || c.title}
                 </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea className="form-textarea" required value={reason} onChange={e => setReason(e.target.value)} rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={applyMutation.isLoading}>
              {applyMutation.isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


