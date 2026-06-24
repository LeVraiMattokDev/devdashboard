import { Server, Code, CheckCircle, AlertTriangle, TrendingUp, Users, Cpu, HardDrive, Zap, Clock } from 'lucide-react';
import { projects, serverInfo, teamMembers, changelog } from '../data';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="mc-card p-5 flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-[#7D8590]">{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color }}>{sub}</div>}
      </div>
    </div>
  );
}

export function Overview() {
  const allTasks = projects.flatMap(p => p.tasks);
  const activeTasks = allTasks.filter(t => t.status === 'in-progress').length;
  const doneTasks = allTasks.filter(t => t.status === 'done').length;
  const criticalTasks = allTasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in-progress').length;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome banner */}
      <div className="relative rounded border border-[#30363D] overflow-hidden bg-gradient-to-r from-[#0D1F0A] to-[#0D1117] p-6">
        <div className="absolute inset-0 bg-mc-grid bg-mc-grid opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-mc-green rounded-full animate-pulse" />
            <span className="text-mc-green text-xs font-semibold tracking-widest uppercase">Serveur en ligne</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">REBORNMC Dev Dashboard</h2>
          <p className="text-[#7D8590] text-sm">Minecraft Java 1.21.8 · {activeProjects} projets actifs · {activeTasks} tâches en cours</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[120px] leading-none opacity-5 font-bold text-white select-none">MC</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Code} label="Projets actifs" value={activeProjects} sub={`sur ${projects.length} total`} color="#5DA832" />
        <StatCard icon={CheckCircle} label="Tâches terminées" value={doneTasks} sub={`sur ${allTasks.length} total`} color="#3EEEFF" />
        <StatCard icon={AlertTriangle} label="Tâches critiques" value={criticalTasks} sub="à traiter" color="#CC0000" />
        <StatCard icon={Users} label="Membres équipe" value={teamMembers.length} sub="développeurs" color="#FFAA00" />
      </div>

      {/* Server status + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server status */}
        <div className="mc-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server size={16} className="text-mc-green" />
            <h3 className="text-white font-semibold">Statut Serveur</h3>
            <span className="ml-auto text-xs bg-mc-green/20 text-mc-green px-2 py-0.5 rounded border border-mc-green/30">EN LIGNE</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7D8590] flex items-center gap-2"><Users size={13} />Joueurs</span>
              <span className="text-white font-mono">{serverInfo.players.current}<span className="text-[#3D444D]">/{serverInfo.players.max}</span></span>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-[#7D8590] flex items-center gap-2"><HardDrive size={13} />RAM</span>
                <span className="text-white font-mono">{serverInfo.ram.used}GB / {serverInfo.ram.max}GB</span>
              </div>
              <ProgressBar value={Math.round((serverInfo.ram.used / serverInfo.ram.max) * 100)} showLabel={false} size="sm" color="#3EEEFF" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7D8590] flex items-center gap-2"><Cpu size={13} />TPS</span>
              <span className="text-mc-green font-mono font-bold">{serverInfo.tps} / 20</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7D8590] flex items-center gap-2"><Clock size={13} />Uptime</span>
              <span className="text-white font-mono">{serverInfo.uptime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7D8590] flex items-center gap-2"><Zap size={13} />Version</span>
              <span className="text-mc-diamond font-mono">{serverInfo.version}</span>
            </div>
          </div>
        </div>

        {/* Projects progress */}
        <div className="mc-card p-5 col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-mc-green" />
            <h3 className="text-white font-semibold">Avancement des Projets</h3>
          </div>
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{project.name}</span>
                    <StatusBadge type="project" value={project.status} />
                  </div>
                  <span className="text-xs text-[#7D8590]">v{project.version}</span>
                </div>
                <ProgressBar value={project.progress} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent changelog */}
      <div className="mc-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-mc-green" />
          <h3 className="text-white font-semibold">Dernières Mises à Jour</h3>
        </div>
        <div className="space-y-3">
          {changelog.slice(0, 4).map(entry => (
            <div key={entry.id} className="flex items-start gap-4 p-3 bg-[#0D1117] rounded border border-[#21262D] hover:border-[#30363D] transition-colors">
              <div className={`text-xs px-2 py-0.5 rounded font-mono font-bold mt-0.5 ${
                entry.type === 'hotfix' ? 'bg-red-900/30 text-mc-redstone border border-mc-redstone/30' :
                entry.type === 'major' ? 'bg-mc-green/20 text-mc-green border border-mc-green/30' :
                entry.type === 'minor' ? 'bg-mc-diamond/10 text-mc-diamond border border-mc-diamond/30' :
                'bg-[#21262D] text-[#7D8590] border border-[#30363D]'
              }`}>
                {entry.type.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-semibold">{entry.projectName}</span>
                  <span className="text-mc-green text-xs font-mono">v{entry.version}</span>
                </div>
                <div className="text-xs text-[#7D8590]">{entry.changes.length} changement{entry.changes.length > 1 ? 's' : ''} · {entry.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
