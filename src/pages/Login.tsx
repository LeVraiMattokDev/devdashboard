import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../api';

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Change-password flow
  const [mustChange, setMustChange] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');

  useEffect(() => {
    if (user && !user.mustChangePw) navigate('/', { replace: true });
  }, [user, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // re-read user from context after login — handled by useEffect
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== newPw2) { setError('Les mots de passe ne correspondent pas'); return; }
    if (newPw.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères'); return; }
    setError('');
    setLoading(true);
    try {
      await auth.changePassword(password, newPw);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.mustChangePw) setMustChange(true);
  }, [user]);

  if (mustChange) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-mc-green flex items-center justify-center shadow-mc-inset">
              <Sword size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-wider">REBORNMC</div>
              <div className="text-[#5DA832] text-xs">Dev Dashboard</div>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded p-6">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound size={16} className="text-mc-gold" />
              <h2 className="text-white font-semibold">Changement de mot de passe requis</h2>
            </div>
            <p className="text-[#7D8590] text-xs mb-5">
              Veuillez définir un nouveau mot de passe pour continuer.
            </p>

            <form onSubmit={handleChangePw} className="space-y-4">
              <div>
                <label className="text-xs text-[#7D8590] block mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green transition-colors"
                  placeholder="Min. 8 caractères"
                />
              </div>
              <div>
                <label className="text-xs text-[#7D8590] block mb-1">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={newPw2}
                  onChange={e => setNewPw2(e.target.value)}
                  required
                  className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green transition-colors"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-mc-redstone text-xs bg-red-900/20 border border-mc-redstone/30 rounded px-3 py-2">
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mc-green hover:bg-[#4a8a26] text-white font-semibold py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Définir le mot de passe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-mc-green flex items-center justify-center shadow-mc-inset">
            <Sword size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-wider">REBORNMC</div>
            <div className="text-[#5DA832] text-xs">Dev Dashboard</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#161B22] border border-[#30363D] rounded p-6">
          <h2 className="text-white font-semibold text-base mb-1">Connexion</h2>
          <p className="text-[#7D8590] text-xs mb-5">Accès réservé à l'équipe de développement.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-green transition-colors placeholder:text-[#3D444D]"
                placeholder="LeVraiMattok"
              />
            </div>
            <div>
              <label className="text-xs text-[#7D8590] block mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0D1117] border border-[#30363D] text-white rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-mc-green transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7D8590] hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-mc-redstone text-xs bg-red-900/20 border border-mc-redstone/30 rounded px-3 py-2">
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mc-green hover:bg-[#4a8a26] text-white font-semibold py-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#3D444D] mt-4">
          © 2026 REBORNMC — Accès restreint
        </p>
      </div>
    </div>
  );
}
