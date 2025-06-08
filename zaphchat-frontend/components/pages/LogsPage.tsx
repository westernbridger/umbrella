import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import { PageProps } from '../../types';
import { FileTextIcon, SearchIcon, ChevronDownIcon, DownloadIcon, InfoIcon, AlertTriangleIcon, XCircleIcon, MessageCircleIcon } from '../icons';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
}

const initialLogs: LogEntry[] = [
  { id: '1', timestamp: '2024-07-28 10:05:15 UTC', level: 'INFO', source: 'BotEngine', message: 'User "Alice" initiated new chat session.' },
  { id: '2', timestamp: '2024-07-28 10:05:45 UTC', level: 'DEBUG', source: 'APIHandler', message: 'Received command: /weather New York' },
  { id: '3', timestamp: '2024-07-28 10:06:02 UTC', level: 'WARN', source: 'Scheduler', message: 'Task "DailyReport" delayed by 5s due to high load.' },
  { id: '4', timestamp: '2024-07-28 10:07:30 UTC', level: 'ERROR', source: 'PaymentGateway', message: 'Failed to process payment for user "Bob". Error: Insufficient funds.' },
  { id: '5', timestamp: '2024-07-28 10:08:00 UTC', level: 'INFO', source: 'UserAuth', message: 'User "Charlie" logged in successfully.' },
  { id: '6', timestamp: '2024-07-28 10:09:12 UTC', level: 'DEBUG', source: 'BotEngine', message: 'Generating response for: "Tell me a joke".' },
];

const LogLevelBadge: React.FC<{ level: LogLevel }> = ({ level }) => {
  let colors = '';
  let Icon = InfoIcon;

  switch (level) {
    case 'INFO': colors = 'bg-blue-500/80 text-blue-900'; Icon = InfoIcon; break;
    case 'WARN': colors = 'bg-yellow-500/80 text-yellow-900'; Icon = AlertTriangleIcon; break;
    case 'ERROR': colors = 'bg-red-500/80 text-red-900'; Icon = XCircleIcon; break;
    case 'DEBUG': colors = 'bg-slate-500/80 text-slate-900'; Icon = MessageCircleIcon; break; // Or a specific debug icon
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors} backdrop-blur-sm`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {level}
    </span>
  );
};


const LogsPage: React.FC<PageProps> = () => {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | LogLevel>('all');
  const [filterSource, setFilterSource] = useState('all'); // Can be expanded with dynamic sources

  // useEffect for setActivePageTitle removed
  
  const uniqueSources = ['all', ...Array.from(new Set(logs.map(log => log.source)))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSource = filterSource === 'all' || log.source === filterSource;
    return matchesSearch && matchesLevel && matchesSource;
  }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by newest first

  return (
    <div className="space-y-8">
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center">
            <FileTextIcon className="w-8 h-8 mr-3 text-cyan-400" />
            System Logs
          </h2>
          <PremiumButton 
            className="mt-4 md:mt-0"
            icon={<DownloadIcon className="w-5 h-5"/>}
          >
            Export Logs (JSON)
          </PremiumButton>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
          <div className="relative md:col-span-1">
            <input 
              type="text" 
              placeholder="Search logs..."
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
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              className="appearance-none w-full bg-slate-700/60 border border-slate-600/80 text-slate-200 rounded-lg px-4 py-2.5 pr-8 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
            >
              <option value="all">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
             <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
          </div>
          <div className="relative">
             <select 
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="appearance-none w-full bg-slate-700/60 border border-slate-600/80 text-slate-200 rounded-lg px-4 py-2.5 pr-8 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
            >
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source === 'all' ? 'All Sources' : source}</option>
              ))}
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
          </div>
          {/* Date Range Picker Placeholder */}
        </div>
      </GlassCard>

      <GlassCard bodyClassName="!p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-800/40">
              <tr>
                {['Timestamp', 'Level', 'Source', 'Message'].map(header => (
                  <th key={header} scope="col" className={`px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider ${header === 'Message' ? 'w-1/2' : ''}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><LogLevelBadge level={log.level} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{log.source}</td>
                  <td className="px-6 py-4 text-sm text-slate-200"><pre className="whitespace-pre-wrap font-sans break-all">{log.message}</pre></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredLogs.length > 0 && (
            <div className="p-4 border-t border-slate-700/50 text-sm text-slate-400">
                Showing {filteredLogs.length} of {logs.length} log entries.
            </div>
        )}
      </GlassCard>
    </div>
  );
};

export default LogsPage;