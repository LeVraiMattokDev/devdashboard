import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settings as settingsApi } from '../api';
import type { AppSettings } from '../api';
import { useAuth } from './AuthContext';

const DEFAULTS: AppSettings = {
  dashboard_name:    'REBORNMC',
  dashboard_subtitle:'Dev Dashboard',
  mc_version:        '1.21.8',
  server_address:    'play.example.com',
  server_type:       'Paper',
  java_version:      'OpenJDK 21',
  os_info:           'Ubuntu 24.04 LTS',
  cpu_info:          '8 vCPU',
  storage_info:      '200 GB SSD',
  ram_max_gb:        '16',
  max_players:       '200',
  plugins:           [],
  integrations:      { pterodactyl: false, mc_ping: false },
};

interface SettingsContextValue {
  settings: AppSettings;
  loading: boolean;
  refresh: () => void;
  save: (patch: Partial<AppSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    settingsApi.get()
      .then(data => setSettings({ ...DEFAULTS, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (patch: Partial<AppSettings>) => {
    const updated = await settingsApi.update(patch);
    setSettings({ ...DEFAULTS, ...updated });
  }, []);

  return (
    <SettingsContext value={{ settings, loading, refresh: load, save }}>
      {children}
    </SettingsContext>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
