import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Circle, Clock, Eye, Plus, Pencil, Trash2, X,
  Calendar, Search,
} from 'lucide-react';
import { tasks as tasksApi, projects as projectsApi, team as teamApi } from '../api';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import type { Task, TaskStatus, Priority, Project, TeamMember } from '../types';

// ── Config ────────────────────────────────────────────────────────────────────

const PRIO: Record<Priority, { label: string; color: string }> = {
  critical: { label: 'Critique', color: '#CC0000' },
  high:     { label: 'Haute',    color: '#FF6B35' },
  medium:   { label: 'Moyenne',  color: '#FFAA00' },
  low:      { label: 'Basse',    color: '#3EEEFF' },
};

const COLS: { status: TaskStatus; label: string; Icon: React.ElementType; color: string }[] = [
  { status: 'todo',        label: 'À faire',  Icon: Circle,       color: '#6B7280' },
  { status: 'in-progress', label: 'En cours', Icon: Clock,        color: '#3EEEFF' },
  { status: 'review',      label: 'Review',   Icon: Eye,          color: '#FFAA00' },
  { status: 'done',        label: 'Terminé',  Icon: CheckCircle2, color: '#5DA832' },
];

const STATUS_OPTS: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
const PRIO_OPTS: Priority[] = ['critical', 'high', 'medium', 'low'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function isOverdue(due?: string, status?: string) {
  return !!due && status !== 'done' && new Date(due) < new Date();
}

// ── Form modal ────────────────────────────────────────────────────────────────

interface FormData {
  title: string; description: string; status: TaskStatus; priority: Priority;
  projectId: string; assigneeId: string; dueDate: string; labels: string;
}

function FormModal({ initial, heading, projects, members, onSave, onClose }: {
  initial: FormData; heading: string; projects: Project[]; members: TeamMember[];
  onSave: (d: FormData) => Promise<void>; onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Le titre est requis'); return; }
    if (!form.projectId) { setError('Le projet est requis'); return; }
    setLoading(true); setError('');
    try { await onSave(form); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setLoading(false); }
  }

  const inputCls = 'w-full bg-[#0D1117] border border-[#30363D] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-mc-green transition-colors';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
          <h3 className="text-white font-semibold">{heading}</h3>
          <button onClick={onClose} className="text-[#7D8590] hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-[#7D8590] mb-1 block">Titre *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required autoFocus className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-[#7D8590] mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className={inputCls + ' resize-none'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#7D8590] mb-1 block">Projet *</label>
              <select value={form.projectId} onChange={e => set('projectId', e.target.value)} required className={inputCls + ' appearance-none'}>
                <option value="">— Choisir —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] mb-1 block">Assigné à</label>
              <select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)} className={inputCls + ' appearance-none'}>
                <option value="">— Personne —</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] mb-1 block">Statut</label>
              <select value={form.status} onChange={e => set('status', e.target.value as TaskStatus)} className={inputCls + ' appearance-none'}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{COLS.find(c => c.status === s)?.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] mb-1 block">Priorité</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value as Priority)} className={inputCls + ' appearance-none'}>
                {PRIO_OPTS.map(p => <option key={p} value={p}>{PRIO[p].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] mb-1 block">Échéance</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-[#7D8590] mb-1 block">Labels</label>
              <input value={form.labels} onChange={e => set('labels', e.target.value)} placeholder="api, backend" className={inputCls} />
            </div>
          </div>
          {error && <p className="text-mc-redstone text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#21262D] text-[#7D8590] rounded-md text-sm hover:text-white transition-colors">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-mc-green text-white rounded-md text-sm font-medium hover:bg-[#4a8a26] transition-colors disabled:opacity-50">
              {loading ? '...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({ task, members, canEdit, onEdit, onDelete, onClose }: {
  task: Task & { projectName?: string }; members: TeamMember[];
  canEdit: boolean; onEdit: () => void; onDelete: () => void; onClose: () => void;
}) {
  const prio = PRIO[task.priority];
  const col = COLS.find(c => c.status === task.status)!;
  const assignee = task.assignee ? members.find(m => m.id === task.assignee) : null;
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg w-full max-w-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full" style={{ backgroundColor: prio.color }} />
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ color: prio.color, backgroundColor: `${prio.color}18` }}>{prio.label}</span>
            <span className="text-[11px] px-2 py-0.5 rounded"
              style={{ color: col.color, backgroundColor: `${col.color}18` }}>{col.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <button onClick={onEdit}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-[#21262D] text-[#7D8590] hover:text-white transition-colors">
                  <Pencil size={11} /> Modifier
                </button>
                <button onClick={onDelete}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-[#CC000018] text-mc-redstone hover:bg-[#CC000030] transition-colors">
                  <Trash2 size={11} /> Supprimer
                </button>
              </>
            )}
            <button onClick={onClose} className="text-[#7D8590] hover:text-white transition-colors ml-1"><X size={15} /></button>
          </div>
        </div>
        <div className="p-5">
          <h2 className="text-white font-semibold text-lg mb-2">{task.title}</h2>
          {task.description
            ? <p className="text-[#7D8590] text-sm leading-relaxed mb-4 whitespace-pre-wrap">{task.description}</p>
            : <p className="text-[#3D444D] text-sm italic mb-4">Aucune description</p>}
          <div className="grid grid-cols-2 gap-3">
            {task.projectName && (
              <div className="bg-[#0D1117] rounded-md p-3 border border-[#21262D]">
                <div className="text-[10px] text-[#7D8590] uppercase tracking-wider mb-1">Projet</div>
                <div className="text-sm text-[#5DA832] font-medium">{task.projectName}</div>
              </div>
            )}
            {assignee && (
              <div className="bg-[#0D1117] rounded-md p-3 border border-[#21262D]">
                <div className="text-[10px] text-[#7D8590] uppercase tracking-wider mb-1">Assigné à</div>
                <div className="flex items-center gap-2">
                  <Avatar value={assignee.avatar} color={assignee.color} size={20} />
                  <span className="text-sm text-white">{assignee.name}</span>
                </div>
              </div>
            )}
            {task.dueDate && (
              <div className="bg-[#0D1117] rounded-md p-3 border border-[#21262D]">
                <div className="text-[10px] text-[#7D8590] uppercase tracking-wider mb-1">Échéance</div>
                <div className={`text-sm font-medium ${overdue ? 'text-mc-redstone' : 'text-white'}`}>
                  {fmtDate(task.dueDate)}{overdue && ' · En retard'}
                </div>
              </div>
            )}
            {(task.labels ?? []).length > 0 && (
              <div className="bg-[#0D1117] rounded-md p-3 border border-[#21262D]">
                <div className="text-[10px] text-[#7D8590] uppercase tracking-wider mb-1.5">Labels</div>
                <div className="flex flex-wrap gap-1">
                  {(task.labels ?? []).map(l => (
                    <span key={l} className="text-[10px] px-1.5 py-0.5 bg-[#161B22] text-[#7D8590] rounded border border-[#30363D]">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────

function TaskCard({ task, members, canEdit, isDragging, onDragStart, onDragEnd, onClick, onEdit, onDelete }: {
  task: Task & { projectName?: string }; members: TeamMember[]; canEdit: boolean; isDragging: boolean;
  onDragStart: () => void; onDragEnd: () => void; onClick: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const prio = PRIO[task.priority];
  const assignee = task.assignee ? members.find(m => m.id === task.assignee) : null;
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      draggable={canEdit}
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative bg-[#0D1117] rounded-lg border border-[#21262D] hover:border-[#30363D]
        transition-all duration-150 cursor-pointer select-none overflow-hidden
        ${isDragging ? 'opacity-40 scale-[0.98]' : 'hover:shadow-lg hover:-translate-y-px'}
        ${task.status === 'done' ? 'opacity-60' : ''}`}
      style={{ borderLeft: `3px solid ${prio.color}` }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: prio.color, backgroundColor: `${prio.color}18` }}>{prio.label}</span>
          {canEdit && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onEdit(); }}
                className="p-1 rounded text-[#7D8590] hover:text-white hover:bg-[#21262D] transition-colors">
                <Pencil size={11} />
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete(); }}
                className="p-1 rounded text-[#7D8590] hover:text-mc-redstone hover:bg-[#CC000015] transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          )}
        </div>

        <p className={`text-sm font-medium leading-snug mb-2 ${task.status === 'done' ? 'line-through text-[#3D444D]' : 'text-white'}`}>
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-[#7D8590] mb-2 line-clamp-2 leading-relaxed">{task.description}</p>
        )}

        {(task.labels ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {(task.labels ?? []).slice(0, 3).map(l => (
              <span key={l} className="text-[10px] px-1.5 py-0.5 bg-[#161B22] text-[#7D8590] rounded border border-[#30363D]">{l}</span>
            ))}
            {(task.labels ?? []).length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#161B22] text-[#7D8590] rounded border border-[#30363D]">
                +{(task.labels ?? []).length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#1C2128]">
          {task.projectName
            ? <span className="text-[10px] text-[#5DA832] font-medium truncate">{task.projectName}</span>
            : <span />}
          <div className="flex items-center gap-2 flex-shrink-0">
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-[10px] ${overdue ? 'text-mc-redstone' : 'text-[#7D8590]'}`}>
                <Calendar size={10} />{fmtDate(task.dueDate)}
              </span>
            )}
            {assignee && <Avatar value={assignee.avatar} color={assignee.color} size={20} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function Tasks() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'developer';

  const [allTasks, setAllTasks] = useState<(Task & { projectName?: string })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [prioFilter, setPrioFilter] = useState<Priority | 'all'>('all');

  const [detail, setDetail] = useState<(Task & { projectName?: string }) | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const dropTargetRef = useRef<TaskStatus | null>(null);

  useEffect(() => {
    tasksApi.list().then(setAllTasks).catch(() => {});
    projectsApi.list().then(setProjects).catch(() => {});
    teamApi.list().then(setMembers).catch(() => {});
  }, []);

  const filtered = allTasks.filter(t => {
    const pid = t.projectId ?? t.project_id ?? '';
    if (projectFilter !== 'all' && pid !== projectFilter) return false;
    if (prioFilter !== 'all' && t.priority !== prioFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toForm(t: Task): FormData {
    return {
      title: t.title, description: t.description, status: t.status,
      priority: t.priority, projectId: t.projectId ?? t.project_id ?? '',
      assigneeId: t.assignee ?? '', dueDate: t.dueDate ?? '',
      labels: (t.labels ?? []).join(', '),
    };
  }

  function blankForm(status: TaskStatus): FormData {
    return { title: '', description: '', status, priority: 'medium', projectId: '', assigneeId: '', dueDate: '', labels: '' };
  }

  async function handleCreate(form: FormData) {
    const t = await tasksApi.create({
      title: form.title, description: form.description, status: form.status, priority: form.priority,
      projectId: form.projectId, assignee: form.assigneeId || undefined, dueDate: form.dueDate || undefined,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
    });
    setAllTasks(prev => [...prev, t]);
    setCreateStatus(null);
  }

  async function handleEdit(form: FormData) {
    if (!editing) return;
    const t = await tasksApi.update(editing.id, {
      title: form.title, description: form.description, status: form.status, priority: form.priority,
      projectId: form.projectId, assignee: form.assigneeId || undefined, dueDate: form.dueDate || undefined,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
    });
    setAllTasks(prev => prev.map(x => x.id === t.id ? t : x));
    setEditing(null);
    setDetail(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    await tasksApi.delete(deleting.id);
    setAllTasks(prev => prev.filter(t => t.id !== deleting.id));
    setDeleting(null);
    setDetail(null);
  }

  function handleDragEnd() {
    const status = dropTargetRef.current;
    const taskId = draggingId;
    dropTargetRef.current = null;
    setDraggingId(null);
    setDragOverCol(null);
    if (!status || !taskId || !canEdit) return;
    const task = allTasks.find(t => t.id === taskId);
    if (!task || task.status === status) return;
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    tasksApi.update(taskId, { status }).catch(() => {
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t));
    });
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative min-w-52 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8590]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une tâche..."
            className="w-full pl-9 pr-3 py-2 bg-[#161B22] border border-[#30363D] text-white text-sm rounded-lg
              focus:outline-none focus:border-mc-green transition-colors placeholder-[#3D444D]" />
        </div>

        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
          className="bg-[#161B22] border border-[#30363D] text-sm text-[#7D8590] rounded-lg px-3 py-2
            focus:outline-none focus:border-mc-green transition-colors appearance-none cursor-pointer">
          <option value="all">Tous les projets</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div className="flex items-center gap-1">
          {(['all', ...PRIO_OPTS] as (Priority | 'all')[]).map(p => (
            <button key={p} onClick={() => setPrioFilter(p)}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all border ${
                prioFilter === p
                  ? p === 'all' ? 'bg-[#21262D] text-white border-[#30363D]' : 'border-current'
                  : 'text-[#7D8590] border-transparent hover:text-white'
              }`}
              style={prioFilter === p && p !== 'all' ? {
                color: PRIO[p].color, backgroundColor: `${PRIO[p].color}18`, borderColor: `${PRIO[p].color}50`,
              } : {}}>
              {p === 'all' ? 'Tout' : PRIO[p].label}
            </button>
          ))}
        </div>

        {canEdit && (
          <button onClick={() => setCreateStatus('todo')}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-mc-green text-white rounded-lg text-sm font-medium
              hover:bg-[#4a8a26] transition-colors flex-shrink-0">
            <Plus size={14} /> Nouvelle tâche
          </button>
        )}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.status);
          const isTarget = dragOverCol === col.status && !!draggingId;

          return (
            <div key={col.status}
              className={`flex flex-col rounded-lg border transition-colors duration-150 overflow-hidden ${
                isTarget ? '' : 'border-[#21262D]'
              }`}
              style={isTarget ? { borderColor: `${col.color}60`, backgroundColor: `${col.color}06` } : {}}
              onDragOver={e => { e.preventDefault(); dropTargetRef.current = col.status; setDragOverCol(col.status); }}
              onDrop={e => { e.preventDefault(); }}
            >
              {/* Column header */}
              <div className="px-4 py-3 border-b border-[#21262D] flex items-center gap-2 bg-[#161B22]"
                style={{ borderTop: `3px solid ${col.color}` }}>
                <col.Icon size={14} style={{ color: col.color }} />
                <span className="text-sm font-semibold text-white">{col.label}</span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${col.color}20`, color: col.color }}>
                  {colTasks.length}
                </span>
                {canEdit && (
                  <button onClick={() => setCreateStatus(col.status)}
                    className="ml-auto p-1 rounded text-[#3D444D] hover:text-white hover:bg-[#21262D] transition-colors">
                    <Plus size={13} />
                  </button>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-2 min-h-[180px]">
                {colTasks.map(task => (
                  <TaskCard key={task.id} task={task} members={members} canEdit={canEdit}
                    isDragging={draggingId === task.id}
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setDetail(task)}
                    onEdit={() => { setEditing(task); setDetail(null); }}
                    onDelete={() => setDeleting(task)}
                  />
                ))}
                {colTasks.length === 0 && !isTarget && (
                  <div className="flex items-center justify-center h-20 text-[#3D444D] text-xs">
                    Aucune tâche
                  </div>
                )}
                {isTarget && (
                  <div className="h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-xs"
                    style={{ borderColor: `${col.color}50`, color: col.color }}>
                    Déposer ici
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {detail && !editing && (
        <DetailModal task={detail} members={members} canEdit={canEdit}
          onEdit={() => { setEditing(detail); setDetail(null); }}
          onDelete={() => { setDeleting(detail); setDetail(null); }}
          onClose={() => setDetail(null)} />
      )}
      {(editing || createStatus !== null) && (
        <FormModal
          heading={editing ? 'Modifier la tâche' : 'Nouvelle tâche'}
          initial={editing ? toForm(editing) : blankForm(createStatus ?? 'todo')}
          projects={projects} members={members}
          onSave={editing ? handleEdit : handleCreate}
          onClose={() => { setEditing(null); setCreateStatus(null); }}
        />
      )}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-white font-semibold mb-2">Supprimer la tâche</h3>
            <p className="text-[#7D8590] text-sm mb-5">
              Supprimer <strong className="text-white">{deleting.title}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleting(null)}
                className="flex-1 px-4 py-2 bg-[#21262D] text-[#7D8590] rounded-md text-sm hover:text-white transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-mc-redstone text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
