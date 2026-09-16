import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle2,
  Clock,
  Loader,
  AlertTriangle,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../store/uiSlice';
import api from '../services/api';

const Team = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAdmin } = useAuth();

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkload = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/workload');
      setMembers(response.data.workload || []);
    } catch (error) {
      dispatch(
        showToast({
          message: error.response?.data?.message || 'Failed to load team data',
          type: 'error'
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchWorkload();
  }, [isAdmin, navigate, fetchWorkload]);

  const handleRoleChange = async (targetUserId, nextRole) => {
    try {
      await api.put(`/users/${targetUserId}/role`, { role: nextRole });
      dispatch(
        showToast({
          message: `Member role updated to ${nextRole}`,
          type: 'success'
        })
      );
      fetchWorkload();
    } catch (error) {
      dispatch(
        showToast({
          message: error.response?.data?.message || 'Failed to update member role',
          type: 'error'
        })
      );
    }
  };

  const handleDeleteMember = async (targetUser) => {
    if (targetUser.id === user.id) {
      dispatch(
        showToast({
          message: 'You cannot delete your own administrator account',
          type: 'error'
        })
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${targetUser.name}? All their assigned tasks will also be cleaned up.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/users/${targetUser.id}`);
      dispatch(
        showToast({
          message: 'Team member removed from organization',
          type: 'success'
        })
      );
      fetchWorkload();
    } catch (error) {
      dispatch(
        showToast({
          message: error.response?.data?.message || 'Failed to remove member',
          type: 'error'
        })
      );
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!newMemberData.name.trim()) errors.name = 'Full name is required';
    if (!newMemberData.email.trim() || !newMemberData.email.includes('@'))
      errors.email = 'Valid email is required';
    if (!newMemberData.password || newMemberData.password.length < 6)
      errors.password = 'Password must be at least 6 characters';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/users', newMemberData);
      dispatch(
        showToast({
          message: `Team member ${newMemberData.name} created successfully`,
          type: 'success'
        })
      );
      setIsModalOpen(false);
      setNewMemberData({ name: '', email: '', password: '', role: 'user' });
      setFormErrors({});
      fetchWorkload();
    } catch (error) {
      dispatch(
        showToast({
          message: error.response?.data?.message || 'Failed to create member',
          type: 'error'
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMembers = members.length;
  const adminCount = members.filter((m) => m.role === 'admin').length;
  const userCount = totalMembers - adminCount;
  const totalTasksAssigned = members.reduce(
    (sum, m) => sum + (m.tasks?.total || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Team Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Only
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage organization members, assign administrative roles, and inspect task workloads.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs uppercase font-medium text-zinc-500 dark:text-zinc-400">
            Total Members
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {totalMembers}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs uppercase font-medium text-purple-600 dark:text-purple-400">
            Administrators
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {adminCount}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs uppercase font-medium text-zinc-600 dark:text-zinc-400">
            Standard Users
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {userCount}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400">
            Active Delegations
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {totalTasksAssigned}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Organization Members & Task Workload
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            Live Synchronization
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 text-xs font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Role Authority</th>
                <th className="px-4 py-3">Task Workload</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-zinc-400">
                    Loading team directory...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-zinc-400">
                    No team members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isCurrent = member.id === user.id;
                  const total = member.tasks?.total || 0;
                  const completed = member.tasks?.completed || 0;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-normal">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-zinc-500 dark:text-zinc-400">
                        {member.email}
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          disabled={isCurrent}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-medium bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            member.role === 'admin'
                              ? 'border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/20'
                              : 'border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300'
                          } ${isCurrent ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 min-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                            <span>
                              {completed} of {total} completed
                            </span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-200">
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-0.5">
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Clock className="w-3 h-3" /> {member.tasks?.pending || 0}
                            </span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Loader className="w-3 h-3" /> {member.tasks?.inProgress || 0}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> {completed}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          disabled={isCurrent}
                          onClick={() => handleDeleteMember(member)}
                          title={isCurrent ? 'Cannot delete yourself' : 'Remove team member'}
                          className={`p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${
                            isCurrent ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Add New Team Member
                </h3>
                <p className="text-xs text-zinc-500">
                  Created member will immediately have workspace access
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newMemberData.name}
                  onChange={(e) =>
                    setNewMemberData({ ...newMemberData, name: e.target.value })
                  }
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newMemberData.email}
                  onChange={(e) =>
                    setNewMemberData({ ...newMemberData, email: e.target.value })
                  }
                  placeholder="sarah@example.com"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.email && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={newMemberData.password}
                  onChange={(e) =>
                    setNewMemberData({ ...newMemberData, password: e.target.value })
                  }
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.password && (
                  <p className="text-xs text-rose-500 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  System Role
                </label>
                <select
                  value={newMemberData.role}
                  onChange={(e) =>
                    setNewMemberData({ ...newMemberData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="user">Standard User (Workload & Tasks)</option>
                  <option value="admin">Administrator (Full System Control)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
