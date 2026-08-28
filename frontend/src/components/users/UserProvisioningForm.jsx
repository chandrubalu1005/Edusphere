import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Icon, ICONS } from '../Layout.jsx';
import api from '../../api/client';

const ROLE_CONFIG = {
  student: {
    label: "Student",
    description: "Create a new student account",
    icon: '🎓',
  },
  faculty: {
    label: "Faculty",
    description: "Create a new faculty account",
    icon: '👩‍🏫',
  },
  management: {
    label: "Management",
    description: "Create a new management account",
    icon: '📊',
  },
  admin: {
    label: "Admin",
    description: "Create a new administrator account",
    icon: '⚙️',
  }
};

export default function UserProvisioningForm({ isOpen, onClose, allowedRoles = [] }) {
  const [selectedRole, setSelectedRole] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {selectedRole ? `Create ${ROLE_CONFIG[selectedRole]?.label}` : 'Add New User'}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon d={ICONS.x} size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!selectedRole ? (
            <div>
              <label className="form-label">Select User Role</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {allowedRoles.map(role => {
                  const config = ROLE_CONFIG[role];
                  if (!config) return null;
                  return (
                    <div
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
                        border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer',
                        transition: 'all 0.2s', background: 'var(--bg)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
                    >
                      <div style={{ fontSize: 24, padding: 8, background: 'var(--surface-2)', borderRadius: 8 }}>
                        {config.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{config.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{config.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <RoleForm
              role={selectedRole}
              onBack={() => setSelectedRole(null)}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RoleForm({ role, onBack, onClose }) {
  const [form, setForm] = useState({
    fullName: "", username: "", email: "", phone: "",
    department: "", studentId: "", employeeId: "", managementId: "", adminId: "",
    program: "", batch: "", semester: "", designation: "", qualification: "", experience: "",
    office: "", password: ""
  });
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/admin/users`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User provisioned successfully');
      queryClient.invalidateQueries(['adminUsers']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to create user');
    }
  });

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const [firstName, ...lastNameParts] = form.fullName.trim().split(" ");
    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      role: role,
      firstName: firstName || "",
      lastName: lastNameParts.join(" ") || "",
      phone: form.phone,
      department: form.department,
    };
    createMutation.mutate(payload);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12 }}>
          ← Change Role
        </button>
      </div>

      <FormSection title="Account Security">
        <FormField label="Initial Password" type="password" required value={form.password} onChange={v => update("password", v)} />
      </FormSection>

      <FormSection title="Personal Information">
        <FormField label="Full Name" required value={form.fullName} onChange={v => update("fullName", v)} />
        <FormField label="Username" required value={form.username} onChange={v => update("username", v)} />
        <FormField label="Email" type="email" required value={form.email} onChange={v => update("email", v)} />
        <FormField label="Phone" value={form.phone} onChange={v => update("phone", v)} />
      </FormSection>

      {role === "student" && (
        <FormSection title="Academic Information">
          <FormField label="Student ID" required value={form.studentId} onChange={v => update("studentId", v)} />
          <FormField label="Department" required value={form.department} onChange={v => update("department", v)} />
          <FormField label="Program" required value={form.program} onChange={v => update("program", v)} />
          <FormField label="Batch" value={form.batch} onChange={v => update("batch", v)} />
          <FormField label="Semester" value={form.semester} onChange={v => update("semester", v)} />
        </FormSection>
      )}

      {role === "faculty" && (
        <FormSection title="Professional Information">
          <FormField label="Employee ID" required value={form.employeeId} onChange={v => update("employeeId", v)} />
          <FormField label="Department" required value={form.department} onChange={v => update("department", v)} />
          <FormField label="Designation" required value={form.designation} onChange={v => update("designation", v)} />
          <FormField label="Qualification" value={form.qualification} onChange={v => update("qualification", v)} />
          <FormField label="Experience" value={form.experience} onChange={v => update("experience", v)} />
        </FormSection>
      )}

      {role === "management" && (
        <FormSection title="Management Information">
          <FormField label="Management ID" required value={form.managementId} onChange={v => update("managementId", v)} />
          <FormField label="Department" value={form.department} onChange={v => update("department", v)} />
          <FormField label="Designation" required value={form.designation} onChange={v => update("designation", v)} />
          <FormField label="Qualification" value={form.qualification} onChange={v => update("qualification", v)} />
          <FormField label="Experience" value={form.experience} onChange={v => update("experience", v)} />
        </FormSection>
      )}

      {role === "admin" && (
        <FormSection title="Administrative Information">
          <FormField label="Admin ID" required value={form.adminId} onChange={v => update("adminId", v)} />
          <FormField label="Department" value={form.department} onChange={v => update("department", v)} />
          <FormField label="Designation" required value={form.designation} onChange={v => update("designation", v)} />
          <FormField label="Employee Type" value="" onChange={() => {}} />
        </FormSection>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <button type="button" onClick={onClose} className="btn btn-outline" disabled={createMutation.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : `Create ${ROLE_CONFIG[role]?.label}`}
        </button>
      </div>
    </form>
  );
}

function FormSection({ title, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>{title}</div>
      <div className="form-grid">
        {children}
      </div>
    </section>
  );
}

function FormField({ label, required, type = "text", value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="form-input"
      />
    </div>
  );
}
