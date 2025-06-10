import React, { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import PremiumButton from './PremiumButton';
import Modal from './Modal';
import { api } from '../api';
import { Bot } from '../types';
import { EditIcon, TrashIcon } from './icons';

interface Props { onClose: () => void; }

const BotManager: React.FC<Props> = ({ onClose }) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [editing, setEditing] = useState<Bot | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const b = await api.getBots();
    setBots(b);
  };

  const save = async () => {
    if (!editing) return;
    if (editing._id) await api.updateBot(editing._id, editing);
    else await api.createBot(editing);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await api.deleteBot(id);
    load();
  };

  return (
    <Modal onClose={onClose} containerClassName="w-full max-w-2xl overflow-auto">
      <GlassCard className="w-full">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Manage Bots</h2>
        {editing ? (
          <div className="space-y-2">
            <input className="w-full bg-slate-700/60 px-2 py-1 rounded" value={editing.botName} onChange={e=>setEditing({ ...editing, botName: e.target.value })} placeholder="Bot Name" />
            <input className="w-full bg-slate-700/60 px-2 py-1 rounded" value={editing.phoneNumber} onChange={e=>setEditing({ ...editing, phoneNumber: e.target.value })} placeholder="Phone" />
            <input className="w-full bg-slate-700/60 px-2 py-1 rounded" value={editing.whatsappId} onChange={e=>setEditing({ ...editing, whatsappId: e.target.value })} placeholder="WhatsApp ID" />
            <textarea className="w-full bg-slate-700/60 px-2 py-1 rounded" rows={3} value={editing.personality} onChange={e=>setEditing({ ...editing, personality: e.target.value })} placeholder="Personality" />
            <select className="w-full bg-slate-700/60 px-2 py-1 rounded" value={editing.status} onChange={e=>setEditing({ ...editing, status: e.target.value as any })}>
              <option value="online">Online</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
            <div className="flex justify-end space-x-2 pt-2">
              <PremiumButton variant="secondary" onClick={()=>setEditing(null)}>Cancel</PremiumButton>
              <PremiumButton onClick={save}>Save</PremiumButton>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bots.map(b => (
                <div key={b._id} className="flex items-center justify-between bg-slate-700/50 px-3 py-2 rounded">
                  <span className="text-slate-100">{b.botName}</span>
                  <div className="space-x-2">
                    <button onClick={()=>setEditing(b)}><EditIcon className="w-5 h-5" /></button>
                    <button onClick={()=>b._id && remove(b._id)}><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {bots.length === 0 && <p className="text-slate-400">No bots yet.</p>}
            </div>
            <div className="pt-4 flex justify-between">
              <PremiumButton variant="secondary" onClick={onClose}>Close</PremiumButton>
              <PremiumButton onClick={()=>setEditing({ botName:'', phoneNumber:'', whatsappId:'', status:'online', personality:'', contacts:[], conversations:[], messages:[] })}>Add Bot</PremiumButton>
            </div>
          </>
        )}
      </GlassCard>
    </Modal>
  );
};

export default BotManager;
