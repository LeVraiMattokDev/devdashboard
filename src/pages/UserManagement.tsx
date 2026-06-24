import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, ShieldCheck, Eye, UserCheck } from 'lucide-react';
import { users as usersApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/Avatar';
import type { AppUser } from '../types';

const roleOptions = ['admin', 'developer', 'viewer'];
const colorOptions = ['#5DA832', '#3EEEFF', '#FFAA00', '#CC0000', '#866043', '#9B59B6', '#E67E22', '#1ABC9C'];
const avatarOptions = ['LM', 'JD', 'AB', 'MC', 'RB', 'ZX', 'PL', 'KO', 'TG', 'HW'];

const roleConfig: Record<string, { icon: React.ElementType; color: string }> = {
  admin:     { icon: ShieldCheck, color: '#CC0000' },
  developer: { icon: UserCheck,   color: '#5DA832' },
  viewer:    { icon: Eye,         color: '#3EEEFF' },
};

interface UserFormData {
  username: string; email: string; role: string; display_role: string;
  avatar: string; color: string; password: string;
}

const defaultForm: UserFormData = {
  username: '', email: '', role: 'viewer', display_role: '',
  avatar: 'AB', color: '#5DA832', password: '',
};

function UserFormModal({ initial, title, isNew, onSave, onClose }: {
  initial: UserFormData; title: string; isNew: boolean;
  onSave: (d: UserFormData) => Promise<void>; onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof UserFormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim()) { setError('Le nom d\'utilisateur est requis'); return; }
    if (isNew && form.password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères'); return; }
    setLoading(true); setError('');
    try { await onSave(form); } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#30363D] rounded w-full max-w-md my-4">
        <div className="flex items-center justify-between p-4 border-b border-[#21262D]">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-[#7D8590] hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Nom d'utilisateur *</label>
              <input value={form.username} onChange={e => set('username', e.target.value)} required
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Rôle</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green">
                {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Rôle affiché</label>
              <input value={form.display_role} onChange={e => set('display_role', e.target.value)}
                placeholder="ex: Développeur Senior"
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#7D8590] block mb-2">Photo de profil</label>
              <div className="flex gap-3 items-start">
                <Avatar value={form.avatar} color={form.color} size={48} />
                <div className="flex-1 space-y-2">
                  <input
                    value={form.avatar}
                    onChange={e => set('avatar', e.target.value)}
                    placeholder="https://... ou initiales (ex: LM)"
                    className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {avatarOptions.map(a => (
                      <button type="button" key={a} onClick={() => set('avatar', a)}
                        className={`px-1.5 py-0.5 rounded text-xs font-bold transition-colors ${form.avatar === a ? 'bg-mc-green text-white' : 'bg-[#0D1117] text-[#7D8590] border border-[#30363D] hover:border-mc-green'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Couleur</label>
              <div className="flex gap-1.5 flex-wrap">
                {colorOptions.map(c => (
                  <button type="button" key={c} onClick={() => set('color', c)}
                    className={`w-7 h-7 rounded transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-[#161B22]' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#7D8590] block mb-1">
                {isNew ? 'Mot de passe *' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}
              </label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                required={isNew} minLength={isNew ? 8 : 0} placeholder={isNew ? 'Min. 8 caractères' : 'Optionnel'}
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

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [userList, setUserList] = useState<AppUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);

  useEffect(() => {
    usersApi.list().then(setUserList).catch(() => {});
  }, []);

  function toFormData(u: AppUser): UserFormData {
    return {
      username: u.username, email: u.email ?? '', role: u.role,
      display_role: u.display_role ?? '', avatar: u.avatar ?? '',
      color: u.color ?? '#5DA832', password: '',
    };
  }

  async function handleCreate(form: UserFormData) {
    const u = await usersApi.create({ ...form });
    setUserList(prev => [...prev, u]);
    setShowForm(false);
  }

  async function handleEdit(form: UserFormData) {
    if (!editing) return;
    const payload: Partial<AppUser> & { password?: string } = {
      username: form.username, email: form.email, role: form.role,
      display_role: form.display_role, avatar: form.avatar, color: form.color,
    };
    if (form.password) payload.password = form.password;
    const u = await usersApi.update(editing.id, payload);
    setUserList(prev => prev.map(x => x.id === u.id ? u : x));
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    await usersApi.delete(deleting.id);
    setUserList(prev => prev.filter(u => u.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-[#7D8590] text-sm">{userList.length} utilisateur{userList.length > 1 ? 's' : ''}</div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-mc-green text-white rounded text-sm font-medium hover:bg-[#4a8a26] transition-colors">
          <Plus size={14} /> Nouvel utilisateur
        </button>
      </div>

      <div className="mc-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#21262D]">
              {['Utilisateur', 'Rôle', 'Email', 'Dernière connexion', 'Créé le', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#7D8590] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {userList.map(u => {
              const RoleIcon = roleConfig[u.role]?.icon ?? Eye;
              const roleColor = roleConfig[u.role]?.color ?? '#7D8590';
              const isSelf = currentUser?.id === u.id;

              return (
                <tr key={u.id} className="border-b border-[#21262D] hover:bg-[#161B22] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar value={u.avatar} color={u.color} size={32} />
                      <div>
                        <div className="text-white font-medium">{u.username}</div>
                        {u.display_role && <div className="text-xs text-[#7D8590]">{u.display_role}</div>}
                      </div>
                      {isSelf && <span className="text-xs px-1.5 py-0.5 bg-mc-green/20 text-mc-green rounded border border-mc-green/30">Vous</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: roleColor }}>
                      <RoleIcon size={12} />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#7D8590] text-xs">{u.email || '—'}</td>
                  <td className="px-4 py-3 text-[#7D8590] text-xs">
                    {u.last_login ? new Date(u.last_login).toLocaleString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="px-4 py-3 text-[#7D8590] text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditing(u)}
                        className="p-1.5 text-[#7D8590] hover:text-white transition-colors rounded hover:bg-[#21262D]">
                        <Pencil size={13} />
                      </button>
                      {!isSelf && (
                        <button onClick={() => setDeleting(u)}
                          className="p-1.5 text-[#7D8590] hover:text-mc-redstone transition-colors rounded hover:bg-[#21262D]">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {userList.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[#3D444D]">Chargement...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <UserFormModal title="Nouvel utilisateur" initial={defaultForm} isNew={true}
          onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <UserFormModal title="Modifier l'utilisateur" initial={toFormData(editing)} isNew={false}
          onSave={handleEdit} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded w-full max-w-sm p-6">
            <h3 className="text-white font-semibold mb-2">Supprimer l'utilisateur</h3>
            <p className="text-[#7D8590] text-sm mb-4">
              Supprimer <strong className="text-white">{deleting.username}</strong> ? Cette action est irréversible.
            </p>
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
