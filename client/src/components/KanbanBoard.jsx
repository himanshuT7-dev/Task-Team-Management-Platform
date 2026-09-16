import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateTask, optimisticStatusUpdate } from '../store/taskSlice';
import { showToast } from '../store/uiSlice';
import { statusConfig, priorityConfig, formatDate } from '../utils/formatters';

const KanbanCard = ({ task, onView }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task._id);
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
  };

  const pConf = priorityConfig[task.priority] || priorityConfig.medium;
  const assignedName = task.assignedUser?.name || 'Unassigned';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onView && onView(task)}
      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 mb-3 cursor-pointer active:cursor-grabbing shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
          {task.title}
        </h4>
        <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${pConf.badge}`}>
          {pConf.label}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="truncate max-w-[120px]">{assignedName}</div>
        <div>{formatDate(task.dueDate)}</div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ status, title, tasks, onView }) => {
  const dispatch = useDispatch();
  const sConf = statusConfig[status] || statusConfig.pending;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    dispatch(optimisticStatusUpdate({ id: taskId, newStatus: status }));
    
    try {
      await dispatch(updateTask({ id: taskId, updates: { status } })).unwrap();
      dispatch(showToast({ message: 'Task status updated', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to update status', type: 'error' }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 min-h-[500px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${sConf.dot}`} />
          <h3 className="font-semibold text-zinc-700 dark:text-zinc-200">{title}</h3>
        </div>
        <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs py-0.5 px-2 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-1 overflow-y-auto min-h-[100px]"
      >
        {tasks.map(task => (
          <KanbanCard key={task._id} task={task} onView={onView} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard = ({ onView }) => {
  const tasks = useSelector(state => state.tasks.tasks);

  const groupedTasks = useMemo(() => {
    return {
      pending: tasks.filter(t => t.status === 'pending'),
      inProgress: tasks.filter(t => t.status === 'in-progress'),
      completed: tasks.filter(t => t.status === 'completed')
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full">
      <KanbanColumn status="pending" title="Pending" tasks={groupedTasks.pending} onView={onView} />
      <KanbanColumn status="in-progress" title="In Progress" tasks={groupedTasks.inProgress} onView={onView} />
      <KanbanColumn status="completed" title="Completed" tasks={groupedTasks.completed} onView={onView} />
    </div>
  );
};

export default KanbanBoard;
