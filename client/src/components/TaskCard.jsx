import React, { memo } from 'react';
import { Eye, Pencil, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { statusConfig, priorityConfig, formatDate, getDaysRemaining } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

const TaskCard = memo(({ task, onEdit, onDelete, onView }) => {
  const { user, isAdmin } = useAuth();
  const daysRemaining = getDaysRemaining(task.dueDate);
  const isOverdue = daysRemaining < 0 && task.status !== 'completed';
  const sConf = statusConfig[task.status] || statusConfig.pending;
  const pConf = priorityConfig[task.priority] || priorityConfig.medium;
  
  const assignedName = task.assignedUser?.name || 'Unassigned';
  const initial = assignedName.charAt(0).toUpperCase();

  const taskCreatorId = task.createdBy?._id || task.createdBy;
  const currentUserId = user?.id || user?._id;
  const canDelete = isAdmin;

  const handleCardClick = () => {
    if (onView) {
      onView(task);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer"
    >
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(task);
            }}
            className="p-1.5 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        {onEdit && isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 text-zinc-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
            title="Edit Task"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {onDelete && canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Delete Task (Admin)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="pr-24">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 truncate">
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${sConf.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`}></span>
            {sConf.label}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${pConf.badge}`}>
            {pConf.label}
          </span>
          {task.createdBy?.role === 'admin' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
              <ShieldCheck className="w-3 h-3" /> Admin Task
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
            {initial}
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[100px]">
            {assignedName}
          </span>
        </div>
        
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-zinc-500 dark:text-zinc-400'}`}>
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;
