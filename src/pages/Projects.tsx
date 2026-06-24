import { useState } from 'react';
import { FolderOpen, Tag, GitBranch, Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { projects } from '../data';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { teamMembers } from '../data';
import type { ProjectStatus, PluginCategory } from '../types';

const categoryLabels: Record<PluginCategory, string> = {
  gameplay: 'Gameplay',
  economy: 'Économie',
  moderation: 'Modération',
  utility: 'Utilitaire',
  pvp: 'PvP',
  world: 'Monde',
};

const categoryColors: Record<PluginCategory, string> = {
  gameplay: '#5DA832',
  economy: '#FFAA00',
  moderation: '#CC0000',
  utility: '#7F7F7F',
  pvp: '#3EEEFF',
  world: '#866043',
};

function ProjectCard({ project }: { project: typeof projects[0] }) {
  const [expanded, setExpanded] = useState(false);
  const members = project.assignees.map(id => teamMembers.find(m => m.id === id)).filter(Boolean);
  const doneTasks = project.tasks.filter(t => t.status === 'done').length;

  return (
    <div className="mc-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex items-center justify-center rounded flex-shrink-0"
              style={{ backgroundColor: `${categoryColors[project.category]}20`, border: `1px solid ${categoryColors[project.category]}40` }}>
              <FolderOpen size={18} style={{ color: categoryColors[project.category] }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-base truncate">{project.name}</h3>
              <span className="text-xs text-[#7D8590]">{categoryLabels[project.category]}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge type="priority" value={project.priority} />
            <StatusBadge type="project" value={project.status} />
          </div>
        </div>

        <p className="text-[#7D8590] text-sm mb-4 leading-relaxed">{project.description}</p>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#7D8590]">Progression</span>
            <span className="text-xs text-[#7D8590]">{doneTasks}/{project.tasks.length} tâches</span>
          </div>
          <ProgressBar value={project.progress} size="md" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[#7D8590]">
            <span className="flex items-center gap-1.5">
              <GitBranch size={12} />
              <span className="font-mono text-mc-green">v{project.version}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {project.updatedAt}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {members.map(m => m && (
              <div key={m.id} title={m.name}
                className="w-7 h-7 rounded text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: `${m.color}25`, color: m.color, border: `1px solid ${m.color}40` }}>
                {m.avatar}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-[#21262D] text-[#7D8590] rounded border border-[#30363D] flex items-center gap-1">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Tasks collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2.5 bg-[#0D1117] border-t border-[#21262D] text-xs text-[#7D8590] flex items-center gap-2 hover:text-white hover:bg-[#161B22] transition-colors"
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {project.tasks.length} tâches
        {project.githubUrl && (
          <span className="ml-auto flex items-center gap-1 text-mc-diamond hover:underline">
            <ExternalLink size={11} /> GitHub
          </span>
        )}
      </button>

      {expanded && (
        <div className="bg-[#0D1117] border-t border-[#21262D] p-4 space-y-2">
          {project.tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2.5 bg-[#161B22] rounded border border-[#21262D] text-sm">
              <StatusBadge type="task" value={task.status} />
              <span className={`flex-1 ${task.status === 'done' ? 'line-through text-[#3D444D]' : 'text-white'}`}>
                {task.title}
              </span>
              <StatusBadge type="priority" value={task.priority} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const statusFilters: { value: 'all' | ProjectStatus; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'planned', label: 'Planifié' },
  { value: 'completed', label: 'Terminé' },
];

export function Projects() {
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all duration-150 border ${
              filter === f.value
                ? 'bg-mc-green/20 text-mc-green border-mc-green/50'
                : 'bg-[#161B22] text-[#7D8590] border-[#30363D] hover:text-white hover:border-[#7D8590]'
            }`}
          >
            {f.label}
            <span className="ml-2 text-xs opacity-60">
              {f.value === 'all' ? projects.length : projects.filter(p => p.status === f.value).length}
            </span>
          </button>
        ))}
        <div className="ml-auto text-xs text-[#7D8590]">
          {filtered.length} projet{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
