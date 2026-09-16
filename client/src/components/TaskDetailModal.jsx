import React from 'react';
import {
  X,
  Calendar,
  User,
  ShieldCheck,
  Clock,
  Trash2,
  Pencil,
  AlertCircle
} from 'lucide-react';
import {
  statusConfig,
  priorityConfig,
  formatDate,
  getDaysRemaining
} from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const { user, isAdmin } = useAuth();

  if (!isOpen || !task) return null;

  const sConf = statusConfig[task.status] || statusConfig.pending;
  const pConf = priorityConfig[task.priority] || priorityConfig.medium;
  const daysRemaining = getDaysRemaining(task.dueDate);
  const isOverdue = daysRemaining < 0 && task.status !== 'completed';

  const taskCreatorId = task.createdBy?._id || task.createdBy;
  const currentUserId = user?.id || user?._id;
  const canDelete =
    isAdmin || (currentUserId && taskCreatorId === currentUserId);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-3 pr-8">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${sConf.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`}></span>
            {sConf.label}
          </span>

          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${pConf.badge}`}
          >
            {pConf.label} Priority
          </span>

          {task.createdBy?.role === 'admin' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Task
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 leading-snug">
          {task.title}
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider mb-2">
              Description
            </h3>
            <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {task.description && task.description.trim() !== ''
                ? task.description
                : 'No additional description provided for this task.'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-xs text-zinc-400 font-medium block mb-1">
                Due Date
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(task.dueDate)}
                </span>
              </div>
              {daysRemaining !== null && task.status !== 'completed' && (
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    isOverdue
                      ? 'text-rose-600 font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {isOverdue ? (
                    <>
                      <AlertCircle className="w-3 h-3" /> Overdue by{' '}
                      {Math.abs(daysRemaining)}{' '}
                      {Math.abs(daysRemaining) === 1 ? 'day' : 'days'}
                    </>
                  ) : daysRemaining === 0 ? (
                    'Due today'
                  ) : (
                    `Due in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`
                  )}
                </p>
              )}
            </div>

            <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-xs text-zinc-400 font-medium block mb-1">
                Quick Status Change
              </span>
              <select
                value={task.status}
                onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
                className="w-full text-xs font-medium px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex items-center gap-3 p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                {task.assignedUser?.name
                  ? task.assignedUser.name.charAt(0).toUpperCase()
                  : 'U'}
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 block">Assigned Member</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {task.assignedUser?.name || 'Unassigned'}
                </p>
                {task.assignedUser?.email && (
                  <p className="text-xs text-zinc-500 truncate">
                    {task.assignedUser.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                {task.createdBy?.name
                  ? task.createdBy.name.charAt(0).toUpperCase()
                  : 'A'}
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 block">Created By</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {task.createdBy?.name || 'Unknown'}
                </p>
                <p className="text-xs text-zinc-500 truncate capitalize">
                  {task.createdBy?.role || 'user'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span>
              Created: {formatDate(task.createdAt)}
            </span>
            <span>
              Last Updated: {formatDate(task.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            {canDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(task);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
