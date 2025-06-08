import React, { useEffect, useState } from 'react';
import { ServerIcon } from './icons';
import { api } from '../api';

const STATUS_COLORS: Record<string, string> = {
  online: 'text-green-500 animate-pulse',
  offline: 'text-red-500',
  rebooting: 'text-yellow-500 animate-pulse',
};

const ServerStatusIcon: React.FC = () => {
  const [status, setStatus] = useState<'online' | 'offline' | 'rebooting'>('online');

  useEffect(() => {
    let mounted = true;
    async function ping() {
      try {
        await api.ping();
        if (mounted) setStatus('online');
      } catch {
        if (mounted) setStatus('offline');
      }
    }
    ping();
    const id = setInterval(ping, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return <ServerIcon className={`w-5 h-5 ${STATUS_COLORS[status]}`} />;
};

export default ServerStatusIcon;
