'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Sparkles,
  Mail,
  Phone,
  Globe,
  Sliders,
  X,
  Lock,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Plus,
} from 'lucide-react';
import { Manager, UserSystemRole, UserStatus } from '@/types';

interface UsersViewProps {
  managers: Manager[];
  onRefreshManagers: () => void;
}

const DOMAIN_OPTIONS = [
  'Cloud Solutions',
  'AWS',
  'Azure',
  'AI & GenAI',
  'LLMs & RAG',
  'Mobile App Dev',
  'Flutter',
  'iOS & Android',
  'Testing Services',
  'QA Automation',
  'UI/UX Design',
  'Product Strategy',
  'IoT & Smart Systems',
  'Enterprise Logistics',
];

// Presets for quick selection
const PRESET_AVATARS = [
  {
    id: 'initials-orange',
    label: 'Coral Initials (Default)',
    getUrl: (name: string) =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=ff6937&color=ffffff&bold=true&size=128`,
  },
  {
    id: 'initials-navy',
    label: 'Navy Initials',
    getUrl: (name: string) =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0f172a&color=ffffff&bold=true&size=128`,
  },
  {
    id: 'avatar-1',
    label: 'Female Specialist 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop&crop=face',
  },
  {
    id: 'avatar-2',
    label: 'Male Architect 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
  },
  {
    id: 'avatar-3',
    label: 'Female Specialist 2',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&crop=face',
  },
  {
    id: 'avatar-4',
    label: 'Male Architect 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face',
  },
];

