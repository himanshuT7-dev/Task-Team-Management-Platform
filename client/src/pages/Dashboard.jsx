import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  Loader,
  CheckCircle2,
  ShieldCheck,
  Users,
  AlertOctagon,
  Plus,
  ArrowRight,
  Database,
  Trash2,
  Check,
  UserCheck
} from 'lucide-react';
import { fetchTaskStats, fetchTasks, updateTask, deleteTask } from '../store/taskSlice';
import { showToast } from '../store/uiSlice';
import StatCard from '../components/StatCard';
import DashboardCharts from '../components/DashboardCharts';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isAdmin } = useAuth();
  const { stats, tasks, isLoading } = useSelector((state) => state.tasks);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  const loadData = useCallback(() => {
    dispatch(fetchTaskStats());
    dispatch(fetchTasks({ limit: 50 }));
    if (isAdmin) {
      api.get('/users/workload')
        .then((res) => setTeamMembers(res.data.workload || []))
        .catch(() => {});
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentUserId = user?.id || user?._id;

  const myTasks = useMemo(() => {
    if (!tasks || !currentUserId) return [];
    return tasks.filter(
      (t) => (t.assignedUser?._id || t.assignedUser) === currentUserId
    );
  }, [tasks, currentUserId]);

  const myStats = useMemo(() => {
    const total = myTasks.length;
    const pending = myTasks.filter((t) => t.status === 'pending').length;
    const inProgress = myTasks.filter((t) => t.status === 'in-progress').length;
    const completed = myTasks.filter((t) => t.status === 'completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, inProgress, completed, percent };
  }, [myTasks]);

  const urgentTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(
      (t) => t.priority === 'urgent' && t.status !== 'completed'
    );
  }, [tasks]);

  const handleQuickComplete = async (taskId) => {
    try {
      await dispatch(updateTask({ id: taskId, updates: { status: 'completed' } })).unwrap();
      dispatch(showToast({ message: 'Task marked as completed', type: 'success' }));
      loadData();
    } catch (err) {
      dispatch(showToast({ message: 'Failed to update task', type: 'error' }));
    }
  };

  const handleQuickDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      dispatch(showToast({ message: 'Task deleted successfully', type: 'success' }));
      loadData();
    } catch (err) {
      dispatch(showToast({ message: 'Failed to delete task', type: 'error' }));
    }
  };

  const handleOpenDetail = (task) => {
    setViewingTask(task);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleStatusChangeFromDetail = async (taskId, newStatus) => {
    try {
      const updated = await dispatch(updateTask({ id: taskId, updates: { status: newStatus } })).unwrap();
      setViewingTask(updated);
      dispatch(showToast({ message: `Task status updated to ${newStatus}`, type: 'success' }));
      loadData();
    } catch (err) {
      dispatch(showToast({ message: 'Failed to update status', type: 'error' }));
    }
  };

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <div className="p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Admin Command Center
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
                System Administrator
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Full workspace authority active. You can create, reassign, complete, or remove any organization task, manage team rosters, and inspect database health.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
            <Link
              to="/team"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-sm"
            >
              <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Team Admin</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                <UserCheck className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Personal Workspace
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Welcome back, {user?.name}. Here is your individual task completion overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                My Completion Rate
              </span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {myStats.percent}%
              </p>
            </div>
            <div className="w-20 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${myStats.percent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isAdmin ? "Total Company Tasks" : "My Assigned Tasks"}
          value={isAdmin ? (stats?.total || 0) : myStats.total}
          icon={ClipboardList}
          tone="default"
        />
        <StatCard
          title={isAdmin ? "Total Pending" : "My Pending Tasks"}
          value={isAdmin ? (stats?.pending || 0) : myStats.pending}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          title={isAdmin ? "Total In Progress" : "My In Progress Tasks"}
          value={isAdmin ? (stats?.inProgress || 0) : myStats.inProgress}
          icon={Loader}
          tone="blue"
        />
        <StatCard
          title={isAdmin ? "Total Completed" : "My Completed Tasks"}
          value={isAdmin ? (stats?.completed || 0) : myStats.completed}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      <div className="mt-8">
        <DashboardCharts stats={stats} />
      </div>

      {isAdmin && urgentTasks.length > 0 && (
        <div className="mt-8 p-5 bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <AlertOctagon className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Admin Escalations: Urgent Tasks ({urgentTasks.length})
                </h2>
                <p className="text-xs text-zinc-500">
                  Tasks requiring immediate supervisory attention or reassignment
                </p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold">
              Action Required
            </span>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {urgentTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => handleOpenDetail(task)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 px-2 rounded-md transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400">
                      {task.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
                      Urgent
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Assigned to: <span className="font-medium text-zinc-700 dark:text-zinc-300">{task.assignedUser?.name || 'Unassigned'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickComplete(task._id);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950 transition-colors border border-emerald-200 dark:border-emerald-800"
                    title="Mark task completed immediately"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Quick Complete</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickDelete(task._id);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Admin Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && teamMembers.length > 0 && (
        <div className="mt-8 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Team Workload & Distribution (Admin View)
              </h2>
            </div>
            <Link
              to="/team"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Roster</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamMembers.map((member) => {
              const total = member.tasks?.total || 0;
              const completed = member.tasks?.completed || 0;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={member.id}
                  className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {member.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      {member.role}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{completed} of {total} done</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{percent}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>MongoDB Atlas Shard Cluster: <strong>Connected & Active</strong></span>
          </div>
          <span>Storage: <strong>MongoDB Cloud Replica</strong></span>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            {isAdmin ? "Recent Global Activity" : "My Assigned Tasks"}
          </h2>
          <Link
            to="/tasks"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && !tasks.length ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
            ))
          ) : (isAdmin ? tasks : myTasks).length > 0 ? (
            (isAdmin ? tasks : myTasks).slice(0, 6).map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onView={handleOpenDetail}
                onEdit={handleEditFromDetail}
                onDelete={(t) => handleQuickDelete(t._id)}
              />
            ))
          ) : (
            <p className="col-span-full text-zinc-500 dark:text-zinc-400 text-sm">
              {isAdmin ? "No tasks found in organization." : "No tasks currently assigned to you."}
            </p>
          )}
        </div>
      </div>

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={viewingTask}
        onEdit={handleEditFromDetail}
        onDelete={(t) => handleQuickDelete(t._id)}
        onStatusChange={handleStatusChangeFromDetail}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
      />
    </div>
  );
};

export default Dashboard;
