import React, { useMemo, memo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardCharts = memo(({ stats }) => {
  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Pending', value: stats.pending || 0, color: '#f59e0b' },
      { name: 'In Progress', value: stats.inProgress || 0, color: '#3b82f6' },
      { name: 'Completed', value: stats.completed || 0, color: '#10b981' }
    ];
  }, [stats]);

  const priorityData = useMemo(() => {
    if (!stats) return [];
    const priorities = stats.priorities || {};
    return [
      { name: 'Low', value: priorities.low ?? stats.low ?? 0, color: '#a1a1aa' },
      { name: 'Medium', value: priorities.medium ?? stats.medium ?? 0, color: '#38bdf8' },
      { name: 'High', value: priorities.high ?? stats.high ?? 0, color: '#f97316' },
      { name: 'Urgent', value: priorities.urgent ?? stats.urgent ?? 0, color: '#ef4444' }
    ];
  }, [stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Task Status Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {statusData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Priority Breakdown</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#27272a', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

DashboardCharts.displayName = 'DashboardCharts';
export default DashboardCharts;
