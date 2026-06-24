import { useState, useEffect } from 'react';
import { Server, Users, Cpu, HardDrive, Zap, Clock, Activity, RefreshCw, Wifi } from 'lucide-react';
import { server as serverApi } from '../api';
import { ProgressBar } from '../components/ProgressBar';

function MetricCard({ icon: Icon, label, value, unit, color, sub }: {
  icon: React.ElementType; label: string; value: number | string; unit?: string; color: string; sub?: string;
}) {
  return (
    <div className="mc-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} style={{ color }} />
        <span className="text-xs font-semibold text-[#7D8590] uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold font-mono" style={{ color }}>{value}</span>
        {unit && <span className="text-sm text-[#7D8590]">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-[#7D8590] mt-1">{sub}</div>}
    </div>
  );
}

const plugins = [
  { name: 'RebornCore', status: 'enabled', version: '3.2.1' },
  { name: 'RebornPvP', status: 'enabled', version: '1.4.0' },
  { name: 'RebornEconomy', status: 'enabled', version: '2.1.3' },
  { name: 'RebornWorlds', status: 'enabled', version: '0.8.2' },
  { name: 'RebornGuard', status: 'enabled', version: '4.0.1' },
  { name: 'RebornQuests', status: 'disabled', version: '0.2.0' },
  { name: 'LuckPerms', status: 'enabled', version: '5.4.145' },
  { name: 'Vault', status: 'enabled', version: '1.7.3' },
  { name: 'WorldEdit', status: 'enabled', version: '7.3.5' },
  { name: 'WorldGuard', status: 'enabled', version: '7.0.11' },
];

type ServerData = {
  name: string; version: string; status: string;
  players: { current: number; max: number };
  tps: number; uptime: string;
  ram: { used: number; max: number };
  stats?: { projects: number; activeTasks: number };
};

export function ServerStatus() {
  const [data, setData] = useState<ServerData | null>(null);
  const [tps, setTps] = useState(19.8);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    serverApi.info().then(d => { setData(d); setTps(d.tps); }).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTps(19.2 + Math.random() * 0.8);
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const ramPercent = data ? Math.round((data.ram.used / data.ram.max) * 100) : 0;
  const playerPercent = data ? Math.round((data.players.current / data.players.max) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Status banner */}
      <div className="mc-card p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-mc-green/20 border border-mc-green/40 rounded flex items-center justify-center">
          <Server size={24} className="text-mc-green" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-white font-bold text-lg">REBORNMC</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-mc-green/20 text-mc-green border border-mc-green/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-mc-green rounded-full animate-pulse" />
              EN LIGNE
            </span>
          </div>
          <div className="text-[#7D8590] text-sm">Minecraft Java Edition · {data?.version ?? '1.21.8'} · Spigot/Paper</div>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-[#7D8590] flex items-center gap-1.5 justify-end">
            <RefreshCw size={11} />
            Mis à jour {lastUpdate.toLocaleTimeString('fr-FR')}
          </div>
          <div className="text-xs text-[#7D8590] mt-1 flex items-center gap-1.5 justify-end">
            <Wifi size={11} />
            play.rebornmc.fr
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Joueurs" value={data?.players.current ?? 0} unit={`/ ${data?.players.max ?? 200}`} color="#5DA832" sub={`${playerPercent}% capacité`} />
        <MetricCard icon={Activity} label="TPS" value={tps.toFixed(1)} unit="/ 20" color={tps > 19 ? '#5DA832' : tps > 17 ? '#FFAA00' : '#CC0000'} sub={tps > 19 ? 'Excellent' : tps > 17 ? 'Correct' : 'Dégradé'} />
        <MetricCard icon={HardDrive} label="RAM" value={data?.ram.used ?? 0} unit={`/ ${data?.ram.max ?? 16} GB`} color="#3EEEFF" sub={`${ramPercent}% utilisé`} />
        <MetricCard icon={Clock} label="Uptime" value={data?.uptime ?? '—'} color="#FFAA00" sub="depuis dernier redémarrage" />
      </div>

      {/* RAM + Players bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mc-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={15} className="text-mc-diamond" />
            <h3 className="text-white font-semibold">Utilisation RAM</h3>
          </div>
          <ProgressBar value={ramPercent} size="md" color="#3EEEFF" />
          <div className="flex justify-between text-xs text-[#7D8590] mt-2">
            <span>Utilisé: {data?.ram.used ?? 0} GB</span>
            <span>Total: {data?.ram.max ?? 16} GB</span>
          </div>
        </div>
        <div className="mc-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-mc-green" />
            <h3 className="text-white font-semibold">Joueurs Connectés</h3>
          </div>
          <ProgressBar value={playerPercent} size="md" color="#5DA832" />
          <div className="flex justify-between text-xs text-[#7D8590] mt-2">
            <span>En ligne: {data?.players.current ?? 0}</span>
            <span>Maximum: {data?.players.max ?? 200}</span>
          </div>
        </div>
      </div>

      {/* Plugins */}
      <div className="mc-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} className="text-mc-gold" />
          <h3 className="text-white font-semibold">Plugins Chargés</h3>
          <span className="ml-auto text-xs text-mc-green">{plugins.filter(p => p.status === 'enabled').length} actifs</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {plugins.map(plugin => (
            <div key={plugin.name}
              className="flex items-center gap-3 p-3 bg-[#0D1117] rounded border border-[#21262D] hover:border-[#30363D] transition-colors">
              <div className={`w-2 h-2 rounded-sm flex-shrink-0 ${plugin.status === 'enabled' ? 'bg-mc-green' : 'bg-[#3D444D]'}`} />
              <span className={`text-sm font-medium flex-1 ${plugin.status === 'enabled' ? 'text-white' : 'text-[#3D444D]'}`}>{plugin.name}</span>
              <span className="text-xs font-mono text-[#7D8590]">v{plugin.version}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Server info */}
      <div className="mc-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={15} className="text-mc-green" />
          <h3 className="text-white font-semibold">Informations Système</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Version Minecraft', value: '1.21.8 Java' },
            { label: 'Serveur', value: 'Paper 1.21.8-#100' },
            { label: 'Java', value: 'OpenJDK 21.0.5' },
            { label: 'OS', value: 'Ubuntu 24.04 LTS' },
            { label: 'CPU', value: '8 vCPU @ 3.6GHz' },
            { label: 'Stockage', value: '200 GB SSD NVMe' },
          ].map(item => (
            <div key={item.label} className="bg-[#0D1117] p-3 rounded border border-[#21262D]">
              <div className="text-[#7D8590] text-xs mb-1">{item.label}</div>
              <div className="text-white font-mono text-sm">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
