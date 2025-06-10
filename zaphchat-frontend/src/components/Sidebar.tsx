
import React from 'react';
import { NavItemConfig } from '../types';

interface SidebarProps {
  isOpen: boolean;
  navigationItems: NavItemConfig[];
  activeItemId: string;
  onNavigate: (itemId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, navigationItems, activeItemId, onNavigate }) => {
  return (
    <div 
      className={`
        absolute top-0 left-0 h-full w-72 z-20
        flex flex-col bg-slate-900/70 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Content is only rendered and padded if sidebar is open */}
      {isOpen && (
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          {/* Logo/App Name - moved to header, kept for reference or if design changes */}
          {/* <div className="flex items-center space-x-3 px-3 py-2 mb-4">
            <img src="https://picsum.photos/seed/zaph/40/40" alt="ZaphChat Logo" className="h-10 w-10 rounded-lg" />
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">ZaphChat</h1>
          </div> */}

          <nav className="flex-1 space-y-1">
            {navigationItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {item.sectionTitle && (
                  <div className={`px-3 pt-6 pb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider ${index === 0 ? 'mt-0' : ''}`}>
                    {item.sectionTitle}
                  </div>
                )}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                  }}
                  className={`group flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all duration-200 ease-in-out
                    ${
                      activeItemId === item.id
                        ? 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white shadow-lg scale-105 ring-2 ring-cyan-400/50'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 hover:scale-102'
                    }
                  `}
                >
                  <item.icon 
                    className={`mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200 
                      ${activeItemId === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} 
                    aria-hidden="true" 
                  />
                  {item.name}
                </a>
              </React.Fragment>
            ))}
          </nav>

          {/* User Profile Section (Example) */}
          <div className="mt-auto pt-6 border-t border-slate-700/50">
            <a
              href="#"
              className="group flex items-center p-3 bg-slate-800/70 hover:bg-slate-700/70 rounded-xl transition-colors duration-200"
            >
              <img
                className="h-10 w-10 rounded-full mr-3 border-2 border-cyan-500/50"
                src="https://picsum.photos/seed/user/100/100" // Replace with actual user avatar
                alt="User Avatar"
              />
              <div>
                <p className="text-sm font-semibold text-slate-100">Jane Doe</p>
                <p className="text-xs text-slate-400 group-hover:text-slate-300">View profile</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;