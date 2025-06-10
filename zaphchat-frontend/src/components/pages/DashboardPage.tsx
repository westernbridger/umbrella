
import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../../api';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import {
  PageProps,
  Layouts,
  Layout,
  ActivityItem,
  Bot,
  MessageStatsResponse,
  ActiveUsersResponse,
  ScheduledTask,
  ServerStatusResponse,
} from '../../types';
import { MessageSquareIcon, UsersIcon, SettingsIcon, CheckCircleIcon, AlertTriangleIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon, RobotIcon } from '../icons'; // Removed ServerIcon as it's no longer used here
import { io } from 'socket.io-client';
import BotManager from '../BotManager';
import BroadcastModal from '../BroadcastModal';
import WeatherDateTimeWidget from '../WeatherDateTimeWidget';
import { useAuth } from '../../AuthContext';
import { useToast } from '../ToastProvider';
// Conceptually import react-grid-layout. In a real project: npm install react-grid-layout @types/react-grid-layout
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

const StatCard: React.FC<{ title: string; value: string; trend?: string; trendType?: 'positive' | 'negative'; icon: React.ReactNode; footer?: string }> = ({ title, value, trend, trendType, icon, footer }) => (
  <GlassCard className="hover:scale-102 transition-transform duration-300 h-full flex flex-col"> {/* Ensure card takes full height of grid item */}
    <div className="flex items-center justify-between mb-2">
      <p className="text-base font-medium text-slate-300">{title}</p>
      <div className="text-cyan-400">{icon}</div>
    </div>
    <p className="text-3xl font-semibold text-slate-100">{value}</p>
    {trend && (
      <p className={`mt-1 text-sm ${trendType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
        {trend}
      </p>
    )}
    {footer && <p className="mt-auto pt-2 text-xs text-slate-500">{footer}</p>} {/* Pushes footer to bottom if card flex col */}
  </GlassCard>
);

const DASHBOARD_LAYOUT_KEY = 'zaphChatDashboardLayouts_v1';

// Adjusted initialLayouts after removing Server Status card
const initialLayouts: Layouts = {
  lg: [ // 12 columns, rowHeight 80px
    { i: 'welcome', x: 0, y: 0, w: 12, h: 2, isResizable: false, isDraggable: true },
    { i: 'statMessageVolume', x: 0, y: 2, w: 4, h: 2, isResizable: false, isDraggable: true },
    { i: 'statActiveUsers', x: 4, y: 2, w: 4, h: 2, isResizable: false, isDraggable: true },
    { i: 'statScheduledTasks', x: 8, y: 2, w: 4, h: 2, isResizable: false, isDraggable: true },
    { i: 'recentActivity', x: 0, y: 4, w: 7, h: 5, isResizable: false, isDraggable: true }, // No longer resizable
    { i: 'deployedBots', x: 7, y: 4, w: 5, h: 3, isResizable: false, isDraggable: true },
    { i: 'quickActions', x: 7, y: 7, w: 5, h: 2, isResizable: false, isDraggable: true },
  ],
  md: [ // 10 columns, rowHeight 80px
    { i: 'welcome', x: 0, y: 0, w: 10, h: 2, isResizable: false, isDraggable: true },
    { i: 'statMessageVolume', x: 0, y: 2, w: 10, h: 2, isResizable: false, isDraggable: true }, // Full width for first
    { i: 'statActiveUsers', x: 0, y: 4, w: 5, h: 2, isResizable: false, isDraggable: true },
    { i: 'statScheduledTasks', x: 5, y: 4, w: 5, h: 2, isResizable: false, isDraggable: true },
    { i: 'recentActivity', x: 0, y: 6, w: 10, h: 5, isResizable: false, isDraggable: true }, // No longer resizable
    { i: 'deployedBots', x: 0, y: 11, w: 5, h: 4, isResizable: false, isDraggable: true },
    { i: 'quickActions', x: 5, y: 11, w: 5, h: 4, isResizable: false, isDraggable: true },
  ],
  sm: [ // 6 columns, rowHeight 80px
    { i: 'welcome', x: 0, y: 0, w: 6, h: 2, isResizable: false, isDraggable: true },
    { i: 'statMessageVolume', x: 0, y: 2, w: 3, h: 2, isResizable: false, isDraggable: true },
    { i: 'statActiveUsers', x: 3, y: 2, w: 3, h: 2, isResizable: false, isDraggable: true },
    { i: 'statScheduledTasks', x: 0, y: 4, w: 6, h: 2, isResizable: false, isDraggable: true }, // Full width
    { i: 'recentActivity', x: 0, y: 6, w: 6, h: 5, isResizable: false, isDraggable: true }, // No longer resizable
    { i: 'deployedBots', x: 0, y: 11, w: 6, h: 4, isResizable: false, isDraggable: true },
    { i: 'quickActions', x: 0, y: 15, w: 6, h: 3, isResizable: false, isDraggable: true },
  ],
};


// Data loaded from API

const DeployedBotStatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  let color = 'bg-slate-500'; 
  let textColor = 'text-slate-100';
  if (status === 'Online') { color = 'bg-green-500/30 border border-green-500'; textColor = 'text-green-300';}
  else if (status === 'Offline') { color = 'bg-red-500/30 border border-red-500'; textColor = 'text-red-300';}
  else { color = 'bg-yellow-500/30 border border-yellow-500'; textColor = 'text-yellow-300';} 

  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color} ${textColor}`}>{status}</span>;
};


const DashboardPage: React.FC<PageProps> = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [layouts, setLayouts] = useState<Layouts>(() => {
    try {
      const savedLayouts = localStorage.getItem(DASHBOARD_LAYOUT_KEY);
      if (savedLayouts) {
        const parsedLayouts = JSON.parse(savedLayouts);
        // Ensure all keys from initialLayouts are present, in case of new cards
        const mergedLayouts: Layouts = {};
        Object.keys(initialLayouts).forEach(bp => {
          mergedLayouts[bp] = initialLayouts[bp].map(initialItem => {
            const savedItem = parsedLayouts[bp]?.find((item: Layout) => item.i === initialItem.i);
            // Ensure isResizable and isDraggable from initialLayouts are respected (especially isResizable: false for all)
            return savedItem ? { ...initialItem, ...savedItem, isResizable: initialItem.isResizable, isDraggable: initialItem.isDraggable } : initialItem;
          });
        });
        return mergedLayouts;
      }
    } catch (error) {
      console.error("Error loading layouts from localStorage:", error);
    }
    return initialLayouts;
  });
  const [isActivityExpanded, setIsActivityExpanded] = useState(true);
  const [messageVolume, setMessageVolume] = useState<number | null>(null);
  const [activeUserCount, setActiveUserCount] = useState<number | null>(null);
  const [scheduledTaskCount, setScheduledTaskCount] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [deployedBots, setDeployedBots] = useState<Bot[]>([]);
  const [showBotManager, setShowBotManager] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openBotManager = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBotManager(true);
  };

  const openBroadcast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBroadcast(true);
  };

  const navigate = useNavigate();

  const handleStart = async (bot: Bot) => {
    try {
      await api.startBot(bot._id!);
      setDeployedBots(prev => prev.map(b => b._id === bot._id ? { ...b, status: 'online' } : b));
    } catch {
      addToast('Start failed');
    }
  };

  const handleStop = async (bot: Bot) => {
    try {
      await api.stopBot(bot._id!);
      setDeployedBots(prev => prev.map(b => b._id === bot._id ? { ...b, status: 'paused' } : b));
    } catch {
      addToast('Stop failed');
    }
  };

  const handleRestart = async (bot: Bot) => {
    try {
      await api.restartBot(bot._id!);
      setDeployedBots(prev => prev.map(b => b._id === bot._id ? { ...b, status: 'online' } : b));
    } catch {
      addToast('Restart failed');
    }
  };

  const onLayoutChange = (_layout: Layout[], allLayouts: Layouts) => {
    // Before saving, ensure isResizable is correctly set from initialLayouts definition
    // This is important if react-grid-layout tries to infer it.
    const layoutsToSave: Layouts = {};
    Object.keys(allLayouts).forEach(bp => {
        layoutsToSave[bp] = allLayouts[bp].map(layoutItem => {
            const initialItemDef = initialLayouts[bp]?.find(initItem => initItem.i === layoutItem.i);
            return {
                ...layoutItem,
                isResizable: initialItemDef ? initialItemDef.isResizable : false, // Default to false if not found
                isDraggable: initialItemDef ? initialItemDef.isDraggable : true, // Default to true
            };
        });
    });

    setLayouts(layoutsToSave); 
    try {
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(layoutsToSave));
    } catch (error) {
      console.error("Error saving layouts to localStorage:", error);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [msg, users, tasks, activity, bots, status]: [
          MessageStatsResponse,
          ActiveUsersResponse,
          ScheduledTask[],
          ActivityItem[],
          Bot[],
          ServerStatusResponse,
        ] = await Promise.all([
          api.getMessageStats().catch(() => ({ count: 0 })),
          api.getActiveUsers().catch(() => ({ count: 0 })),
          api.getSchedulerTasks().catch(() => []),
          api.getRecentActivity().catch(() => []),
          api.getBots().catch(() => []),
        ]);
        setMessageVolume(msg.count);
        setActiveUserCount(users.count);
        setScheduledTaskCount(tasks.length);
        setRecentActivity(activity);
        setDeployedBots(bots);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const socket = io(API_BASE_URL.replace('/api', ''));
    socket.on('botStatus', data => {
      setDeployedBots(prev => prev.map(b => b._id === data.id ? { ...b, status: data.status } : b));
    });
    socket.on('activity', (ev: any) => {
      setRecentActivity(prev => [ev, ...prev.slice(0, 49)]);
    });
    return () => { socket.close(); };
  }, []);


  const activityItemsToShow = isActivityExpanded ? recentActivity : recentActivity.slice(0, 3);

  if (loading) {
    return <GlassCard className="m-4"><p className="text-slate-300">Loading...</p></GlassCard>;
  }

  if (error) {
    return <GlassCard className="m-4"><p className="text-red-400">{error}</p></GlassCard>;
  }

  return (
    <>
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={80}
      onLayoutChange={onLayoutChange}
      draggableCancel=".no-drag,button"
      // isDraggable is now controlled per item in the layout definition
    >
      <div key="welcome">
        <GlassCard 
            className="bg-gradient-to-r from-slate-800/70 to-slate-800/50 !border-cyan-600/30 h-full flex flex-col"
            bodyClassName="flex-grow flex flex-col"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100">
                      {user?.displayName ? `Welcome back, ${user.displayName}!` : 'Welcome back!'}
                    </h2>
                    <p className="text-base text-slate-400 mt-1">
                        Here's your personalized overview and current conditions.
                    </p>
                </div>
            </div>
            <div className="mt-auto"> 
                 <WeatherDateTimeWidget />
            </div>
        </GlassCard>
      </div>

      {/* Server Status card removed */}
      <div key="statMessageVolume">
        <StatCard
          title="Message Volume (Today)"
          value={messageVolume !== null ? messageVolume.toString() : '...'}
          icon={<MessageSquareIcon className="w-6 h-6" />}
        />
      </div>
      <div key="statActiveUsers">
        <StatCard
          title="Active Users (24h)"
          value={activeUserCount !== null ? activeUserCount.toString() : '...'}
          icon={<UsersIcon className="w-6 h-6" />}
        />
      </div>
      <div key="statScheduledTasks">
        <StatCard
          title="Scheduled Tasks"
          value={scheduledTaskCount !== null ? `${scheduledTaskCount} Upcoming` : '...'}
          icon={<ClockIcon className="w-6 h-6" />}
        />
      </div>

      <div key="recentActivity">
        <GlassCard 
          title="Recent Activity" 
          className="h-full flex flex-col" 
          titleClassName="flex justify-between items-center" 
          bodyClassName="flex-grow overflow-hidden flex flex-col"
        >
          <button 
            onClick={() => setIsActivityExpanded(!isActivityExpanded)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
            aria-label={isActivityExpanded ? "Collapse activity" : "Expand activity"}
          >
            {isActivityExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </button>
          <div 
            className={`flex-grow overflow-y-auto transition-all duration-500 ease-in-out ${isActivityExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            style={{ scrollbarGutter: 'stable' }} 
          >
            <ul className="space-y-3 pt-2">
              {activityItemsToShow.map((activity, i) => (
                <li key={i} className="flex items-center p-3 bg-slate-700/40 rounded-xl hover:bg-slate-700/60 transition-colors duration-200">
                  <img src={`https://picsum.photos/seed/${activity.avatarSeed}/40/40`} alt="User" className="w-10 h-10 rounded-full mr-4 border-2 border-purple-500/60" />
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium">
                      {typeof activity.user === 'object' ? (activity.user.displayName || activity.user.email) : activity.user}:
                      <span className="text-slate-300 font-normal">{activity.action}</span>
                    </p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                  {activity.status === 'error' && <AlertTriangleIcon className="w-5 h-5 text-red-500 ml-2" />}
                  {activity.status === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500 ml-2" />}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </div>

      <div key="deployedBots">
        <GlassCard title="Deployed Bots" className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                {deployedBots.map(bot => (
                    <div key={bot._id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-xl hover:bg-slate-700/60">
                        <div className="flex items-center min-w-0">
                            <RobotIcon className="w-7 h-7 mr-3 text-cyan-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-slate-100 font-medium truncate">{bot.botName}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <DeployedBotStatusIndicator status={bot.status} />
                            <button onClick={() => handleStart(bot)} className="text-green-400 hover:text-green-300">Start</button>
                            <button onClick={() => handleStop(bot)} className="text-red-400 hover:text-red-300">Stop</button>
                            <button onClick={() => handleRestart(bot)} className="text-yellow-400 hover:text-yellow-300">Restart</button>
                            <button onClick={() => navigate('/bot-management')} className="text-slate-300 hover:text-slate-100"><SettingsIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
                {deployedBots.length === 0 && <p className="text-slate-400 text-center py-4">No bots deployed yet.</p>}
            </div>
        </GlassCard>
      </div>

      
      <div key="quickActions">
        <GlassCard title="Quick Actions" className="h-full flex flex-col">
            <div className="flex-grow">
              <p className="text-slate-300 mb-4">Manage your bot settings or start a new interaction.</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-auto">
                <PremiumButton
                    onClick={openBotManager}
                    icon={<SettingsIcon className="w-5 h-5 mr-2"/>}
                    className="no-drag flex-1 w-full min-w-[8rem] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:ring-purple-500/50 hover:shadow-[0_0_20px_0px_rgba(168,85,247,0.5)]"
                >
                    <span className="truncate">Manage Bot</span>
                </PremiumButton>
                <PremiumButton variant="secondary" className="no-drag flex-1 w-full min-w-[8rem]" onClick={openBroadcast}>
                    <span className="truncate">New Broadcast</span>
                </PremiumButton>
            </div>
        </GlassCard>
      </div>
    </ResponsiveGridLayout>
    {showBotManager && <BotManager onClose={() => setShowBotManager(false)} />}
    {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} />}
    </>
  );
};

export default DashboardPage;
