import { useState } from 'react';
import { Settings2, Server, Puzzle, Plug, Plus, Pencil, Trash2, X, Check, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import type { AppSettings } from '../api';

type Plugin = AppSettings['plugins'][number];
type Tab = 'general' | 'server' | 'plugins' | 'integrations';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'general',      label: 'Général',       icon: Settings2 },
  { id: 'server',       label: 'Serveur',        icon: Server    },
  { id: 'plugins',      label: 'Plugins',        icon: Puzzle    },
  { id: 'integrations', label: 'Intégrations',   icon: Plug      },
];

function Field({ label, name, value, onChange, placeholder, type = 'text' }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[#7D8590] block mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green transition-colors placeholder:text-[#3D444D]"
      />
    </div>
  );
}

function SaveButton({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-mc-green text-white rounded text-sm font-medium hover:bg-[#4a8a26] transition-colors disabled:opacity-50"
    >
      {saved ? <><Check size={14} /> Sauvegardé</> : loading ? 'Sauvegarde...' : 'Sauvegarder'}
    </button>
  );
}

function useSaveState() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(fn: () => Promise<void>) {
    setLoading(true); setSaved(false);
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }
  return { loading, saved, save };
}

// ── Tab: Général ─────────────────────────────────────────────────────────────

function GeneralTab() {
  const { settings, save } = useSettings();
  const [form, setForm] = useState({
    dashboard_name:     settings.dashboard_name,
    dashboard_subtitle: settings.dashboard_subtitle,
  });
  const { loading, saved, save: doSave } = useSaveState();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSave(() => save(form));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mc-card p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm mb-3">Identité du dashboard</h3>
        <Field label="Nom affiché (sidebar + header)" name="dashboard_name"
          value={form.dashboard_name} onChange={v => setForm(f => ({ ...f, dashboard_name: v }))}
          placeholder="REBORNMC" />
        <Field label="Sous-titre (sidebar)" name="dashboard_subtitle"
          value={form.dashboard_subtitle} onChange={v => setForm(f => ({ ...f, dashboard_subtitle: v }))}
          placeholder="Dev Dashboard" />
        <div className="bg-[#0D1117] border border-[#21262D] rounded p-3 text-xs text-[#7D8590]">
          <span className="text-mc-green font-bold">Aperçu sidebar : </span>
          <span className="text-white font-bold">{form.dashboard_name || 'REBORNMC'}</span>
          {' · '}
          <span style={{ color: '#5DA832' }}>{form.dashboard_subtitle || 'Dev Dashboard'}</span>
        </div>
      </div>
      <div className="flex justify-end">
        <SaveButton loading={loading} saved={saved} />
      </div>
    </form>
  );
}

// ── Tab: Serveur ──────────────────────────────────────────────────────────────

function ServerTab() {
  const { settings, save } = useSettings();
  const [form, setForm] = useState({
    mc_version:    settings.mc_version,
    server_address:settings.server_address,
    server_type:   settings.server_type,
    java_version:  settings.java_version,
    os_info:       settings.os_info,
    cpu_info:      settings.cpu_info,
    storage_info:  settings.storage_info,
    ram_max_gb:    settings.ram_max_gb,
    max_players:   settings.max_players,
  });
  const { loading, saved, save: doSave } = useSaveState();

  function set(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSave(() => save(form));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mc-card p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm mb-1">Connexion</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Adresse du serveur" name="server_address" value={form.server_address}
            onChange={v => set('server_address', v)} placeholder="play.rebornmc.fr" />
          <Field label="Version Minecraft" name="mc_version" value={form.mc_version}
            onChange={v => set('mc_version', v)} placeholder="1.21.8" />
        </div>
      </div>

      <div className="mc-card p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm mb-1">Capacité</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Joueurs max" name="max_players" value={form.max_players}
            onChange={v => set('max_players', v)} placeholder="200" type="number" />
          <Field label="RAM totale (GB)" name="ram_max_gb" value={form.ram_max_gb}
            onChange={v => set('ram_max_gb', v)} placeholder="16" type="number" />
        </div>
      </div>

      <div className="mc-card p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm mb-1">Informations système (affichage)</h3>
        <p className="text-xs text-[#7D8590] -mt-2">Affichés sur la page Serveur quand Pterodactyl n'est pas configuré.</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type de serveur" name="server_type" value={form.server_type}
            onChange={v => set('server_type', v)} placeholder="Paper 1.21.8-#100" />
          <Field label="Version Java" name="java_version" value={form.java_version}
            onChange={v => set('java_version', v)} placeholder="OpenJDK 21.0.5" />
          <Field label="Système d'exploitation" name="os_info" value={form.os_info}
            onChange={v => set('os_info', v)} placeholder="Ubuntu 24.04 LTS" />
          <Field label="CPU" name="cpu_info" value={form.cpu_info}
            onChange={v => set('cpu_info', v)} placeholder="8 vCPU @ 3.6GHz" />
          <div className="col-span-2">
            <Field label="Stockage" name="storage_info" value={form.storage_info}
              onChange={v => set('storage_info', v)} placeholder="200 GB SSD NVMe" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton loading={loading} saved={saved} />
      </div>
    </form>
  );
}

