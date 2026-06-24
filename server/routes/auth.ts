import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, requireAuth } from '../auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: 'Username et mot de passe requis' });
    return;
  }

  const user = db.prepare(
    'SELECT id, username, password_hash, role, display_role, avatar, color, must_change_pw FROM users WHERE username = ? COLLATE NOCASE'
  ).get(username) as { id: number; username: string; password_hash: string; role: string; display_role: string; avatar: string; color: string; must_change_pw: number } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Identifiants incorrects' });
    return;
  }

  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  const token = signToken({ id: user.id, username: user.username, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      displayRole: user.display_role,
      avatar: user.avatar,
      color: user.color,
      mustChangePw: user.must_change_pw === 1,
    },
  });
});

router.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, username, role, display_role, avatar, color, must_change_pw FROM users WHERE id = ?'
  ).get(req.user!.id) as { id: number; username: string; role: string; display_role: string; avatar: string; color: string; must_change_pw: number } | undefined;

  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    displayRole: user.display_role,
    avatar: user.avatar,
    color: user.color,
    mustChangePw: user.must_change_pw === 1,
  });
});

router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Champs requis manquants' }); return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caractères' }); return;
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as { password_hash: string } | undefined;
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    res.status(401).json({ error: 'Mot de passe actuel incorrect' }); return;
  }

  const hash = bcrypt.hashSync(newPassword, 12);
  db.prepare("UPDATE users SET password_hash = ?, must_change_pw = 0, updated_at = datetime('now') WHERE id = ?").run(hash, req.user!.id);
  res.json({ ok: true });
});

export default router;