const getDefaultAvatar = (name: string, role?: string) => {
  const bg = role === 'admin' ? '0f172a' : 'ff6937';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${bg}&color=ffffff&bold=true&size=128`;
};

export const UsersView: React.FC<UsersViewProps> = ({
  managers,
  onRefreshManagers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Solutions Specialist');
  const [newUserRole, setNewUserRole] = useState<UserSystemRole>('specialist');
  const [newDepartment, setNewDepartment] = useState('Product Engineering');
  const [newRegion, setNewRegion] = useState('North America');
  const [newMaxCapacity, setNewMaxCapacity] = useState(10);
  const [newAvatar, setNewAvatar] = useState('');
  const [newPassword, setNewPassword] = useState('Password@123');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'Cloud Solutions',
    'AI & GenAI',
  ]);

  // Dynamic domain options (initialized from defaults + any custom manager specialties)
  const [domainOptions, setDomainOptions] = useState<string[]>(() => {
    const set = new Set<string>(DOMAIN_OPTIONS);
    managers.forEach((m) => {
      if (Array.isArray(m.specialties)) {
        m.specialties.forEach((s) => set.add(s));
      }
    });
    return Array.from(set);
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editSkillInput, setEditSkillInput] = useState('');

  // Edit User Modal State
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserSystemRole>('specialist');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editMaxCapacity, setEditMaxCapacity] = useState(10);
  const [editStatus, setEditStatus] = useState<UserStatus>('Active');
  const [editAvatar, setEditAvatar] = useState('');
  const [editPassword, setEditPassword] = useState('Password@123');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSpecialties, setEditSpecialties] = useState<string[]>([]);

  // Handlers to add new custom skills
  const handleAddCustomSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;

    if (!domainOptions.includes(trimmed)) {
      setDomainOptions((prev) => [...prev, trimmed]);
    }
    if (!selectedSpecialties.includes(trimmed)) {
      setSelectedSpecialties((prev) => [...prev, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleEditAddCustomSkill = () => {
    const trimmed = editSkillInput.trim();
    if (!trimmed) return;

    if (!domainOptions.includes(trimmed)) {
      setDomainOptions((prev) => [...prev, trimmed]);
    }
    if (!editSpecialties.includes(trimmed)) {
      setEditSpecialties((prev) => [...prev, trimmed]);
    }
    setEditSkillInput('');
  };

  // Filtered managers
  const filteredManagers = managers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === 'All'
        ? true
        : roleFilter === 'Admin'
        ? m.userRole === 'admin'
        : m.userRole !== 'admin';

    return matchesSearch && matchesRole;
  });

  const toggleSpecialty = (sp: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp]
    );
  };

  const toggleEditSpecialty = (sp: string) => {
    setEditSpecialties((prev) =>
      prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp]
    );
  };

  // Open Edit Modal with manager's current values
  const handleOpenEdit = (m: Manager) => {
    setEditingManager(m);
    setEditName(m.name);
    setEditEmail(m.email);
    setEditPhone(m.phone || '');
    setEditPassword(m.password || 'Password@123');
    setShowEditPassword(false);
    setEditRole(m.role);
    setEditUserRole(m.userRole || 'specialist');
    setEditDepartment(m.department || 'Product Engineering');
    setEditRegion(m.region || 'North America');
    setEditMaxCapacity(m.maxCapacity || 10);
    setEditStatus(m.status || 'Active');
    setEditAvatar(m.avatar || getDefaultAvatar(m.name, m.userRole));
    setEditSpecialties(m.specialties || []);

    if (Array.isArray(m.specialties)) {
      setDomainOptions((prev) => {
        const set = new Set([...prev, ...m.specialties]);
        return Array.from(set);
      });
    }

    setIsEditModalOpen(true);
  };

  // Create User Submission
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    setIsSubmitting(true);
    try {
      const finalAvatar = newAvatar.trim() || getDefaultAvatar(newName, newUserRole);
      const res = await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword || 'Password@123',
          phone: newPhone,
          role: newRole,
          userRole: newUserRole,
          department: newDepartment,
          region: newRegion,
          maxCapacity: newMaxCapacity,
          specialties: selectedSpecialties,
          status: 'Active',
          avatar: finalAvatar,
        }),
      });

      if (res.ok) {
        setIsAddUserModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewPassword('Password@123');
        setNewAvatar('');
        onRefreshManagers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update User Submission
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager || !editName || !editEmail) return;

    setIsUpdating(true);
    try {
      const finalAvatar = editAvatar.trim() || getDefaultAvatar(editName, editUserRole);
      const res = await fetch(`/api/managers/${editingManager.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          password: editPassword || 'Password@123',
          phone: editPhone,
          role: editRole,
          userRole: editUserRole,
          department: editDepartment,
          region: editRegion,
          maxCapacity: editMaxCapacity,
          status: editStatus,
          specialties: editSpecialties,
          avatar: finalAvatar,
        }),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingManager(null);
        onRefreshManagers();
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === 'admin') {
      alert('Primary Admin account cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to remove ${name} from the portal?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/managers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshManagers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (m: Manager) => {
    const nextStatus: UserStatus =
      m.status === 'Out of Office' ? 'Active' : 'Out of Office';
    try {
      await fetch(`/api/managers/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      onRefreshManagers();
    } catch (err) {
      console.error(err);
    }
  };

  const totalCapacity = managers.reduce((acc, m) => acc + (m.maxCapacity || 0), 0);
  const totalActiveLeads = managers.reduce((acc, m) => acc + (m.activeLeads || 0), 0);

  return (
    <div className="p-8 space-y-6 w-full">
      {/* Admin Security Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500 rounded-xl text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">
                Team & User Access Control
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Admin Only</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-normal">
              Manage internal specialists, domain expertise tags, user avatars, and Gemini AI auto-dispatch capacities.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setNewAvatar('');
            setIsAddUserModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff6937] hover:bg-[#ea580c] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        <div className="bg-white rounded-2xl p-5 border border-[#ebeef2] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Team Members
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {managers.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            <span className="text-[#ff6937] font-semibold">1 Super Admin</span> • {managers.length - 1} Specialists
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ebeef2] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            AI Auto-Routing
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight flex items-center gap-2">
            <span>Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Gemini Flash semantic dispatch
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ebeef2] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Pipeline Capacity
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {totalCapacity} <span className="text-sm font-normal text-slate-400">leads</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Max concurrent lead workload
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ebeef2] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Active Assigned Load
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {totalActiveLeads} <span className="text-sm font-normal text-slate-400">/ {totalCapacity}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {totalCapacity > 0 ? Math.round((totalActiveLeads / totalCapacity) * 100) : 0}% team bandwidth used
          </div>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white rounded-2xl border border-[#ebeef2] shadow-2xs overflow-hidden w-full">
        {/* Controls Toolbar */}
        <div className="p-5 border-b border-[#ebeef2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email, domain..."
                className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#f8fafc] p-0.5 rounded-lg border border-slate-200 text-xs">
              {(['All', 'Admin', 'Specialist'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-md transition-all font-semibold ${
                    roleFilter === r
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredManagers.length}</strong> team member(s)
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#ebeef2] text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#fafafa]">
                <th className="py-3 px-6 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role & Access</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Domain Specialties (AI Tags)</th>
                <th className="py-3 px-4 font-semibold">Region</th>
                <th className="py-3 px-4 font-semibold">Workload Capacity</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-6 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f7]">
              {filteredManagers.map((m) => {
                const isAdmin = m.userRole === 'admin';
                const isOutOfOffice = m.status === 'Out of Office';
                const capacityPct = Math.round((m.activeLeads / (m.maxCapacity || 10)) * 100);
                const displayAvatar = m.avatar || getDefaultAvatar(m.name, m.userRole);

                return (
                  <tr key={m.id} className="hover:bg-[#fcfdfd] transition-colors group">
                    {/* User Avatar & Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={displayAvatar}
                            alt={m.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = getDefaultAvatar(m.name, m.userRole);
                            }}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
                          />
                          {isAdmin && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#ff6937] ring-2 ring-white flex items-center justify-center text-[7px] text-white font-bold"
                              title="Super Admin"
                            >
                              ★
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{m.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{m.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Access Badge */}
                    <td className="py-4 px-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                          <Shield className="w-3 h-3 text-[#ff6937]" />
                          <span>Super Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span>{m.role}</span>
                        </span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {m.department || 'Digital Engineering'}
                    </td>

                    {/* Domain Specialties */}
                    <td className="py-4 px-4">
                      {(() => {
                        const specs = Array.isArray(m.specialties) ? m.specialties : [];
                        if (specs.length === 0) {
                          return (
                            <span className="text-slate-400 text-[11px] italic">
                              No specialties
                            </span>
                          );
                        }

                        const visibleSpecs = specs.slice(0, 2);
                        const remainingSpecs = specs.slice(2);
                        const remainingText = remainingSpecs.join(', ');

                        return (
                          <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                            {visibleSpecs.map((sp, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium whitespace-nowrap"
                              >
                                {sp}
                              </span>
                            ))}
                            {remainingSpecs.length > 0 && (
                              <div className="relative group/tag inline-flex items-center">
                                <span
                                  className="px-1.5 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#ff6937] border border-orange-200/80 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                                  title={remainingText}
                                >
                                  +{remainingSpecs.length}
                                </span>
                                {/* Floating Tooltip showing comma-separated remaining tags */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tag:flex flex-col items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                                  <div className="bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap max-w-xs leading-normal border border-slate-700">
                                    {remainingText}
                                  </div>
                                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Region */}
                    <td className="py-4 px-4 text-slate-500 font-normal whitespace-nowrap">
                      {m.region}
                    </td>

                    {/* Workload */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 w-28">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                          <span>{m.activeLeads} / {m.maxCapacity}</span>
                          <span>{capacityPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              capacityPct >= 80
                                ? 'bg-rose-500'
                                : capacityPct >= 50
                                ? 'bg-amber-400'
                                : 'bg-[#ff6937]'
                            }`}
                            style={{ width: `${capacityPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(m)}
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          isOutOfOffice
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-100'
                        }`}
                        title="Click to toggle availability"
                      >
                        {m.status || 'Active'}
                      </button>
                    </td>

                    {/* Actions: Edit, Toggle Status, Delete */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded text-slate-400 hover:text-[#ff6937] hover:bg-orange-50 transition-colors"
                          title="Edit User Details & AI Specialties"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Availability toggle */}
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title={`Toggle Out of Office (${m.status})`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        {!isAdmin && (
                          <button
                            onClick={() => handleDeleteUser(m.id, m.name)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EDIT TEAM MEMBER MODAL                                   */}
      {/* ======================================================== */}
      {isEditModalOpen && editingManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#ff6937] text-white rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Edit User — {editingManager.name}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Update profile, avatar image, and AI dispatch credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Avatar Selector & Live Preview */}
              <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#ff6937]" />
                    <span>Profile Image & Default Avatar</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Select preset or enter custom image URL
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Live Avatar Preview */}
                  <img
                    src={editAvatar || getDefaultAvatar(editName, editUserRole)}
                    alt="Preview"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getDefaultAvatar(editName, editUserRole);
                    }}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-300 shadow-sm shrink-0 bg-white"
                  />

                  {/* Preset Avatar Pills */}
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditAvatar(getDefaultAvatar(editName, 'specialist'))}
                      className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-orange-200 bg-white hover:bg-orange-100 text-orange-700 transition-colors"
                    >
                      Orange Initials (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditAvatar(getDefaultAvatar(editName, 'admin'))}
                      className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-slate-300 bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                    >
                      Navy Initials
                    </button>
                    {PRESET_AVATARS.slice(2).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setEditAvatar(p.url!)}
                        className="px-2 py-1 text-[10px] font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Avatar URL Input */}
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">
                    Image URL (Leave empty to use automatic initials avatar)
                  </label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://... (or click any preset above)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-[#ff6937]" />
                      <span>Password</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Default: Password@123</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Password@123"
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-slate-800 font-mono focus:ring-1 focus:ring-orange-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Title & Access Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    System Access Level
                  </label>
                  <select
                    value={editUserRole}
                    disabled={editingManager.id === 'admin'}
                    onChange={(e) => setEditUserRole(e.target.value as UserSystemRole)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-orange-400 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="specialist">Specialist (Can receive AI leads)</option>
                    <option value="admin">Admin (Full administrative privileges)</option>
                    <option value="member">Viewer / Read Only</option>
                  </select>
                </div>
              </div>

              {/* Department & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  >
                    <option value="Cloud Solutions & DevOps">Cloud Solutions & DevOps</option>
                    <option value="AI & Data Analytics">AI & Data Analytics</option>
                    <option value="Mobile Engineering">Mobile Engineering</option>
                    <option value="Product Engineering">Product Engineering</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Operations & Enterprise Architecture">Operations & Enterprise Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Lead Workload</label>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={editMaxCapacity}
                    onChange={(e) => setEditMaxCapacity(Number(e.target.value))}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Region & Availability Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Region / Operational Territory
                  </label>
                  <select
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  >
                    <option value="North America">North America (EST / PST)</option>
                    <option value="Europe & UK">Europe & UK (GMT / CET)</option>
                    <option value="APAC & India">APAC & India (IST / SGT)</option>
                    <option value="Global">Global Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Availability Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  >
                    <option value="Active">Active (Eligible for AI routing)</option>
                    <option value="Out of Office">Out of Office (Pause AI leads)</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Domain Specialties */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center justify-between">
                  <span>Domain Specialties (Gemini AI will match incoming leads against these tags)</span>
                  <span className="text-[10px] text-[#ff6937] font-normal">
                    {editSpecialties.length} selected
                  </span>
                </label>

                {/* Add Custom Skill Input */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={editSkillInput}
                      onChange={(e) => setEditSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEditAddCustomSkill();
                        }
                      }}
                      placeholder="Add custom domain skill (e.g. Cybersecurity, Blockchain)..."
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleEditAddCustomSkill}
                    disabled={!editSkillInput.trim()}
                    className="px-3 py-1.5 bg-[#ff6937] hover:bg-[#ea580c] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40 shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-200 bg-[#f8fafc] max-h-36 overflow-y-auto">
                  {domainOptions.map((tag) => {
                    const isChecked = editSpecialties.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleEditSpecialty(tag)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                          isChecked
                            ? 'bg-[#ff6937] text-white shadow-2xs ring-1 ring-orange-300'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{isChecked ? '✓' : '+'}</span>
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-[#ff6937] hover:bg-[#ea580c] text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / INVITE TEAM MEMBER MODAL                           */}
      {/* ======================================================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#ff6937] text-white rounded-lg">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Add Team Member to Lead Routing Directory
                </h2>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Avatar Selector & Default Preview */}
              <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#ff6937]" />
                    <span>Default User Image & Avatar</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Live preview automatically defaults to initials
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Live Avatar Preview */}
                  <img
                    src={newAvatar || getDefaultAvatar(newName, newUserRole)}
                    alt="Preview"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getDefaultAvatar(newName, newUserRole);
                    }}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-300 shadow-sm shrink-0 bg-white"
                  />

                  {/* Preset Avatar Pills */}
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewAvatar(getDefaultAvatar(newName, 'specialist'))}
                      className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-orange-200 bg-white hover:bg-orange-100 text-orange-700 transition-colors"
                    >
                      Coral Initials (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAvatar(getDefaultAvatar(newName, 'admin'))}
                      className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-slate-300 bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                    >
                      Navy Initials
                    </button>
                    {PRESET_AVATARS.slice(2).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setNewAvatar(p.url!)}
                        className="px-2 py-1 text-[10px] font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Custom Avatar URL */}
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">
                    Custom Image URL (Optional — defaults to initials)
                  </label>
                  <input
                    type="url"
                    value={newAvatar}
                    onChange={(e) => setNewAvatar(e.target.value)}
                    placeholder="https://... (or leave empty for default)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. rachel.a@impigertech.com"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-[#ff6937]" />
                      <span>Initial Password</span>
                    </span>
                    <span className="text-[10px] text-[#ff6937] font-semibold">Default: Password@123</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password@123"
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-slate-800 font-mono focus:ring-1 focus:ring-orange-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role & Access Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Senior Cloud Architect"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    System Access Level
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserSystemRole)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  >
                    <option value="specialist">Specialist (Can receive AI leads)</option>
                    <option value="admin">Admin (Full administrative privileges)</option>
                    <option value="member">Viewer / Read Only</option>
                  </select>
                </div>
              </div>

              {/* Department & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  >
                    <option value="Cloud Solutions & DevOps">Cloud Solutions & DevOps</option>
                    <option value="AI & Data Analytics">AI & Data Analytics</option>
                    <option value="Mobile Engineering">Mobile Engineering</option>
                    <option value="Product Engineering">Product Engineering</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Product Design">Product Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Lead Workload</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newMaxCapacity}
                    onChange={(e) => setNewMaxCapacity(Number(e.target.value))}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Region / Operational Territory
                </label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-orange-400 focus:outline-none"
                >
                  <option value="North America">North America (EST / PST)</option>
                  <option value="Europe & UK">Europe & UK (GMT / CET)</option>
                  <option value="APAC & India">APAC & India (IST / SGT)</option>
                  <option value="Global">Global Operations</option>
                </select>
              </div>

              {/* Domain Specialties */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 flex items-center justify-between">
                  <span>Domain Specialties (Gemini AI will match incoming leads against these tags)</span>
                  <span className="text-[10px] text-[#ff6937] font-normal">
                    {selectedSpecialties.length} selected
                  </span>
                </label>

                {/* Add Custom Skill Input */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder="Add custom domain skill (e.g. Cybersecurity, Blockchain, Salesforce)..."
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    disabled={!newSkillInput.trim()}
                    className="px-3 py-1.5 bg-[#ff6937] hover:bg-[#ea580c] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40 shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-200 bg-[#f8fafc] max-h-36 overflow-y-auto">
                  {domainOptions.map((tag) => {
                    const isChecked = selectedSpecialties.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleSpecialty(tag)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                          isChecked
                            ? 'bg-[#ff6937] text-white shadow-2xs ring-1 ring-orange-300'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{isChecked ? '✓' : '+'}</span>
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#ff6937] hover:bg-[#ea580c] text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Adding User...' : 'Add to AI Directory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
