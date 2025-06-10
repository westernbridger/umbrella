import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import { PageProps } from '../../types';
import { RobotIcon, SettingsIcon, KeyIcon, MessageSquareIcon, GlobeIcon, BellIcon, PlusCircleIcon, ZapIcon, CheckCircleIcon } from '../icons';


interface BotConfigItemProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const BotConfigItem: React.FC<BotConfigItemProps> = ({ title, description, children, icon }) => (
  <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/60">
    <div className="flex items-start mb-3">
      <div className="mr-4 text-cyan-400 flex-shrink-0">{icon}</div>
      <div>
        <h4 className="text-lg font-semibold text-slate-100">{title}</h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
    <div className="mt-3 pl-10">{children}</div>
  </div>
);


const BotManagementPage: React.FC<PageProps> = () => {
  const [botName, setBotName] = useState('ZaphBot Assistant');
  const [botPersonality, setBotPersonality] = useState('Helpful and friendly, specialized in scheduling and reminders.');
  const [apiKey, setApiKey] = useState('********-****-****-****-************'); // Masked

  // useEffect for setActivePageTitle removed

  return (
    <div className="space-y-8">
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center">
            <RobotIcon className="w-8 h-8 mr-3 text-cyan-400" />
            Bot Management
          </h2>
          <PremiumButton className="mt-4 md:mt-0" icon={<PlusCircleIcon className="w-5 h-5"/>}>
            Add New Bot Instance
          </PremiumButton>
        </div>
        <p className="text-slate-400">Configure your bot instances, connected accounts, and personality settings.</p>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Connections & Core Settings */}
        <div className="space-y-6">
          <GlassCard title="Connected Accounts">
            <BotConfigItem
              icon={<MessageSquareIcon className="w-6 h-6" />}
              title="WhatsApp Account"
              description="Manage your WhatsApp Business API connection."
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-mono">+1 (555) 123-4567</span>
                <PremiumButton variant="secondary" className="!text-xs !px-3 !py-1 bg-red-600/70 hover:bg-red-500/70 border-red-500/50 text-red-100">
                  Disconnect
                </PremiumButton>
              </div>
            </BotConfigItem>
             <BotConfigItem
              icon={<ZapIcon className="w-6 h-6" />} // Placeholder for other messengers
              title="Telegram / Messenger"
              description="Connect to other messaging platforms."
            >
              <PremiumButton variant="primary" className="!text-sm">
                Connect Telegram
              </PremiumButton>
              <p className="text-xs text-slate-500 mt-2">Messenger integration coming soon.</p>
            </BotConfigItem>
          </GlassCard>

          <GlassCard title="API & Core Settings">
            <BotConfigItem
              icon={<KeyIcon className="w-6 h-6" />}
              title="OpenAI API Key"
              description="Securely manage your OpenAI API key."
            >
              <div className="flex items-center justify-between">
                <input type="text" value={apiKey} readOnly className="font-mono text-slate-300 bg-transparent flex-grow mr-2" />
                <PremiumButton variant="secondary" className="!text-xs !px-3 !py-1">Update Key</PremiumButton>
              </div>
            </BotConfigItem>
          </GlassCard>
        </div>

        {/* Right Column: Personality & General Settings */}
        <div className="space-y-6">
          <GlassCard title="Bot Personality & Branding">
            <BotConfigItem
              icon={<SettingsIcon className="w-6 h-6" />}
              title="Bot Name"
              description="The display name for your bot."
            >
              <input 
                type="text" 
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </BotConfigItem>
             <BotConfigItem
              icon={<MessageSquareIcon className="w-6 h-6" />}
              title="Bot Personality / Description"
              description="Define how your bot interacts and its core purpose."
            >
              <textarea 
                value={botPersonality}
                onChange={(e) => setBotPersonality(e.target.value)}
                rows={3}
                className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g., A friendly assistant for customer support."
              />
            </BotConfigItem>
            <div className="mt-4 text-right">
                <PremiumButton>Save Personality Settings</PremiumButton>
            </div>
          </GlassCard>
          
          <GlassCard title="Language & Notifications">
            <BotConfigItem
              icon={<GlobeIcon className="w-6 h-6" />}
              title="Language & Timezone"
              description="Set default language and timezone for bot interactions."
            >
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3">
                <select className="flex-1 bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
                <select className="flex-1 bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500">
                  <option>UTC-05:00 (Eastern Time)</option>
                  <option>UTC+00:00 (GMT)</option>
                </select>
              </div>
            </BotConfigItem>
            <BotConfigItem
              icon={<BellIcon className="w-6 h-6" />}
              title="Notification Preferences"
              description="Choose how you receive bot alerts and summaries."
            >
              <label className="flex items-center space-x-2 text-slate-300 hover:text-slate-100 cursor-pointer">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500" defaultChecked/>
                <span>Email critical alerts</span>
              </label>
            </BotConfigItem>
          </GlassCard>
        </div>
      </div>
       <div className="mt-8 text-center">
            <PremiumButton 
                variant="primary" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 focus:ring-green-400/50 hover:shadow-[0_0_20px_0px_rgba(16,185,129,0.5)]"
                icon={<CheckCircleIcon className="w-5 h-5"/>}
            >
              Save All Bot Settings
            </PremiumButton>
        </div>
    </div>
  );
};

export default BotManagementPage;