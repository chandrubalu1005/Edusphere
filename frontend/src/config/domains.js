import { GraduationCap, Presentation, Shield, Building } from 'lucide-react';

export const DOMAIN_CONFIG = {
  student: {
    id: 'student',
    label: 'Student',
    description: 'Access your courses, assignments, grades and more.',
    icon: GraduationCap,
    accent: 'var(--brand, #C43D3D)',
    bg: 'var(--brand-subtle, #FDF3F3)',
    identifierLabel: 'Email or Student ID'
  },
  faculty: {
    id: 'faculty',
    label: 'Faculty',
    description: 'Manage classes, students, assessments and academic activities.',
    icon: Presentation,
    accent: 'var(--brand, #C43D3D)',
    bg: 'var(--brand-subtle, #FDF3F3)',
    identifierLabel: 'Institutional Email or Faculty ID'
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Manage system operations, users, and platform settings.',
    icon: Shield,
    accent: 'var(--brand, #C43D3D)',
    bg: 'var(--brand-subtle, #FDF3F3)',
    identifierLabel: 'Admin Email or Admin ID'
  },
  management: {
    id: 'management',
    label: 'Management',
    description: 'Executive dashboards, reports, analytics and insights.',
    icon: Building,
    accent: 'var(--brand, #C43D3D)',
    bg: 'var(--brand-subtle, #FDF3F3)',
    identifierLabel: 'Institutional Email or Management ID'
  }
};
