import { useState, useEffect } from 'react';
import { Server, Users, Cpu, HardDrive, Clock, Activity, RefreshCw, Wifi } from 'lucide-react';
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

type ServerData = {
  name: string; version: string; address: string; status: string;
  serverType: string; javaVersion: string; osInfo: string; cpuInfo: string; storageInfo: string;
  players: { current: number; max: number };
  uptime: string;
  ram: { used: number; max: number | null };
  cpu: number; cpuMax: number | null; disk: number;
  hasPterodactyl: boolean; hasMcPing: boolean;
  stats: { projects: number; activeTasks: number };
};

export function ServerStatus() {
  const [data, setData] = useState<ServerData | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadData = () => {
    serverApi.info().then(d => {
      setData(d as unknown as ServerData);
      setLastUpdate(new Date());
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, []);

  const ramPercent = data && data.ram.max !== null
    ? Math.min(100, Math.round((data.ram.used / data.ram.max) * 100))
    : 0;
  const playerPercent = data ? Math.min(100, Math.round((data.players.current / data.players.max) * 100)) : 0;
  const cpuPercent = data && data.cpuMax !== null
    ? Math.min(100, Math.round((data.cpu / data.cpuMax) * 100))
    : Math.min(100, data?.cpu ?? 0);

  const statusLabel = data?.status === 'online' ? 'EN LIGNE' : data?.status === 'offline' ? 'HORS LIGNE' : 'DÉMARRAGE';
  const statusColor = data?.status === 'online' ? 'mc-green' : data?.status === 'offline' ? 'mc-redstone' : 'mc-gold';

  return (
    <div className="p-6 space-y-6">
      {/* Status banner */}
      <div className="mc-card p-4 flex items-center gap-4">
        <div className={`w-12 h-12 bg-${statusColor}/20 border border-${statusColor}/40 rounded flex items-center justify-center`}>
          <Server size={24} className={`text-${statusColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-white font-bold text-lg">{data?.name ?? '—'}</h2>
            <span className={`text-xs px-2 py-0.5 rounded bg-${statusColor}/20 text-${statusColor} border border-${statusColor}/30 flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 bg-${statusColor} rounded-full ${data?.status === 'online' ? 'animate-pulse' : ''}`} />
              {statusLabel}
            </span>
            {data?.hasPterodactyl && (
              <span className="text-xs text-[#5DA832] opacity-60">via Pterodactyl</span>
            )}
          </div>
          <div className="text-[#7D8590] text-sm">
            Minecraft Java Edition · {data?.version ?? '—'} · {data?.serverType ?? 'Paper'}
          </div>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-[#7D8590] flex items-center gap-1.5 justify-end">
            <RefreshCw size={11} />
            {lastUpdate.toLocaleTimeString('fr-FR')}
          </div>
          <div className="text-xs text-[#7D8590] mt-1 flex items-center gap-1.5 justify-end">
            <Wifi size={11} />
            {data?.address ?? '—'}
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard icon={Users} label="Joueurs" value={data?.players.current ?? 0}
          unit={`/ ${data?.players.max ?? '—'}`} color="#5DA832"
          sub={`${playerPercent}% capacité`} />
        <MetricCard icon={HardDrive} label="RAM" value={data?.ram.used ?? 0}
          unit="GB" color="#3EEEFF"
          sub={data?.ram.max === null ? 'Illimitée' : `/ ${data?.ram.max} GB · ${ramPercent}% utilisé`} />
        <MetricCard icon={Clock} label="Uptime" value={data?.uptime ?? '—'} color="#FFAA00"
          sub="depuis dernier redémarrage" />
      </div>

      {/* RAM + Players bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mc-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={15} className="text-mc-diamond" />
            <h3 className="text-white font-semibold">Utilisation RAM</h3>
            {data?.hasPterodactyl && <span className="ml-auto text-xs text-mc-green opacity-60">live</span>}
          </div>
          {data?.ram.max !== null ? (
            <>
              <ProgressBar value={ramPercent} size="md" color="#3EEEFF" />
              <div className="flex justify-between text-xs text-[#7D8590] mt-2">
                <span>Utilisé: {data?.ram.used ?? 0} GB</span>
                <span>Total: {data?.ram.max ?? '—'} GB</span>
              </div>
            </>
          ) : (
            <div className="text-center py-3">
              <div className="text-3xl font-bold font-mono text-mc-diamond">
                {data?.ram.used ?? 0} <span className="text-sm text-[#7D8590]">GB</span>
              </div>
              <div className="text-xs text-[#7D8590] mt-1">RAM illimitée</div>
            </div>
          )}
        </div>
        <div className="mc-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-mc-green" />
            <h3 className="text-white font-semibold">Joueurs Connectés</h3>
            {data?.hasMcPing && <span className="ml-auto text-xs text-mc-green opacity-60">live</span>}
          </div>
          <ProgressBar value={playerPercent} size="md" color="#5DA832" />
          <div className="flex justify-between text-xs text-[#7D8590] mt-2">
            <span>En ligne: {data?.players.current ?? 0}</span>
            <span>Maximum: {data?.players.max ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* CPU + Disk (Pterodactyl only) */}
      {data?.hasPterodactyl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mc-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={15} className="text-mc-gold" />
              <h3 className="text-white font-semibold">CPU</h3>
              <span className="ml-auto text-xs text-mc-green opacity-60">live</span>
            </div>
            {data.cpuMax !== null ? (
              <>
                <ProgressBar value={cpuPercent} size="md" color="#FFAA00" />
                <div className="flex justify-between text-xs text-[#7D8590] mt-2">
                  <span>Utilisé: {data.cpu}%</span>
                  <span>Limite: {data.cpuMax}%</span>
                </div>
              </>
            ) : (
              <div className="text-center py-3">
                <div className="text-3xl font-bold font-mono text-mc-gold">
                  {data.cpu}<span className="text-sm text-[#7D8590]">%</span>
                </div>
                <div className="text-xs text-[#7D8590] mt-1">CPU illimité</div>
              </div>
            )}
          </div>
          <div className="mc-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={15} className="text-mc-gold" />
              <h3 className="text-white font-semibold">Disque</h3>
              <span className="ml-auto text-xs text-mc-green opacity-60">live</span>
            </div>
            <div className="text-3xl font-bold font-mono text-mc-gold mb-2">
              {data.disk} <span className="text-sm text-[#7D8590]">GB</span>
            </div>
            <div className="text-xs text-[#7D8590]">{data.storageInfo}</div>
          </div>
        </div>
      )}

      {/* System info */}
      <div className="mc-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-mc-green" />
          <h3 className="text-white font-semibold">Informations Système</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Version Minecraft', value: data?.version ?? '—' },
            { label: 'Serveur',           value: data?.serverType  ?? '—' },
            { label: 'Java',              value: data?.javaVersion ?? '—' },
            { label: 'OS',                value: data?.osInfo      ?? '—' },
            { label: 'CPU',               value: data?.cpuInfo     ?? '—' },
            { label: 'Stockage',          value: data?.storageInfo ?? '—' },
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
