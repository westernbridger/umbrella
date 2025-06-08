import React from 'react';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import { PageProps } from '../../types';
import { BarChart2Icon, Users2Icon, MessageSquareIcon, TrendingUpIcon, SearchIcon } from '../icons';

const ChartPlaceholder: React.FC<{title: string}> = ({title}) => (
    <div className="h-80 bg-slate-700/30 rounded-xl flex items-center justify-center p-4">
        <div className="text-center">
            <BarChart2Icon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">{title}</p>
            <p className="text-sm text-slate-500">Chart data will be displayed here.</p>
        </div>
    </div>
);

const AnalyticsPage: React.FC<PageProps> = () => {
  // useEffect for setActivePageTitle removed

  return (
    <div className="space-y-8">
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-100">Usage Analytics</h2>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <select className="bg-slate-700/80 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>All Time</option>
            </select>
            <PremiumButton variant="secondary" className="text-sm !py-2 !px-4">Export Data</PremiumButton>
          </div>
        </div>
      </GlassCard>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Message Volume Over Time">
          <ChartPlaceholder title="Message Volume Line Chart" />
        </GlassCard>
        <GlassCard title="User Engagement (DAU)">
          <ChartPlaceholder title="Daily Active Users Bar Chart" />
        </GlassCard>
      </div>

      {/* Key Metrics */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="hover:scale-102 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-slate-300">Avg. Messages / User</p>
            <MessageSquareIcon className="w-6 h-6 text-cyan-400"/>
          </div>
          <p className="mt-1 text-3xl font-semibold text-slate-100">25.3</p>
          <p className="mt-1 text-sm text-green-400">+5% this period</p>
        </GlassCard>
         <GlassCard className="hover:scale-102 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-slate-300">Peak Active Time</p>
            <TrendingUpIcon className="w-6 h-6 text-purple-400"/>
          </div>
          <p className="mt-1 text-3xl font-semibold text-slate-100">3:00 PM UTC</p>
          <p className="mt-1 text-sm text-slate-400">Most user activity</p>
        </GlassCard>
        <GlassCard className="hover:scale-102 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-slate-300">New Users This Period</p>
            <Users2Icon className="w-6 h-6 text-blue-400"/>
          </div>
          <p className="mt-1 text-3xl font-semibold text-slate-100">18</p>
           <p className="mt-1 text-sm text-red-400">-10% vs last period</p>
        </GlassCard>
      </div>

      <GlassCard title="Top Performing Prompts / Features">
        <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="Search prompts..."
              className="pl-10 pr-4 py-2.5 w-full rounded-xl bg-slate-800/70 border border-slate-700/80 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-200 placeholder-slate-500 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="text-slate-500" />
            </div>
          </div>
        <ul className="space-y-3 max-h-72 overflow-y-auto">
          {["Weather inquiry", "Schedule meeting", "Joke request", "Translate text", "Summarize article"].map((prompt, i) => (
            <li key={i} className="flex justify-between items-center p-3 bg-slate-700/40 rounded-lg hover:bg-slate-700/60">
              <span className="text-slate-200">{prompt}</span>
              <span className="text-sm text-cyan-400 font-semibold">{Math.floor(Math.random() * 500) + 50} uses</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
};

export default AnalyticsPage;