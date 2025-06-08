import React, { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import PremiumButton from './PremiumButton';
import { api, apiFetch } from '../api';
import { Bot } from '../types';

interface Props { onClose: () => void; }

const BroadcastModal: React.FC<Props> = ({ onClose }) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [botId, setBotId] = useState('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('');

  useEffect(() => { api.getBots().then(setBots); }, []);

  const send = async () => {
    await apiFetch('/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botId, message, schedule }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">New Broadcast</h2>
        <select className="w-full bg-slate-700/60 px-2 py-1 rounded mb-2" value={botId} onChange={e=>setBotId(e.target.value)}>
          <option value="">Select Bot</option>
          {bots.map(b=> <option key={b._id} value={b._id}>{b.botName}</option>)}
        </select>
        <textarea className="w-full bg-slate-700/60 px-2 py-1 rounded mb-2" rows={3} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message" />
        <input className="w-full bg-slate-700/60 px-2 py-1 rounded mb-2" type="datetime-local" value={schedule} onChange={e=>setSchedule(e.target.value)} />
        <div className="flex justify-end space-x-2">
          <PremiumButton variant="secondary" onClick={onClose}>Cancel</PremiumButton>
          <PremiumButton onClick={send}>Send</PremiumButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default BroadcastModal;
