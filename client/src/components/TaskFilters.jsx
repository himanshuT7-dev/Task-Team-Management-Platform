import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';
import { setFilters } from '../store/taskSlice';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const TaskFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.tasks.filters);
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users')
      .then((res) => setUsers(res.data.users || []))
      .catch(() => {});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'sortSelection') {
      let sortBy = 'createdAt';
      let sortOrder = 'desc';
      if (value === 'oldest') {
        sortBy = 'createdAt';
        sortOrder = 'asc';
      } else if (value === 'dueDate') {
        sortBy = 'dueDate';
        sortOrder = 'asc';
      }
      dispatch(setFilters({ ...filters, sortBy, sortOrder, page: 1 }));
      return;
    }

    dispatch(setFilters({ ...filters, [name]: value, page: 1 }));
  }, [dispatch, filters]);

  const currentSortSelection =
    filters.sortBy === 'dueDate'
      ? 'dueDate'
      : filters.sortOrder === 'asc'
      ? 'oldest'
      : 'newest';

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={handleChange}
          placeholder="Search tasks by title..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
        />
      </div>

      <select
        name="status"
        value={filters.status || 'all'}
        onChange={handleChange}
        className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select
        name="priority"
        value={filters.priority || 'all'}
        onChange={handleChange}
        className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
      >
        <option value="all">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <select
        name="assignedUser"
        value={filters.assignedUser || 'all'}
        onChange={handleChange}
        className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
      >
        <option value="all">All Assignees</option>
        {user && <option value={user.id}>Assigned to Me</option>}
        {users
          .filter((u) => u._id !== user?.id)
          .map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.role})
            </option>
          ))}
      </select>

      <select
        name="sortSelection"
        value={currentSortSelection}
        onChange={handleChange}
        className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="dueDate">Due Date</option>
      </select>
    </div>
  );
};

export default TaskFilters;
