import React, { memo } from 'react';

export const StatCard = memo(({ title, value, icon: Icon, tone = 'default' }) => {
  const toneClasses = {
    default: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800',
    amber: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    blue: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    emerald: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
          {title}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
      </div>

      <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${toneClasses[tone] || toneClasses.default}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
