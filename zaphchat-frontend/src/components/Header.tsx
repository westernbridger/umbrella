
import React, { useState } from 'react';
import { MenuIcon, XIcon, BellIcon, ChevronDownIcon } from './icons';
import ServerStatusIcon from './ServerStatusIcon';
import AccountSettings from './AccountSettings';
import { useAuth } from '../AuthContext';

interface HeaderProps {
  appName: string;
  pageTitle: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ appName, pageTitle, isSidebarOpen, toggleSidebar, onLogout }) => {
  const { user } = useAuth();
  const [showAccount, setShowAccount] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
      {/* Left Section: Toggle & App Name/Logo */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="p-2 rounded-md text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 transition-colors duration-200 mr-2 md:mr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {isSidebarOpen ? <XIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
        </button>
        <div className="flex items-center">
          <ServerStatusIcon />
           <img src="https://picsum.photos/seed/zaphlogo/32/32" alt="ZaphChat Logo" className="h-8 w-8 rounded-md mr-3 hidden sm:block" />
          <span className="text-2xl font-bold text-slate-100 tracking-tight hidden md:block">{appName}</span>
        </div>
      </div>

      {/* Center Section: Page Title */}
      <div className="flex-1 text-center hidden md:block">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-200 truncate px-4">{pageTitle}</h1>
      </div>
       <div className="flex-1 text-left sm:text-center md:hidden"> {/* Mobile Page Title */}
        <h1 className="text-xl font-semibold text-slate-200 truncate pl-2">{pageTitle}</h1>
      </div>


      {/* Right Section: Notifications & User Profile */}
      <div className="flex items-center space-x-3 md:space-x-5">
        <button
          aria-label="Notifications"
          className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
        >
          <BellIcon className="w-6 h-6" />
          {/* Optional: Notification badge */}
          {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-800" /> */}
        </button>

        <div className="relative">
          <button onClick={() => setShowAccount(true)} className="flex items-center space-x-2 p-1 pr-2 rounded-full hover:bg-slate-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
            <img
              className="h-9 w-9 rounded-full border-2 border-slate-600"
              src="https://picsum.photos/seed/user/100/100"
              alt="User Avatar"
            />
            <span className="text-sm font-medium text-slate-200 hidden lg:block">{user?.displayName}</span>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 hidden lg:block" />
          </button>
          {showAccount && <AccountSettings onClose={() => setShowAccount(false)} />}
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-xl bg-slate-700/70 hover:bg-slate-600/70 text-slate-200 text-sm"
        >
          Log Out
        </button>
      </div>
    </header>
  );
};

export default Header;