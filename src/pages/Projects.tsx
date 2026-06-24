import { useState, useEffect } from 'react';
import { FolderOpen, Tag, GitBranch, Calendar, ChevronDown, ChevronUp, ExternalLink, Plus, Pencil, Trash2, X } from 'lucide-react';
import { projects as projectsApi, team as teamApi } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import type { Project, ProjectStatus, PluginCategory, Priority, TeamMember } from '../types';

const categoryLabels: Record<PluginCategory, string> = {
  gameplay: 'Gameplay', economy: 'Économie', moderation: 'Modération',
  utility: 'Utilitaire', pvp: 'PvP', world: 'Monde',
};

const categoryColors: Record<PluginCategory, string> = {
  gameplay: '#5DA832', economy: '#FFAA00', moderation: '#CC0000',
  utility: '#7F7F7F', pvp: '#3EEEFF', world: '#866043',
};

const statusOptions: ProjectStatus[] = ['active', 'in-progress', 'planned', 'completed', 'on-hold'];
const priorityOptions: Priority[] = ['critical', 'high', 'medium', 'low'];
const categoryOptions = Object.keys(categoryLabels) as PluginCategory[];

interface ProjectFormData {
  name: string; description: string; status: ProjectStatus; priority: Priority;
  progress: number; category: PluginCategory; version: string; mcVersion: string;
  tags: string; githubUrl: string;
}

const defaultForm: ProjectFormData = {
  name: '', description: '', status: 'planned', priority: 'medium',
  progress: 0, category: 'gameplay', version: '1.0.0', mcVersion: '1.21.8',
  tags: '', githubUrl: '',
};

