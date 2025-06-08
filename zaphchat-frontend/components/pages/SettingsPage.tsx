import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import { PageProps } from '../../types';
import { SettingsIcon as GeneralSettingsIcon, UploadCloudIcon, GlobeIcon, BellIcon, CheckCircleIcon } from '../icons'; // Renamed SettingsIcon

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode; // Added optional icon prop
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children, icon }) => (
  <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/60 mb-6">
    <h3 className="text-xl font-semibold text-slate-100 mb-1 flex items-center">
      {icon && <span className="mr-2 flex-shrink-0">{icon}</span>} {/* Render icon if provided */}
      {title}
    </h3>
    {description && <p className="text-sm text-slate-400 mb-4">{description}</p>}
    <div className="space-y-4">{children}</div>
  </div>
);

const SettingsPage: React.FC<PageProps> = () => {
  const [appName, setAppName] = useState('ZaphChat Platform');
  const [appLogo, setAppLogo] = useState<File | null>(null); // Placeholder for file
  const [appLanguage, setAppLanguage] = useState('en-US');
  const [appTimezone, setAppTimezone] = useState('America/New_York');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);


  // useEffect for setActivePageTitle removed

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAppLogo(event.target.files[0]);
      // todo: handle actual upload
    }
  };

  return (
    <div className="space-y-8">
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center">
            <GeneralSettingsIcon className="w-8 h-8 mr-3 text-cyan-400" />
            Application Settings
          </h2>
        </div>
        <p className="text-slate-400">Manage global settings for your ZaphChat application.</p>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <GlassCard title="Branding & Appearance">
            <SettingsSection title="Application Name">
              <input 
                type="text" 
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Your Application Name"
              />
            </SettingsSection>
            <SettingsSection title="Application Logo">
                <div className="flex items-center space-x-4">
                    <img 
                        src={appLogo ? URL.createObjectURL(appLogo) : "https://picsum.photos/seed/applogo/80/80"} 
                        alt="App Logo Preview" 
                        className="w-20 h-20 rounded-lg object-cover bg-slate-700 border border-slate-600"
                    />
                    <div>
                        <input type="file" id="logoUpload" className="hidden" accept="image/png, image/jpeg" onChange={handleLogoUpload} />
                        <PremiumButton 
                            variant="secondary" 
                            onClick={() => document.getElementById('logoUpload')?.click()}
                            icon={<UploadCloudIcon className="w-5 h-5"/>}
                        >
                            {appLogo ? "Change Logo" : "Upload Logo"}
                        </PremiumButton>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB. Recommended: 200x200px.</p>
                    </div>
                </div>
            </SettingsSection>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <GlassCard title="Localization & Notifications">
            <SettingsSection title="Language & Timezone" icon={<GlobeIcon className="w-6 h-6 text-cyan-400" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appLanguage" className="block text-sm font-medium text-slate-300 mb-1">Default Language</label>
                  <select 
                    id="appLanguage"
                    value={appLanguage}
                    onChange={(e) => setAppLanguage(e.target.value)}
                    className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español (España)</option>
                    <option value="fr-FR">Français (France)</option>
                    {/* Add more languages */}
                  </select>
                </div>
                <div>
                  <label htmlFor="appTimezone" className="block text-sm font-medium text-slate-300 mb-1">Default Timezone</label>
                  <select 
                    id="appTimezone"
                    value={appTimezone}
                    onChange={(e) => setAppTimezone(e.target.value)}
                    className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="America/New_York">America/New_York (ET)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    {/* Add more timezones */}
                  </select>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Notification Options" icon={<BellIcon className="w-6 h-6 text-cyan-400" />}>
              <label className="flex items-center space-x-3 text-slate-300 hover:text-slate-100 cursor-pointer p-2 rounded-md hover:bg-slate-700/40 transition-colors">
                <input 
                    type="checkbox" 
                    checked={emailNotifications} 
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-offset-slate-800 focus:ring-cyan-500"
                />
                <span>Enable Email Notifications (for critical alerts)</span>
              </label>
              <label className="flex items-center space-x-3 text-slate-300 hover:text-slate-100 cursor-pointer p-2 rounded-md hover:bg-slate-700/40 transition-colors">
                <input 
                    type="checkbox" 
                    checked={pushNotifications} 
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-offset-slate-800 focus:ring-cyan-500"
                />
                <span>Enable Push Notifications (app activity - coming soon)</span>
              </label>
            </SettingsSection>
          </GlassCard>
        </div>
      </div>
        <div className="mt-8 text-center">
            <PremiumButton 
                variant="primary" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 focus:ring-green-400/50 hover:shadow-[0_0_20px_0px_rgba(16,185,129,0.5)]"
                icon={<CheckCircleIcon className="w-5 h-5"/>}
                // onClick={handleSaveChanges}
            >
              Save All Application Settings
            </PremiumButton>
        </div>
    </div>
  );
};

export default SettingsPage;