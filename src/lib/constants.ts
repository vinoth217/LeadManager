import { Manager } from '@/types';

export const INITIAL_MANAGERS: Manager[] = [
  {
    id: 'admin',
    name: 'Admin',
    role: 'Lead Operations Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    email: 'admin@impigertech.com',
    password: 'Password@123',
    phone: '+1 (555) 019-2831',
    userRole: 'admin',
    status: 'Active',
    department: 'Operations & Enterprise Architecture',
    specialties: [
      'Digital Transformation',
      'Cloud & Architecture',
      'AI Solutions',
      'Product Engineering',
    ],
    region: 'Global',
    activeLeads: 0,
    maxCapacity: 100,
    joinedDate: 'Jan 2024',
  },
];