function ProjectForm({ initial, onSave, onClose, title }: {
  initial: ProjectFormData; onSave: (d: ProjectFormData) => Promise<void>; onClose: () => void; title: string;
}) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof ProjectFormData, value: string | number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom est requis'); return; }
    setLoading(true);
    setError('');
    try { await onSave(form); } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#30363D] rounded w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-4 border-b border-[#21262D]">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-[#7D8590] hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-[#7D8590] block mb-1">Nom *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#7D8590] block mb-1">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green resize-none" />
            </div>
            {([
              ['Statut', 'status', statusOptions],
              ['Priorité', 'priority', priorityOptions],
              ['Catégorie', 'category', categoryOptions],
            ] as [string, keyof ProjectFormData, string[]][]).map(([label, field, opts]) => (
              <div key={field}>
                <label className="text-xs text-[#7D8590] block mb-1">{label}</label>
                <select value={form[field] as string} onChange={e => set(field, e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Progression ({form.progress}%)</label>
              <input type="range" min={0} max={100} value={form.progress}
                onChange={e => set('progress', parseInt(e.target.value))}
                className="w-full accent-mc-green" />
            </div>
            {[
              ['Version plugin', 'version'],
              ['Version MC', 'mcVersion'],
              ['GitHub URL', 'githubUrl'],
            ].map(([label, field]) => (
              <div key={field} className={field === 'githubUrl' ? 'col-span-2' : ''}>
                <label className="text-xs text-[#7D8590] block mb-1">{label}</label>
                <input value={form[field as keyof ProjectFormData] as string}
                  onChange={e => set(field as keyof ProjectFormData, e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-xs text-[#7D8590] block mb-1">Tags (séparés par virgules)</label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)}
                placeholder="pvp, combat, 1.21"
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
          </div>
          {error && <p className="text-mc-redstone text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-3 py-2 bg-[#21262D] text-[#7D8590] rounded text-sm hover:text-white transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-3 py-2 bg-mc-green text-white rounded text-sm hover:bg-[#4a8a26] transition-colors disabled:opacity-50">
              {loading ? '...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectCard({ project, members, canEdit, onEdit, onDelete }: {
  project: Project; members: TeamMember[]; canEdit: boolean;
  onEdit: (p: Project) => void; onDelete: (p: Project) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const assignees = project.assignees
    .map(id => members.find(m => m.id === id))
    .filter(Boolean) as TeamMember[];
  const doneTasks = (project.tasks ?? []).filter(t => t.status === 'done').length;

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
            {canEdit && (
              <>
                <button onClick={() => onEdit(project)} className="p-1 text-[#7D8590] hover:text-white transition-colors"><Pencil size={13} /></button>
                <button onClick={() => onDelete(project)} className="p-1 text-[#7D8590] hover:text-mc-redstone transition-colors"><Trash2 size={13} /></button>
              </>
            )}
          </div>
        </div>

        <p className="text-[#7D8590] text-sm mb-4 leading-relaxed">{project.description}</p>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#7D8590]">Progression</span>
            <span className="text-xs text-[#7D8590]">{doneTasks}/{(project.tasks ?? []).length} tâches</span>
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
              {project.updatedAt ?? project.updated_at ?? '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {assignees.map(m => (
              <div key={m.id} title={m.name}
                className="w-7 h-7 rounded text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: `${m.color}25`, color: m.color, border: `1px solid ${m.color}40` }}>
                {m.avatar}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {(project.tags ?? []).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-[#21262D] text-[#7D8590] rounded border border-[#30363D] flex items-center gap-1">
              <Tag size={10} />{tag}
            </span>
          ))}
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2.5 bg-[#0D1117] border-t border-[#21262D] text-xs text-[#7D8590] flex items-center gap-2 hover:text-white hover:bg-[#161B22] transition-colors">
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {(project.tasks ?? []).length} tâches
        {(project.githubUrl ?? project.github_url) && (
          <a href={project.githubUrl ?? project.github_url ?? '#'} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="ml-auto flex items-center gap-1 text-mc-diamond hover:underline">
            <ExternalLink size={11} /> GitHub
          </a>
        )}
      </button>

      {expanded && (
        <div className="bg-[#0D1117] border-t border-[#21262D] p-4 space-y-2">
          {(project.tasks ?? []).map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2.5 bg-[#161B22] rounded border border-[#21262D] text-sm">
              <StatusBadge type="task" value={task.status} />
              <span className={`flex-1 ${task.status === 'done' ? 'line-through text-[#3D444D]' : 'text-white'}`}>{task.title}</span>
              <StatusBadge type="priority" value={task.priority} />
            </div>
          ))}
          {(project.tasks ?? []).length === 0 && <div className="text-center py-4 text-[#3D444D] text-xs">Aucune tâche</div>}
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
  { value: 'on-hold', label: 'En pause' },
];

export function Projects() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'developer';
  const [projectList, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  useEffect(() => {
    projectsApi.list().then(setProjects).catch(() => {});
    teamApi.list().then(setMembers).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? projectList : projectList.filter(p => p.status === filter);

  async function handleCreate(form: ProjectFormData) {
    const p = await projectsApi.create({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      githubUrl: form.githubUrl || null,
      tasks: [],
      assignees: [],
    });
    setProjects(prev => [...prev, p]);
    setShowForm(false);
  }

  async function handleEdit(form: ProjectFormData) {
    if (!editing) return;
    const p = await projectsApi.update(editing.id, {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      githubUrl: form.githubUrl || null,
    });
    setProjects(prev => prev.map(x => x.id === p.id ? p : x));
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    await projectsApi.delete(deleting.id);
    setProjects(prev => prev.filter(p => p.id !== deleting.id));
    setDeleting(null);
  }

  function toFormData(p: Project): ProjectFormData {
    return {
      name: p.name, description: p.description, status: p.status, priority: p.priority,
      progress: p.progress, category: p.category, version: p.version, mcVersion: p.mcVersion,
      tags: (p.tags ?? []).join(', '), githubUrl: p.githubUrl ?? p.github_url ?? '',
    };
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all duration-150 border ${
              filter === f.value ? 'bg-mc-green/20 text-mc-green border-mc-green/50' : 'bg-[#161B22] text-[#7D8590] border-[#30363D] hover:text-white hover:border-[#7D8590]'}`}>
            {f.label}
            <span className="ml-2 text-xs opacity-60">
              {f.value === 'all' ? projectList.length : projectList.filter(p => p.status === f.value).length}
            </span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[#7D8590]">{filtered.length} projet{filtered.length > 1 ? 's' : ''}</span>
          {canEdit && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-mc-green text-white rounded text-sm font-medium hover:bg-[#4a8a26] transition-colors">
              <Plus size={14} /> Nouveau
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} members={members} canEdit={canEdit}
            onEdit={p => setEditing(p)} onDelete={p => setDeleting(p)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-[#3D444D]">Aucun projet</div>
        )}
      </div>

      {showForm && (
        <ProjectForm title="Nouveau projet" initial={defaultForm}
          onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <ProjectForm title="Modifier le projet" initial={toFormData(editing)}
          onSave={handleEdit} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded w-full max-w-sm p-6">
            <h3 className="text-white font-semibold mb-2">Supprimer le projet</h3>
            <p className="text-[#7D8590] text-sm mb-4">Supprimer <strong className="text-white">{deleting.name}</strong> ? Cette action est irréversible.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleting(null)} className="flex-1 px-3 py-2 bg-[#21262D] text-[#7D8590] rounded text-sm hover:text-white transition-colors">Annuler</button>
              <button onClick={handleDelete} className="flex-1 px-3 py-2 bg-mc-redstone text-white rounded text-sm hover:bg-red-700 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
