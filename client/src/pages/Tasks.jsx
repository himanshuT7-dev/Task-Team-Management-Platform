import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, LayoutGrid, Plus } from 'lucide-react';
import { fetchTasks, fetchTaskStats, deleteTask, updateTask, setFilters, setPage } from '../store/taskSlice';
import { setViewMode, showToast } from '../store/uiSlice';
import { useDebounce } from '../hooks/useDebounce';
import TaskFilters from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import KanbanBoard from '../components/KanbanBoard';
import Pagination from '../components/Pagination';

const Tasks = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  const { tasks, filters, pagination, isLoading } = useSelector((state) => state.tasks);
  const { viewMode } = useSelector((state) => state.ui);
  
  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch, debouncedSearch, filters.status, filters.priority, filters.assignedUser, filters.sortBy, filters.sortOrder, filters.page]);

  const handlePageChange = useCallback((page) => {
    dispatch(setPage(page));
  }, [dispatch]);

  const handleViewToggle = useCallback((mode) => {
    dispatch(setViewMode(mode));
  }, [dispatch]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleViewTask = useCallback((task) => {
    setViewingTask(task);
    setIsDetailModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback(async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await dispatch(deleteTask(task._id)).unwrap();
      dispatch(showToast({ message: 'Task deleted successfully', type: 'success' }));
      dispatch(fetchTasks());
      dispatch(fetchTaskStats());
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to delete task', type: 'error' }));
    }
  }, [dispatch]);

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    try {
      const updated = await dispatch(updateTask({ id: taskId, updates: { status: newStatus } })).unwrap();
      setViewingTask(updated);
      dispatch(showToast({ message: `Task status updated to ${newStatus}`, type: 'success' }));
      dispatch(fetchTasks());
      dispatch(fetchTaskStats());
    } catch (err) {
      dispatch(showToast({ message: 'Failed to update status', type: 'error' }));
    }
  }, [dispatch]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage and track your tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
            <button
              onClick={() => handleViewToggle('list')}
              className={`rounded p-1.5 ${viewMode === 'list' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewToggle('kanban')}
              className={`rounded p-1.5 ${viewMode === 'kanban' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
              aria-label="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </div>

      <div className="shrink-0">
        <TaskFilters />
      </div>

      <div className="flex-1 overflow-hidden">
        {isLoading && !tasks.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <LayoutGrid className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">No tasks found</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Get started by creating a new task or adjusting your filters.
            </p>
            <div className="mt-6">
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                New Task
              </button>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex h-full flex-col space-y-4">
            <div className="grid gap-4 overflow-y-auto pb-2 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onView={handleViewTask}
                />
              ))}
            </div>
            <div className="shrink-0 mt-auto pt-4">
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-x-auto pb-4">
            <KanbanBoard onView={handleViewTask} />
          </div>
        )}
      </div>

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={viewingTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
      />
    </div>
  );
};

export default Tasks;
