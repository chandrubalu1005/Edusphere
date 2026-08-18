import { GraduationCap, Presentation, Shield, Building } from 'lucide-react';

export const DOMAIN_CONFIG = {
  student: {
    id: 'student',
    label: 'Student',
    description: 'Access your courses, assignments, grades and more.',
    icon: GraduationCap,
    accent: '#8B5CF6',
    bg: '#F3F0FF',
    identifierLabel: 'Email or Student ID'
  },
  faculty: {
    id: 'faculty',
    label: 'Faculty',
    description: 'Manage classes, students, assessments and academic activities.',
    icon: Presentation,
    accent: '#3B82F6',
    bg: '#EFF6FF',
    identifierLabel: 'Institutional Email or Faculty ID'
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Manage system operations, users, and platform settings.',
    icon: Shield,
    accent: '#10B981',
    bg: '#ECFDF5',
    identifierLabel: 'Admin Email or Admin ID'
  },
  management: {
    id: 'management',
    label: 'Management',
    description: 'Executive dashboards, reports, analytics and insights.',
    icon: Building,
    accent: '#F59E0B',
    bg: '#FFFBEB',
    identifierLabel: 'Institutional Email or Management ID'
  }
};
