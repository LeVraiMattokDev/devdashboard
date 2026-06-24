import { LogOut, KeyRound, UserCircle, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../api';
import { Avatar } from './Avatar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [next2, setNext2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== next2) { setError('Les mots de passe ne correspondent pas'); return; }
    if (next.length < 8) { setError('Minimum 8 caractères'); return; }
    setError('');
    setLoading(true);
    try {
      await auth.changePassword(current, next);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg w-full max-w-sm p-6 shadow-2xl">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <KeyRound size={15} className="text-mc-gold" />
          Changer le mot de passe
        </h3>
        {done ? (
          <div className="text-mc-green text-sm text-center py-4">
            Mot de passe modifié avec succès !<br />
            <button onClick={onClose} className="mt-3 text-[#7D8590] hover:text-white text-xs underline">Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {[
              { label: 'Mot de passe actuel', value: current, set: setCurrent },
              { label: 'Nouveau mot de passe', value: next, set: setNext },
              { label: 'Confirmer', value: next2, set: setNext2 },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-xs text-[#7D8590] block mb-1">{label}</label>
                <input type="password" value={value} onChange={e => set(e.target.value)} required
                  className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green transition-colors" />
              </div>
            ))}
            {error && <p className="text-mc-redstone text-xs">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-3 py-2 bg-[#21262D] text-[#7D8590] rounded text-sm hover:text-white transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-3 py-2 bg-mc-green text-white rounded text-sm hover:bg-[#4a8a26] transition-colors disabled:opacity-50">
                {loading ? '...' : 'Modifier'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const av = user?.avatar ?? '';
  const [avatarUrl, setAvatarUrl] = useState(/^https?:\/\//.test(av) ? av : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const updated = await auth.updateProfile({ avatar: avatarUrl.trim() });
      updateUser({ avatar: updated.avatar });
      setDone(true);
      setTimeout(onClose, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg w-full max-w-sm p-6 shadow-2xl">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <UserCircle size={15} className="text-mc-green" />
          Photo de profil
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live preview */}
          <div className="flex items-center gap-4 p-3 bg-[#0D1117] rounded-lg border border-[#21262D]">
            <Avatar value={avatarUrl || user.avatar} color={user.color} size={52} />
            <div>
              <div className="text-white font-medium text-sm">{user.username}</div>
              <div className="text-xs text-[#7D8590]">{user.displayRole || user.role}</div>
            </div>
          </div>

          {/* URL input */}
          <div>
            <label className="text-xs text-[#7D8590] mb-1 block">URL de la photo</label>
            <input
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-mc-green transition-colors placeholder-[#3D444D]"
            />
            <p className="text-[10px] text-[#3D444D] mt-1.5">
              Laissez vide pour afficher vos initiales
            </p>
          </div>

          {error && <p className="text-mc-redstone text-xs">{error}</p>}
          {done && <p className="text-mc-green text-xs">Profil mis à jour !</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#21262D] text-[#7D8590] rounded-md text-sm hover:text-white transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-mc-green text-white rounded-md text-sm font-medium hover:bg-[#4a8a26] transition-colors disabled:opacity-50">
              {loading ? '...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const initials = user?.username.slice(0, 2).toUpperCase() ?? '??';

  return (
    <header className="h-14 border-b border-[#21262D] flex items-center justify-between px-4 md:px-6 bg-[#0D1117]/80 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-1.5 text-[#7D8590] hover:text-white transition-colors">
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-base">{title}</h1>
          {subtitle && <p className="text-[#7D8590] text-xs mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {user && (
        <div className="relative flex items-center gap-3">
          <div className="hidden md:block text-right">
            <div className="text-white text-xs font-medium">{user.username}</div>
            <div className="text-[#7D8590] text-xs">{user.displayRole}</div>
          </div>

          <button
            onClick={() => setShowMenu(v => !v)}
            className="flex-shrink-0 rounded overflow-hidden"
            style={{ outline: `2px solid ${user.color}60` }}
          >
            <Avatar value={user.avatar || initials} color={user.color} size={32} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 z-50 bg-[#161B22] border border-[#30363D] rounded-lg shadow-xl w-48 overflow-hidden">
                <div className="px-3 py-2.5 border-b border-[#21262D] flex items-center gap-2.5">
                  <Avatar value={user.avatar || initials} color={user.color} size={28} />
                  <div>
                    <div className="text-white text-xs font-semibold">{user.username}</div>
                    <div className="text-[#7D8590] text-[10px]">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowEditProfile(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#7D8590] hover:text-white hover:bg-[#21262D] transition-colors"
                >
                  <UserCircle size={13} /> Photo de profil
                </button>
                <button
                  onClick={() => { setShowChangePw(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#7D8590] hover:text-white hover:bg-[#21262D] transition-colors"
                >
                  <KeyRound size={13} /> Changer le mot de passe
                </button>
                <button
                  onClick={() => { setShowMenu(false); logout(); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-mc-redstone hover:bg-[#21262D] transition-colors"
                >
                  <LogOut size={13} /> Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
    </header>
  );
}
