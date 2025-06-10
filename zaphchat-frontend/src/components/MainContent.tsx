import React from 'react';
import { PageProps } from '../types';

// Import Page Components
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ScheduledTasksPage from './pages/ScheduledTasksPage';
import UserManagementPage from './pages/UserManagementPage';
import BotManagementPage from './pages/BotManagementPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import GlassCard from './GlassCard'; // Fallback

interface MainContentProps {
  activePageId: string;
}

const MainContent: React.FC<MainContentProps> = ({ activePageId }) => {
  const renderPage = () => {
    const pageMapping: { [key: string]: React.FC<PageProps> } = {
      'dashboard': DashboardPage,
      'analytics': AnalyticsPage,
      'scheduled-tasks': ScheduledTasksPage,
      'user-management': UserManagementPage,
      'bot-management': BotManagementPage,
      'logs': LogsPage,
      'settings': SettingsPage,
    };

    const PageComponent = pageMapping[activePageId];

    if (PageComponent) {
      // PageComponent no longer needs setActivePageTitle
      return <PageComponent />;
    }

    // Fallback or Not Found Page
    return (
      <GlassCard title="Page Not Found" className="m-8">
        <p className="text-slate-300">The page you are looking for does not exist or is under construction.</p>
      </GlassCard>
    );
  };

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent relative">
      {/* Page content is rendered here. Padding is applied here or within individual pages */}
      {renderPage()}
    </main>
  );
};

export default MainContent;