// ── Tab: Plugins ──────────────────────────────────────────────────────────────

function PluginsTab() {
  const { settings, save } = useSettings();
  const [plugins, setPlugins] = useState<Plugin[]>(settings.plugins);
  const [editing, setEditing] = useState<{ index: number; plugin: Plugin } | null>(null);
  const [adding, setAdding] = useState(false);
  const [newPlugin, setNewPlugin] = useState<Plugin>({ name: '', version: '', status: 'enabled' });
  const { loading, saved, save: doSave } = useSaveState();

  function toggle(i: number) {
    setPlugins(prev => prev.map((p, idx) => idx === i ? { ...p, status: p.status === 'enabled' ? 'disabled' : 'enabled' } : p));
  }

  function remove(i: number) {
    setPlugins(prev => prev.filter((_, idx) => idx !== i));
  }

  function saveEdit() {
    if (!editing) return;
    setPlugins(prev => prev.map((p, i) => i === editing.index ? editing.plugin : p));
    setEditing(null);
  }

  function addPlugin() {
    if (!newPlugin.name.trim()) return;
    setPlugins(prev => [...prev, { ...newPlugin }]);
    setNewPlugin({ name: '', version: '', status: 'enabled' });
    setAdding(false);
  }

  function handleSave() {
    doSave(() => save({ plugins }));
  }

  const enabled = plugins.filter(p => p.status === 'enabled').length;

  return (
    <div className="space-y-5">
      <div className="mc-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#21262D] flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">Liste des plugins</h3>
            <p className="text-xs text-[#7D8590] mt-0.5">{enabled} actifs · {plugins.length} total</p>
          </div>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-mc-green text-white rounded text-sm hover:bg-[#4a8a26] transition-colors">
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {adding && (
          <div className="px-5 py-4 border-b border-[#21262D] bg-[#0D1117]">
            <div className="flex items-center gap-3">
              <input value={newPlugin.name} onChange={e => setNewPlugin(p => ({ ...p, name: e.target.value }))}
                placeholder="Nom du plugin" className="flex-1 bg-[#161B22] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
              <input value={newPlugin.version} onChange={e => setNewPlugin(p => ({ ...p, version: e.target.value }))}
                placeholder="Version" className="w-28 bg-[#161B22] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
              <select value={newPlugin.status} onChange={e => setNewPlugin(p => ({ ...p, status: e.target.value as 'enabled' | 'disabled' }))}
                className="bg-[#161B22] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                <option value="enabled">Actif</option>
                <option value="disabled">Désactivé</option>
              </select>
              <button onClick={addPlugin} className="p-2 text-mc-green hover:bg-mc-green/10 rounded transition-colors"><Check size={16} /></button>
              <button onClick={() => setAdding(false)} className="p-2 text-[#7D8590] hover:text-white rounded transition-colors"><X size={16} /></button>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#21262D]">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#7D8590] uppercase tracking-wider w-8">Statut</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#7D8590] uppercase tracking-wider">Nom</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#7D8590] uppercase tracking-wider">Version</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {plugins.map((p, i) => (
              <tr key={i} className="border-b border-[#21262D] last:border-0 hover:bg-[#161B22] transition-colors">
                {editing?.index === i ? (
                  <>
                    <td className="px-5 py-2">
                      <select value={editing.plugin.status} onChange={e => setEditing(ed => ed ? { ...ed, plugin: { ...ed.plugin, status: e.target.value as 'enabled' | 'disabled' } } : ed)}
                        className="bg-[#0D1117] border border-[#30363D] text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-mc-green">
                        <option value="enabled">Actif</option>
                        <option value="disabled">Désactivé</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input value={editing.plugin.name} onChange={e => setEditing(ed => ed ? { ...ed, plugin: { ...ed.plugin, name: e.target.value } } : ed)}
                        className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-mc-green" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={editing.plugin.version} onChange={e => setEditing(ed => ed ? { ...ed, plugin: { ...ed.plugin, version: e.target.value } } : ed)}
                        className="w-32 bg-[#0D1117] border border-[#30363D] text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-mc-green" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={saveEdit} className="p-1 text-mc-green hover:bg-mc-green/10 rounded transition-colors"><Check size={13} /></button>
                        <button onClick={() => setEditing(null)} className="p-1 text-[#7D8590] hover:text-white rounded transition-colors"><X size={13} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3">
                      <button onClick={() => toggle(i)} title={p.status === 'enabled' ? 'Désactiver' : 'Activer'}>
                        <div className={`w-2.5 h-2.5 rounded-sm transition-colors ${p.status === 'enabled' ? 'bg-mc-green' : 'bg-[#3D444D]'}`} />
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-medium ${p.status === 'enabled' ? 'text-white' : 'text-[#3D444D]'}`}>{p.name}</span>
                    </td>
                    <td className="px-3 py-3 text-[#7D8590] font-mono text-xs">{p.version || '—'}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setEditing({ index: i, plugin: { ...p } })}
                          className="p-1.5 text-[#7D8590] hover:text-white hover:bg-[#21262D] rounded transition-colors"><Pencil size={12} /></button>
                        <button onClick={() => remove(i)}
                          className="p-1.5 text-[#7D8590] hover:text-mc-redstone hover:bg-[#21262D] rounded transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {plugins.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-[#3D444D] text-xs">Aucun plugin — cliquez sur "Ajouter" pour en créer un</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-mc-green text-white rounded text-sm font-medium hover:bg-[#4a8a26] transition-colors disabled:opacity-50">
          {saved ? <><Check size={14} /> Sauvegardé</> : loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}

// ── Tab: Intégrations ─────────────────────────────────────────────────────────

function IntegrationCard({ title, configured, description, envVars, provides }: {
  title: string; configured: boolean; description: string;
  envVars: { key: string; example: string; hint: string }[];
  provides: string[];
}) {
  return (
    <div className="mc-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-white font-semibold">{title}</h3>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border ${
          configured
            ? 'bg-mc-green/10 text-mc-green border-mc-green/30'
            : 'bg-[#21262D] text-[#7D8590] border-[#30363D]'
        }`}>
          {configured
            ? <><CheckCircle2 size={11} /> Configuré</>
            : <><XCircle size={11} /> Non configuré</>
          }
        </div>
      </div>
      <p className="text-[#7D8590] text-xs mb-4 leading-relaxed">{description}</p>

      <div className="mb-4">
        <div className="text-xs text-[#7D8590] mb-2 flex items-center gap-1.5">
          <Info size={11} /> Données fournies :
        </div>
        <div className="flex flex-wrap gap-1.5">
          {provides.map(p => (
            <span key={p} className="text-xs px-2 py-0.5 bg-mc-green/10 text-mc-green border border-mc-green/20 rounded">{p}</span>
          ))}
        </div>
      </div>

      <div className="bg-[#0D1117] rounded border border-[#21262D] p-3 space-y-2.5">
        <div className="text-xs text-[#7D8590] font-semibold uppercase tracking-wider mb-2">Variables à ajouter dans le fichier .env</div>
        {envVars.map(v => (
          <div key={v.key}>
            <div className="font-mono text-xs text-mc-diamond">{v.key}=<span className="text-[#7D8590]">{v.example}</span></div>
            <div className="text-xs text-[#3D444D] mt-0.5">{v.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const { settings } = useSettings();
  const { pterodactyl, mc_ping } = settings.integrations;

  return (
    <div className="space-y-5">
      <div className="bg-[#0D1117] border border-[#21262D] rounded p-3 text-xs text-[#7D8590] flex items-start gap-2">
        <Info size={13} className="text-mc-gold flex-shrink-0 mt-0.5" />
        Les intégrations sont configurées via le fichier <code className="text-mc-diamond">.env</code> à la racine du projet.
        Redémarrez le serveur après chaque modification.
      </div>

      <IntegrationCard
        title="Pterodactyl Panel"
        configured={pterodactyl}
        description="Récupère les métriques en temps réel de votre serveur depuis votre panel Pterodactyl : statut (online/offline/starting), RAM utilisée, CPU, disque et uptime."
        provides={['Statut serveur', 'RAM utilisée', 'CPU %', 'Disque', 'Uptime']}
        envVars={[
          { key: 'PTERODACTYL_URL',       example: 'https://panel.example.com', hint: 'URL de votre panel Pterodactyl (sans slash final)' },
          { key: 'PTERODACTYL_API_KEY',   example: 'ptlc_xxxxxxxxxxxxxxxx',     hint: 'Clé API client : Panel → Compte → API Credentials' },
          { key: 'PTERODACTYL_SERVER_ID', example: 'abc12345',                  hint: 'Identifiant court du serveur visible dans l\'URL du panel' },
        ]}
      />

      <IntegrationCard
        title="Minecraft Server Ping"
        configured={mc_ping}
        description="Utilise le protocole Server List Ping (SLP) de Minecraft pour récupérer le nombre de joueurs connectés et la version du serveur en temps réel. Fonctionne avec tout serveur Java 1.7+."
        provides={['Joueurs en ligne', 'Joueurs max', 'Version serveur']}
        envVars={[
          { key: 'MC_HOST', example: 'play.example.com', hint: 'Adresse IP ou hostname de votre serveur Minecraft' },
          { key: 'MC_PORT', example: '25565',            hint: 'Port du serveur (défaut : 25565)' },
        ]}
      />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function Settings() {
  const [tab, setTab] = useState<Tab>('general');

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#161B22] border border-[#21262D] rounded p-1 w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-[#0D1117] text-white border border-[#30363D] shadow-inner'
                  : 'text-[#7D8590] hover:text-white'
              }`}
            >
              <Icon size={14} className={tab === t.id ? 'text-mc-green' : ''} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'general'      && <GeneralTab />}
      {tab === 'server'       && <ServerTab />}
      {tab === 'plugins'      && <PluginsTab />}
      {tab === 'integrations' && <IntegrationsTab />}
    </div>
  );
}
