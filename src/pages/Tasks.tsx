import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Eye, AlertCircle } from 'lucide-react';
import { projects, teamMembers } from '../data';
import { StatusBadge } from '../components/StatusBadge';
import type { Task, TaskStatus } from '../types';

const columns: { status: TaskStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'todo',        label: 'À faire',   icon: Circle,       color: '#7F7F7F' },
  { status: 'in-progress', label: 'En cours',  icon: Clock,        color: '#3EEEFF' },
  { status: 'review',      label: 'Review',    icon: Eye,          color: '#FFAA00' },
  { status: 'done',        label: 'Terminé',   icon: CheckCircle2, color: '#5DA832' },
];

function TaskCard({ task }: { task: Task & { projectName: string } }) {
  const assignee = task.assignee ? teamMembers.find(m => m.id === task.assignee) : null;

  return (
    <div className={`p-3 bg-[#0D1117] rounded border border-[#21262D] hover:border-[#30363D] transition-all duration-150 group ${task.status === 'done' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-sm font-medium flex-1 leading-snug ${task.status === 'done' ? 'line-through text-[#3D444D]' : 'text-white'}`}>
          {task.title}
        </span>
        {task.priority === 'critical' && (
          <AlertCircle size={13} className="text-mc-redstone flex-shrink-0 mt-0.5" />
        )}
      </div>
      <div className="text-xs text-[#5DA832] mb-2 font-medium">{task.projectName}</div>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {task.labels.map(l => (
          <span key={l} className="text-xs px-1.5 py-0.5 bg-[#161B22] text-[#7D8590] rounded border border-[#30363D]">
            {l}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge type="priority" value={task.priority} />
        {assignee && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: assignee.color }}>
            <div className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: `${assignee.color}20`, border: `1px solid ${assignee.color}40`, fontSize: '9px' }}>
              {assignee.avatar}
            </div>
            <span className="hidden group-hover:inline text-[#7D8590]">{assignee.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Tasks() {
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const allTasks = projects.flatMap(p =>
    p.tasks.map(t => ({ ...t, projectName: p.name }))
  );

  const filtered = projectFilter === 'all'
    ? allTasks
    : allTasks.filter(t => t.projectId === projectFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Project filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setProjectFilter('all')}
          className={`px-3 py-1.5 rounded text-sm border transition-all ${projectFilter === 'all' ? 'bg-mc-green/20 text-mc-green border-mc-green/50' : 'bg-[#161B22] text-[#7D8590] border-[#30363D] hover:text-white'}`}
        >
          Tous les projets
        </button>
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => setProjectFilter(p.id)}
            className={`px-3 py-1.5 rounded text-sm border transition-all ${projectFilter === p.id ? 'bg-mc-green/20 text-mc-green border-mc-green/50' : 'bg-[#161B22] text-[#7D8590] border-[#30363D] hover:text-white'}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const Icon = col.icon;
          const colTasks = filtered.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="bg-[#161B22] rounded border border-[#21262D] overflow-hidden">
              {/* Column header */}
              <div className="px-4 py-3 border-b border-[#21262D] flex items-center gap-2">
                <Icon size={14} style={{ color: col.color }} />
                <span className="text-sm font-semibold text-white">{col.label}</span>
                <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${col.color}20`, color: col.color, border: `1px solid ${col.color}30` }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="p-3 space-y-2 min-h-[120px]">
                {colTasks.length === 0 ? (
                  <div className="text-center py-8 text-[#3D444D] text-xs">Aucune tâche</div>
                ) : (
                  colTasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map(col => {
          const count = filtered.filter(t => t.status === col.status).length;
          return (
            <div key={col.status} className="mc-card p-4 text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: col.color }}>{count}</div>
              <div className="text-xs text-[#7D8590]">{col.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
