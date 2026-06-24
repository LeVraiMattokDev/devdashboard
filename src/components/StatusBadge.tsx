import type { ProjectStatus, Priority, TaskStatus } from '../types';

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  active:       { label: 'Actif',        color: '#5DA832', bg: 'rgba(93,168,50,0.15)' },
  'in-progress':{ label: 'En cours',     color: '#3EEEFF', bg: 'rgba(62,238,255,0.1)' },
  planned:      { label: 'Planifié',     color: '#FFAA00', bg: 'rgba(255,170,0,0.1)' },
  completed:    { label: 'Terminé',      color: '#7F7F7F', bg: 'rgba(127,127,127,0.15)' },
  'on-hold':    { label: 'En pause',     color: '#CC0000', bg: 'rgba(204,0,0,0.15)' },
};

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critique',  color: '#CC0000', bg: 'rgba(204,0,0,0.15)' },
  high:     { label: 'Haute',     color: '#FFAA00', bg: 'rgba(255,170,0,0.1)' },
  medium:   { label: 'Moyenne',   color: '#3EEEFF', bg: 'rgba(62,238,255,0.1)' },
  low:      { label: 'Basse',     color: '#7F7F7F', bg: 'rgba(127,127,127,0.15)' },
};

const taskStatusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo:        { label: 'À faire',    color: '#7F7F7F', bg: 'rgba(127,127,127,0.15)' },
  'in-progress':{ label: 'En cours', color: '#3EEEFF', bg: 'rgba(62,238,255,0.1)' },
  review:      { label: 'Review',     color: '#FFAA00', bg: 'rgba(255,170,0,0.1)' },
  done:        { label: 'Terminé',    color: '#5DA832', bg: 'rgba(93,168,50,0.15)' },
};

interface StatusBadgeProps {
  type: 'project' | 'priority' | 'task';
  value: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ type, value, size = 'sm' }: StatusBadgeProps) {
  const config = type === 'project'
    ? statusConfig[value as ProjectStatus]
    : type === 'priority'
    ? priorityConfig[value as Priority]
    : taskStatusConfig[value as TaskStatus];

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
      style={{ color: config.color, backgroundColor: config.bg, border: `1px solid ${config.color}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
