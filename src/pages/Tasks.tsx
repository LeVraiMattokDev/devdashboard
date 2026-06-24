import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Eye, AlertCircle, Plus, Pencil, Trash2, X } from 'lucide-react';
import { tasks as tasksApi, projects as projectsApi, team as teamApi } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import type { Task, TaskStatus, Priority, Project, TeamMember } from '../types';

const columns: { status: TaskStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'todo',        label: 'À faire',  icon: Circle,       color: '#7F7F7F' },
  { status: 'in-progress', label: 'En cours', icon: Clock,        color: '#3EEEFF' },
  { status: 'review',      label: 'Review',   icon: Eye,          color: '#FFAA00' },
  { status: 'done',        label: 'Terminé',  icon: CheckCircle2, color: '#5DA832' },
];

const priorityOptions: Priority[] = ['critical', 'high', 'medium', 'low'];
const statusOptions: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

interface TaskFormData {
  title: string; description: string; status: TaskStatus; priority: Priority;
  projectId: string; assigneeId: string; dueDate: string; labels: string;
}

const defaultForm: TaskFormData = {
  title: '', description: '', status: 'todo', priority: 'medium',
  projectId: '', assigneeId: '', dueDate: '', labels: '',
};

function TaskFormModal({ initial, title, projects, members, onSave, onClose }: {
  initial: TaskFormData; title: string; projects: Project[]; members: TeamMember[];
  onSave: (d: TaskFormData) => Promise<void>; onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof TaskFormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Le titre est requis'); return; }
    if (!form.projectId) { setError('Le projet est requis'); return; }
    setLoading(true); setError('');
    try { await onSave(form); } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161B22] border border-[#30363D] rounded w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#21262D]">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-[#7D8590] hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="text-xs text-[#7D8590] block mb-1">Titre *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
          </div>
          <div>
            <label className="text-xs text-[#7D8590] block mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Projet *</label>
              <select value={form.projectId} onChange={e => set('projectId', e.target.value)} required
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                <option value="">— Choisir —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Assigné à</label>
              <select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                <option value="">— Personne —</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Statut</label>
              <select value={form.status} onChange={e => set('status', e.target.value as TaskStatus)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Priorité</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value as Priority)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Échéance</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Labels (virgules)</label>
              <input value={form.labels} onChange={e => set('labels', e.target.value)} placeholder="api, backend"
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
          </div>
          {error && <p className="text-mc-redstone text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-3 py-2 bg-[#21262D] text-[#7D8590] rounded text-sm hover:text-white transition-colors">Annuler</button>
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

function TaskCard({ task, members, canEdit, onEdit, onDelete }: {
  task: Task & { projectName?: string }; members: TeamMember[]; canEdit: boolean;
  onEdit: (t: Task) => void; onDelete: (t: Task) => void;
}) {
  const assignee = task.assignee ? members.find(m => m.id === task.assignee) : null;

  return (
    <div className={`p-3 bg-[#0D1117] rounded border border-[#21262D] hover:border-[#30363D] transition-all duration-150 group ${task.status === 'done' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-sm font-medium flex-1 leading-snug ${task.status === 'done' ? 'line-through text-[#3D444D]' : 'text-white'}`}>
          {task.title}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {task.priority === 'critical' && <AlertCircle size={13} className="text-mc-redstone" />}
          {canEdit && (
            <>
              <button onClick={() => onEdit(task)} className="p-0.5 text-[#3D444D] hover:text-white transition-colors"><Pencil size={11} /></button>
              <button onClick={() => onDelete(task)} className="p-0.5 text-[#3D444D] hover:text-mc-redstone transition-colors"><Trash2 size={11} /></button>
            </>
          )}
        </div>
      </div>
      {task.projectName && <div className="text-xs text-[#5DA832] mb-2 font-medium">{task.projectName}</div>}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {(task.labels ?? []).map(l => (
          <span key={l} className="text-xs px-1.5 py-0.5 bg-[#161B22] text-[#7D8590] rounded border border-[#30363D]">{l}</span>
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
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'developer';
  const [taskList, setTaskList] = useState<(Task & { projectName?: string })[]>([]);
  const [projectList, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  useEffect(() => {
    tasksApi.list().then(setTaskList).catch(() => {});
    projectsApi.list().then(setProjects).catch(() => {});
    teamApi.list().then(setMembers).catch(() => {});
  }, []);

  const filtered = projectFilter === 'all'
    ? taskList
    : taskList.filter(t => (t.projectId ?? t.project_id) === projectFilter);

  function toFormData(t: Task): TaskFormData {
    return {
      title: t.title, description: t.description, status: t.status,
      priority: t.priority, projectId: t.projectId ?? t.project_id ?? '',
      assigneeId: t.assignee ?? '', dueDate: t.dueDate ?? '',
      labels: (t.labels ?? []).join(', '),
    };
  }

  async function handleCreate(form: TaskFormData) {
    const t = await tasksApi.create({
      title: form.title, description: form.description, status: form.status,
      priority: form.priority, projectId: form.projectId,
      assignee: form.assigneeId || undefined, dueDate: form.dueDate || undefined,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
    });
    setTaskList(prev => [...prev, t]);
    setShowForm(false);
  }

  async function handleEdit(form: TaskFormData) {
    if (!editing) return;
    const t = await tasksApi.update(editing.id, {
      title: form.title, description: form.description, status: form.status,
      priority: form.priority, projectId: form.projectId,
      assignee: form.assigneeId || undefined, dueDate: form.dueDate || undefined,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
    });
    setTaskList(prev => prev.map(x => x.id === t.id ? t : x));
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    await tasksApi.delete(deleting.id);
    setTaskList(prev => prev.filter(t => t.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Project filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setProjectFilter('all')}
          className={`px-3 py-1.5 rounded text-sm border transition-all ${projectFilter === 'all' ? 'bg-mc-green/20 text-mc-green border-mc-green/50' : 'bg-[#161B22] text-[#7D8590] border-[#30363D] hover:text-white'}`}>
          Tous les projets
        </button>
        {projectList.map(p => (
          <button key={p.id} onClick={() => setProjectFilter(p.id)}
            className={`px-3 py-1.5 rounded text-sm border transition-all ${projectFilter === p.id ? 'bg-mc-green/20 text-mc-green border-mc-green/50' : 'bg-[#161B22] text-[#7D8590] border-[#30363D] hover:text-white'}`}>
            {p.name}
          </button>
        ))}
        {canEdit && (
          <button onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-mc-green text-white rounded text-sm font-medium hover:bg-[#4a8a26] transition-colors">
            <Plus size={14} /> Nouvelle tâche
          </button>
        )}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const Icon = col.icon;
          const colTasks = filtered.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="bg-[#161B22] rounded border border-[#21262D] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#21262D] flex items-center gap-2">
                <Icon size={14} style={{ color: col.color }} />
                <span className="text-sm font-semibold text-white">{col.label}</span>
                <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${col.color}20`, color: col.color, border: `1px solid ${col.color}30` }}>
                  {colTasks.length}
                </span>
              </div>
              <div className="p-3 space-y-2 min-h-[120px]">
                {colTasks.length === 0 ? (
                  <div className="text-center py-8 text-[#3D444D] text-xs">Aucune tâche</div>
                ) : (
                  colTasks.map(task => (
                    <TaskCard key={task.id} task={task} members={members} canEdit={canEdit}
                      onEdit={t => setEditing(t)} onDelete={t => setDeleting(t)} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col.status} className="mc-card p-4 text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: col.color }}>
              {filtered.filter(t => t.status === col.status).length}
            </div>
            <div className="text-xs text-[#7D8590]">{col.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <TaskFormModal title="Nouvelle tâche" initial={defaultForm}
          projects={projectList} members={members}
          onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <TaskFormModal title="Modifier la tâche" initial={toFormData(editing)}
          projects={projectList} members={members}
          onSave={handleEdit} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded w-full max-w-sm p-6">
            <h3 className="text-white font-semibold mb-2">Supprimer la tâche</h3>
            <p className="text-[#7D8590] text-sm mb-4">Supprimer <strong className="text-white">{deleting.title}</strong> ?</p>
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
