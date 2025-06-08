import React, { useState } from 'react';
import PremiumButton from './PremiumButton';
import GlassCard from './GlassCard';
import { useAuth } from '../AuthContext';
import { api, apiFetch } from '../api';

interface Props { onClose: () => void; }

const AccountSettings: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  const save = async () => {
    try {
      await apiFetch('/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, website, password, oldPassword }),
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <GlassCard className="w-full max-w-md">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Account Settings</h2>
        <div className="space-y-3">
          <input className="w-full bg-slate-700/60 px-3 py-2 rounded" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
          <input className="w-full bg-slate-700/60 px-3 py-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
          <input className="w-full bg-slate-700/60 px-3 py-2 rounded" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
          <input className="w-full bg-slate-700/60 px-3 py-2 rounded" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="Website" />
          <input className="w-full bg-slate-700/60 px-3 py-2 rounded" type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} placeholder="Old Password" />
          <input className="w-full bg-slate-700/60 px-3 py-2 rounded" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New Password" />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <PremiumButton variant="secondary" onClick={onClose}>Cancel</PremiumButton>
          <PremiumButton onClick={save}>Save</PremiumButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default AccountSettings;
