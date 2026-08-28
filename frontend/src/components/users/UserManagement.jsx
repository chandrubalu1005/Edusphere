import React, { useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLiveAdminUsers } from "../../api/liveData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Search, Plus, MoreVertical, Eye, Pencil, KeyRound, UserX, UserCheck, Users, GraduationCap, Building2, ShieldCheck, SlidersHorizontal, X, ChevronDown
} from "lucide-react";
import UserProvisioningForm from "./UserProvisioningForm";
import PasswordResetModal from "./PasswordResetModal";
import api from '../../api/client';
import { Icon, ICONS } from '../Layout.jsx';

const ADMIN_API = import.meta.env.VITE_ADMIN_API || 'http://localhost:3015/api';

const ROLE_PERMISSIONS = {
  faculty: ["student"],
  management: ["student", "faculty"],
  admin: ["student", "faculty", "management"],
  super_admin: ["student", "faculty", "management", "admin"]
};

const ROLE_CONFIG = {
  student: {
    label: "Student",
    description: "Create a new student account",
    icon: '🎓',
    badge: "badge-primary"
  },
  faculty: {
    label: "Faculty",
    description: "Create a new faculty account",
    icon: '👩‍🏫',
    badge: "badge-secondary"
  },
  management: {
    label: "Management",
    description: "Create a new management account",
    icon: '📊',
    badge: "badge-info"
  },
  admin: {
    label: "Admin",
    description: "Create a new administrator account",
    icon: '⚙️',
    badge: "badge-danger"
  }
};

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

export default function UserManagement() {
  const { user } = useAuth();
  const currentRole = user?.role || "admin";
  const allowedRoles = ROLE_PERMISSIONS[currentRole] || [];

  const { data: users, isLoading } = useLiveAdminUsers();
  
  const queryClient = useQueryClient();
  const deactivateMutation = useMutation({
    mutationFn: async ({ userId, active }) => {
      const res = await api.patch(`/admin/users/bulk`, { userIds: [userId], active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to update user status');
    }
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActions, setShowActions] = useState(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const uName = (u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.username || u.email || 'User').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      const uId = (u.id || u._id || '').toLowerCase();
      const searchLower = search.toLowerCase();
      
      const matchesSearch = uName.includes(searchLower) || uEmail.includes(searchLower) || uId.includes(searchLower);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || (u.active ? "active" : "deactivated") === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = {
    total: users?.length || 0,
    students: users?.filter(u => u.role === "student").length || 0,
    faculty: users?.filter(u => u.role === "faculty").length || 0,
    management: users?.filter(u => u.role === "management").length || 0,
    admins: users?.filter(u => u.role === "admin" || u.role === "super_admin").length || 0
  };

  function getInitials(name) {
    if (!name) return 'U';
    return name.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase();
  }

  function handleDeactivate(id, active) {
    deactivateMutation.mutate({ userId: id, active: !active }, {
      onSuccess: () => {
        toast.success(`User ${active ? 'deactivated' : 'reactivated'} successfully.`);
      },
      onError: (err) => {
        toast.error(`Failed to update status: ${err.message}`);
      }
    });
    setShowActions(null);
  }

  return (
    <div>
      <PageHeader 
        title="User Management" 
        subtitle={
          currentRole === 'admin' || currentRole === 'super_admin' ? 'Create, manage and monitor users across EduSphere.' : 
          currentRole === 'management' ? 'Manage students and faculty within your institution.' :
          'Manage students in your authorized courses.'
        }
      >
        <button className="btn btn-primary" onClick={() => setIsProvisioningModalOpen(true)}>
          <Icon d={ICONS.plus} size={15} />
          {currentRole === "faculty" ? "Add Student" : "Add User"}
        </button>
      </PageHeader>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {(currentRole === 'admin' || currentRole === 'management' || currentRole === 'super_admin') && (
           <StatCard icon="👥" label="Total Users" value={stats.total} sub="Authorized users" />
        )}
        <StatCard icon="🎓" label="Students" value={stats.students} sub="Student accounts" />
        {currentRole !== 'faculty' && (
          <StatCard icon="👩‍🏫" label="Faculty" value={stats.faculty} sub="Faculty accounts" />
        )}
        {(currentRole === 'admin' || currentRole === 'super_admin') && (
          <>
            <StatCard icon="📊" label="Management" value={stats.management} sub="Management accounts" />
            <StatCard icon="⚙️" label="Admins" value={stats.admins} sub="Administrative accounts" />
          </>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th colSpan="7" style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                      <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><Icon d={ICONS.search} size={14} /></div>
                      <input className="form-input form-input-sm" style={{ paddingLeft: 30, height: 32, fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." />
                    </div>
                    <select className="form-input form-input-sm" style={{ width: 140, height: 32, fontSize: 13 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                      <option value="all">All Roles</option>
                      {allowedRoles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                    <select className="form-input form-input-sm" style={{ width: 140, height: 32, fontSize: 13 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                </th>
              </tr>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>No users found matching your criteria.</td></tr>
              ) : (
                filteredUsers.map(u => {
                  const uId = u.id || u._id || u.userId;
                  const config = ROLE_CONFIG[u.role] || ROLE_CONFIG.student;
                  const displayName = u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.username || u.email || 'User';

                  return (
                    <tr key={uId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--accent)', fontSize: 12 }}>
                            {u.avatarUrl ? <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(displayName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{displayName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${config.badge}`} style={{ fontSize: 11, padding: '2px 6px' }}>
                          {config.icon} {config.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{u.department || "—"}</td>
                      <td>
                        <span className={`badge ${u.active ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: 11, padding: '2px 6px' }}>
                          {u.active ? "● Active" : "○ Suspended"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>sys_admin</td>
                      <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm" title="View profile" style={{ padding: '0 6px', height: 28 }} onClick={() => setSelectedUser(u)}>
                            <Icon d={ICONS.eye} size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Edit user" style={{ padding: '0 6px', height: 28 }}>
                            <Icon d={ICONS.edit} size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Reset Password" style={{ padding: '0 6px', height: 28 }} onClick={() => setResetPasswordUserId(uId)}>
                            <KeyRound size={14} />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title={u.active ? "Suspend User" : "Reactivate User"} 
                            style={{ padding: '0 6px', height: 28, color: u.active ? 'var(--danger)' : 'var(--success)' }} 
                            onClick={() => handleDeactivate(uId, u.active)}
                          >
                            {u.active ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserProvisioningForm 
        isOpen={isProvisioningModalOpen} 
        onClose={() => setIsProvisioningModalOpen(false)} 
        allowedRoles={allowedRoles}
      />
      <PasswordResetModal
        userId={resetPasswordUserId}
        isOpen={!!resetPasswordUserId}
        onClose={() => setResetPasswordUserId(null)}
      />
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value sm">{value}</div>
      <div className="stat-trend trend-neutral" style={{ fontSize: 12 }}>{sub}</div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}
