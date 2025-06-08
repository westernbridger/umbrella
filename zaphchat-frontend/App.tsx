
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import { useToast } from './components/ToastProvider';
import { useAuth } from './AuthContext';
import { NavItemConfig } from './types';
import { LayoutDashboardIcon, BarChart2Icon, CalendarClockIcon, Users2Icon, RobotIcon, FileTextIcon, SettingsIcon as GeneralSettingsIcon } from './components/icons'; // Renamed SettingsIcon to avoid conflict

const navigationConfig: NavItemConfig[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboardIcon },
  { id: 'analytics', name: 'Analytics', icon: BarChart2Icon },
  { id: 'scheduled-tasks', name: 'Scheduled Tasks', icon: CalendarClockIcon },
  { id: 'user-management', name: 'User Management', icon: Users2Icon, sectionTitle: 'MANAGEMENT' },
  { id: 'bot-management', name: 'Bot Management', icon: RobotIcon },
  { id: 'logs', name: 'Logs', icon: FileTextIcon },
  { id: 'settings', name: 'Settings', icon: GeneralSettingsIcon },
];

const LG_BREAKPOINT = '(min-width: 1024px)';
export type ServerStatusType = 'operational' | 'rebooting' | 'down';

const App: React.FC = () => {
  const { token, logout } = useAuth();
  const { addToast } = useToast();
  const [showRegister, setShowRegister] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.matchMedia(LG_BREAKPOINT).matches);
  const [activePageId, setActivePageId] = useState<string>(navigationConfig[0].id);
  const [pageTitle, setPageTitle] = useState<string>(navigationConfig[0].name);
  const [serverStatus, setServerStatus] = useState<ServerStatusType>('operational');

  useEffect(() => {
    const mediaQuery = window.matchMedia(LG_BREAKPOINT);
    
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsSidebarOpen(event.matches);
    };
  
    mediaQuery.addEventListener('change', handleMediaQueryChange);
  
    // Mock server status cycling
    const statuses: ServerStatusType[] = ['operational', 'rebooting', 'down'];
    let currentStatusIndex = 0;
    const statusInterval = setInterval(() => {
      currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
      setServerStatus(statuses[currentStatusIndex]);
    }, 15000); // Change status every 15 seconds for demo

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
      clearInterval(statusInterval);
    };
  }, []); 
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavChange = (itemId: string) => {
    const selectedNavItem = navigationConfig.find(item => item.id === itemId);
    if (selectedNavItem) {
      setActivePageId(selectedNavItem.id);
      setPageTitle(selectedNavItem.name);
      if (isSidebarOpen && !window.matchMedia(LG_BREAKPOINT).matches) { // Close only if manually opened on small screens
        setIsSidebarOpen(false);
      }
    }
  };
  
   useEffect(() => {
    const currentNavItem = navigationConfig.find(item => item.id === activePageId);
    if (currentNavItem) {
      setPageTitle(currentNavItem.name);
    } else if (navigationConfig.length > 0) { 
      setActivePageId(navigationConfig[0].id);
      setPageTitle(navigationConfig[0].name);
    }
  }, [activePageId]);

  if (!token) {
    if (showRegister) {
      return (
        <RegisterPage
          onShowLogin={() => setShowRegister(false)}
          onRegistered={(name) => {
            addToast(`Welcome to ZaphChat, ${name}!`);
            setShowRegister(false);
          }}
        />
      );
    }
    return <LoginPage onShowRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="relative h-screen flex flex-col bg-slate-900 overflow-hidden">
      <AnimatedBackground />
      <Header
        appName="ZaphChat"
        pageTitle={pageTitle}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        serverStatus={serverStatus}
        onLogout={logout}
      />
      <div className="flex flex-1 overflow-hidden relative"> {/* Added relative for absolute positioning of Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen}
          navigationItems={navigationConfig}
          activeItemId={activePageId}
          onNavigate={handleNavChange}
        />
        <MainContent 
          activePageId={activePageId}
        />
      </div>
    </div>
  );
};

export default App;