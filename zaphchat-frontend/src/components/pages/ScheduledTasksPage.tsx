import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import { PageProps } from '../../types';
import { CalendarClockIcon, SearchIcon, ChevronDownIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PlusCircleIcon } from '../icons';

interface Task {
  id: string;
  name: string;
  schedule: string;
  status: 'upcoming' | 'completed' | 'failed';
  nextRun: string;
  lastRun?: string;
}

const initialTasks: Task[] = [
  { id: '1', name: 'Daily Standup Reminder', schedule: '0 9 * * 1-5', status: 'upcoming', nextRun: 'Tomorrow, 09:00 AM', lastRun: 'Today, 09:00 AM' },
  { id: '2', name: 'Weekly Report Generation', schedule: '0 17 * * 5', status: 'completed', nextRun: 'Next Fri, 05:00 PM', lastRun: 'Last Fri, 05:00 PM' },
  { id: '3', name: 'Backup Routine', schedule: '0 2 * * *', status: 'failed', nextRun: 'Tomorrow, 02:00 AM', lastRun: 'Today, 02:00 AM (Failed)' },
  { id: '4', name: 'Birthday Wishes - Team', schedule: 'Custom Logic', status: 'upcoming', nextRun: 'Varies', lastRun: 'N/A' },
  { id: '5', name: 'Clean Temp Files', schedule: '0 0 1 * *', status: 'upcoming', nextRun: '1st of Next Month, 12:00 AM' },
];

const StatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
  let bgColor = '';
  let textColor = 'text-slate-900';
  let Icon = ClockIcon;

  switch (status) {
    case 'upcoming':
      bgColor = 'bg-blue-400/80'; Icon = ClockIcon; textColor = 'text-blue-900';
      break;
    case 'completed':
      bgColor = 'bg-green-500/80'; Icon = CheckCircleIcon; textColor = 'text-green-900';
      break;
    case 'failed':
      bgColor = 'bg-red-500/80'; Icon = XCircleIcon; textColor = 'text-red-900';
      break;
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} backdrop-blur-sm`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};


const ScheduledTasksPage: React.FC<PageProps> = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Task['status']>('all');

  // useEffect for setActivePageTitle removed

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center">
            <CalendarClockIcon className="w-8 h-8 mr-3 text-cyan-400" />
            Scheduled Tasks
          </h2>
          <PremiumButton 
            className="mt-4 md:mt-0"
            icon={<PlusCircleIcon className="w-5 h-5"/>}
          >
            Add New Task
          </PremiumButton>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search tasks by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full rounded-lg bg-slate-700/60 border border-slate-600/80 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-200 placeholder-slate-400 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="text-slate-400" />
            </div>
          </div>
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="appearance-none w-full md:w-auto bg-slate-700/60 border border-slate-600/80 text-slate-200 rounded-lg px-4 py-2.5 pr-8 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
          </div>
        </div>
      </GlassCard>
      
      <GlassCard bodyClassName="!p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-800/40">
              <tr>
                {['Task Name', 'Schedule (Cron/Interval)', 'Status', 'Next Run', 'Last Run', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-800/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{task.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">{task.schedule}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={task.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{task.nextRun}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{task.lastRun || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <PremiumButton variant="secondary" className="!text-xs !px-3 !py-1">Edit</PremiumButton>
                    <button className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
         {filteredTasks.length > 0 && (
          <div className="p-4 border-t border-slate-700/50 text-sm text-slate-400">
            Showing {filteredTasks.length} of {tasks.length} tasks.
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ScheduledTasksPage;