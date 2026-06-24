import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Wrench, Trash2, ShieldCheck, X, Pencil } from 'lucide-react';
import { changelog as changelogApi, projects as projectsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { ChangelogEntry, Project } from '../types';

const changeTypeConfig = {
  added:    { icon: Plus,        color: '#5DA832', label: 'Ajout' },
  changed:  { icon: RefreshCw,   color: '#3EEEFF', label: 'Modifié' },
  fixed:    { icon: Wrench,      color: '#FFAA00', label: 'Corrigé' },
  removed:  { icon: Trash2,      color: '#CC0000', label: 'Supprimé' },
  security: { icon: ShieldCheck, color: '#CC0000', label: 'Sécurité' },
};

const releaseTypeConfig = {
  major:  { label: 'MAJEUR', color: '#5DA832', bg: 'rgba(93,168,50,0.15)' },
  minor:  { label: 'MINEUR', color: '#3EEEFF', bg: 'rgba(62,238,255,0.1)' },
  patch:  { label: 'PATCH',  color: '#FFAA00', bg: 'rgba(255,170,0,0.1)' },
  hotfix: { label: 'HOTFIX', color: '#CC0000', bg: 'rgba(204,0,0,0.15)' },
};

type ReleaseType = keyof typeof releaseTypeConfig;
type ChangeType = keyof typeof changeTypeConfig;

interface ChangeItem { type: ChangeType; description: string }

interface EntryForm {
  version: string; date: string; type: ReleaseType;
  projectId: string; projectName: string;
  changes: ChangeItem[];
}

const defaultForm: EntryForm = {
  version: '', date: new Date().toISOString().slice(0, 10),
  type: 'patch', projectId: '', projectName: '', changes: [{ type: 'added', description: '' }],
};

function EntryFormModal({ initial, title, projects, onSave, onClose }: {
  initial: EntryForm; title: string; projects: Project[];
  onSave: (d: EntryForm) => Promise<void>; onClose: () => void;
}) {
  const [form, setForm] = useState<EntryForm>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function setField<K extends keyof EntryForm>(field: K, value: EntryForm[K]) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function onProjectChange(id: string) {
    const p = projects.find(x => x.id === id);
    setForm(f => ({ ...f, projectId: id, projectName: p?.name ?? '' }));
  }

  function setChange(i: number, field: keyof ChangeItem, value: string) {
    setForm(f => ({ ...f, changes: f.changes.map((c, idx) => idx === i ? { ...c, [field]: value } : c) }));
  }

  function addChange() {
    setForm(f => ({ ...f, changes: [...f.changes, { type: 'added', description: '' }] }));
  }

  function removeChange(i: number) {
    setForm(f => ({ ...f, changes: f.changes.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.version.trim() || !form.projectId) { setError('Version et projet sont requis'); return; }
    setLoading(true); setError('');
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
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Version *</label>
              <input value={form.version} onChange={e => setField('version', e.target.value)} required placeholder="1.0.0"
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Type</label>
              <select value={form.type} onChange={e => setField('type', e.target.value as ReleaseType)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                {Object.keys(releaseTypeConfig).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Projet *</label>
              <select value={form.projectId} onChange={e => onProjectChange(e.target.value)} required
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                <option value="">— Choisir —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#7D8590]">Changements</label>
              <button type="button" onClick={addChange} className="text-xs text-mc-green hover:underline flex items-center gap-1">
                <Plus size={11} /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {form.changes.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <select value={c.type} onChange={e => setChange(i, 'type', e.target.value)}
                    className="bg-[#0D1117] border border-[#30363D] text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-mc-green w-28">
                    {Object.keys(changeTypeConfig).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input value={c.description} onChange={e => setChange(i, 'description', e.target.value)}
                    placeholder="Description..."
                    className="flex-1 bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-mc-green" />
                  {form.changes.length > 1 && (
                    <button type="button" onClick={() => removeChange(i)} className="text-[#7D8590] hover:text-mc-redstone">
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
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

export function Changelog() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'developer';
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ChangelogEntry | null>(null);
  const [deleting, setDeleting] = useState<ChangelogEntry | null>(null);

  useEffect(() => {
    changelogApi.list().then(setEntries).catch(() => {});
    projectsApi.list().then(setProjects).catch(() => {});
  }, []);

  function toFormData(e: ChangelogEntry): EntryForm {
    const p = projects.find(x => x.id === (e.projectId ?? e.project_id));
    return {
      version: e.version, date: e.date, type: e.type as ReleaseType,
      projectId: e.projectId ?? e.project_id ?? '', projectName: p?.name ?? e.projectName ?? '',
      changes: e.changes.map(c => ({ type: c.type as ChangeType, description: c.description })),
    };
  }

  async function handleCreate(form: EntryForm) {
    const e = await changelogApi.create({
      version: form.version, date: form.date, type: form.type,
      projectId: form.projectId, projectName: form.projectName, changes: form.changes,
    });
    setEntries(prev => [e, ...prev]);
    setShowForm(false);
  }

  async function handleEdit(form: EntryForm) {
    if (!editing) return;
    const e = await changelogApi.update(editing.id, {
      version: form.version, date: form.date, type: form.type, changes: form.changes,
    });
    setEntries(prev => prev.map(x => x.id === e.id ? e : x));
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    await changelogApi.delete(deleting.id);
    setEntries(prev => prev.filter(e => e.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(releaseTypeConfig).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded font-mono font-bold"
              style={{ color: val.color, backgroundColor: val.bg, border: `1px solid ${val.color}40` }}>
              {val.label}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[#7D8590] text-xs">{entries.length} releases</span>
          {canEdit && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-mc-green text-white rounded text-sm font-medium hover:bg-[#4a8a26] transition-colors">
              <Plus size={14} /> Nouvelle entrée
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[120px] top-0 bottom-0 w-px bg-[#21262D]" />
        <div className="space-y-6">
          {entries.map(entry => {
            const rConfig = releaseTypeConfig[entry.type as ReleaseType] ?? releaseTypeConfig.patch;
            return (
              <div key={entry.id} className="flex gap-6">
                <div className="w-[120px] flex-shrink-0 pt-1 text-right pr-4">
                  <div className="text-xs text-[#7D8590] mb-1">{entry.date}</div>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold"
                    style={{ color: rConfig.color, backgroundColor: rConfig.bg, border: `1px solid ${rConfig.color}40` }}>
                    {rConfig.label}
                  </span>
                </div>
                <div className="relative flex-shrink-0">
                  <div className="absolute -left-2 top-2 w-4 h-4 rounded border-2 flex items-center justify-center"
                    style={{ borderColor: rConfig.color, backgroundColor: '#0D1117' }}>
                    <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: rConfig.color }} />
                  </div>
                </div>
                <div className="flex-1 pl-4 pb-2">
                  <div className="mc-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-white font-semibold">{entry.projectName ?? entry.project_name}</h3>
                      <span className="text-mc-green font-mono text-sm font-bold">v{entry.version}</span>
                      {canEdit && (
                        <div className="ml-auto flex items-center gap-1">
                          <button onClick={() => setEditing(entry)} className="p-1 text-[#7D8590] hover:text-white transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => setDeleting(entry)} className="p-1 text-[#7D8590] hover:text-mc-redstone transition-colors"><Trash2 size={13} /></button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {entry.changes.map((change, i) => {
                        const cfg = changeTypeConfig[change.type as ChangeType] ?? changeTypeConfig.added;
                        const Icon = cfg.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                              <Icon size={12} style={{ color: cfg.color }} />
                              <span className="text-xs font-semibold w-16" style={{ color: cfg.color }}>{cfg.label}</span>
                            </div>
                            <span className="text-[#C9D1D9]">{change.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {entries.length === 0 && <div className="text-center py-16 text-[#3D444D]">Aucune entrée</div>}
        </div>
      </div>

      {showForm && (
        <EntryFormModal title="Nouvelle entrée changelog" initial={defaultForm}
          projects={projects} onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <EntryFormModal title="Modifier l'entrée" initial={toFormData(editing)}
          projects={projects} onSave={handleEdit} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded w-full max-w-sm p-6">
            <h3 className="text-white font-semibold mb-2">Supprimer l'entrée</h3>
            <p className="text-[#7D8590] text-sm mb-4">Supprimer <strong className="text-white">{deleting.projectName} v{deleting.version}</strong> ?</p>
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
