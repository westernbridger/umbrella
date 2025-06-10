import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import { PageProps } from '../../types';
import { Users2Icon, SearchIcon, ChevronDownIcon, ShieldCheckIcon, EditIcon, TrashIcon, PlusCircleIcon } from '../icons';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Moderator' | 'Viewer' | 'Editor';
  status: 'Online' | 'Offline' | 'Away';
  lastSeen: string;
  avatarSeed: string;
}

const initialUsers: User[] = [
  { id: '1', name: 'Alice Wonderland', email: 'alice@zaph.chat', role: 'Admin', status: 'Online', lastSeen: 'Now', avatarSeed: 'alice' },
  { id: '2', name: 'Bob The Builder', email: 'bob@zaph.chat', role: 'Editor', status: 'Offline', lastSeen: '2 hours ago', avatarSeed: 'bob' },
  { id: '3', name: 'Charlie Chaplin', email: 'charlie@zaph.chat', role: 'Viewer', status: 'Away', lastSeen: '15 mins ago', avatarSeed: 'charlie' },
  { id: '4', name: 'Diana Prince', email: 'diana@zaph.chat', role: 'Moderator', status: 'Online', lastSeen: '5 mins ago', avatarSeed: 'diana' },
  { id: '5', name: 'Edward Scissorhands', email: 'edward@zaph.chat', role: 'Viewer', status: 'Offline', lastSeen: 'Yesterday', avatarSeed: 'edward' },
];

const StatusIndicator: React.FC<{ status: User['status'] }> = ({ status }) => {
  let color = 'bg-slate-500'; // Offline default
  if (status === 'Online') color = 'bg-green-500';
  if (status === 'Away') color = 'bg-yellow-500';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${color}`} title={status}></span>;
};

const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
  let bgColor = 'bg-slate-600';
  if (role === 'Admin') bgColor = 'bg-purple-600';
  else if (role === 'Moderator') bgColor = 'bg-blue-600';
  else if (role === 'Editor') bgColor = 'bg-cyan-600';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bgColor} text-white/90 backdrop-blur-sm`}>
      {role}
    </span>
  );
};


const UserManagementPage: React.FC<PageProps> = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | User['role']>('all');

  // useEffect for setActivePageTitle removed
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center">
            <Users2Icon className="w-8 h-8 mr-3 text-cyan-400" />
            User Management
          </h2>
          <PremiumButton 
            className="mt-4 md:mt-0"
            icon={<PlusCircleIcon className="w-5 h-5"/>}
          >
            Add New User
          </PremiumButton>
        </div>
         {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search users by name or email..."
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
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="appearance-none w-full md:w-auto bg-slate-700/60 border border-slate-600/80 text-slate-200 rounded-lg px-4 py-2.5 pr-8 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
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
                {['User', 'Email', 'Role', 'Status', 'Last Seen', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-9 w-9 rounded-full mr-3 border border-slate-600" src={`https://picsum.photos/seed/${user.avatarSeed}/40/40`} alt={user.name} />
                      <span className="text-sm font-medium text-slate-100">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <StatusIndicator status={user.status} /> {user.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{user.lastSeen}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button title="Edit User" className="p-1.5 rounded text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                        <EditIcon className="w-4 h-4" />
                    </button>
                    <button title="Manage Permissions" className="p-1.5 rounded text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors">
                        <ShieldCheckIcon className="w-4 h-4" />
                    </button>
                    <button title="Delete User" className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredUsers.length > 0 && (
          <div className="p-4 border-t border-slate-700/50 text-sm text-slate-400">
            Showing {filteredUsers.length} of {users.length} users.
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default UserManagementPage;