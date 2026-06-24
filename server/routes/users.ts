import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = Router();
router.use(requireAuth);

const SELECT_USER = 'SELECT id, username, email, role, display_role, avatar, color, must_change_pw, last_login, created_at FROM users';

router.get('/', requireRole('admin'), (_req, res) => {
  res.json(db.prepare(`${SELECT_USER} ORDER BY created_at`).all());
});

router.post('/', requireRole('admin'), (req, res) => {
  const { username, email, password, role, display_role, avatar, color } =
    req.body as { username?: string; email?: string; password?: string; role?: string; display_role?: string; avatar?: string; color?: string };

  if (!username || !password || !role) {
    res.status(400).json({ error: 'username, password et role sont requis' }); return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Mot de passe trop court (min 8 caractères)' }); return;
  }

  const hash = bcrypt.hashSync(password, 12);
  try {
    const info = db.prepare(`
      INSERT INTO users (username, email, password_hash, role, display_role, avatar, color, must_change_pw)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      username,
      email || `${username.toLowerCase()}@rebornmc.fr`,
      hash,
      role,
      display_role || 'Développeur',
      avatar || username.slice(0, 2).toUpperCase(),
      color || '#5DA832',
    );
    const user = db.prepare(`${SELECT_USER} WHERE id = ?`).get(info.lastInsertRowid);
    res.status(201).json(user);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('UNIQUE')) {
      res.status(409).json({ error: 'Username ou email déjà utilisé' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

router.put('/:id', requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  const { username, email, password, role, display_role, avatar, color } =
    req.body as { username?: string; email?: string; password?: string; role?: string; display_role?: string; avatar?: string; color?: string };

  if (password && password.length < 8) {
    res.status(400).json({ error: 'Mot de passe trop court (min 8 caractères)' }); return;
  }

  const fields: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];

  if (username)      { fields.push('username = ?');      values.push(username); }
  if (email)         { fields.push('email = ?');         values.push(email); }
  if (role)          { fields.push('role = ?');          values.push(role); }
  if (display_role)  { fields.push('display_role = ?');  values.push(display_role); }
  if (avatar)        { fields.push('avatar = ?');        values.push(avatar); }
  if (color)         { fields.push('color = ?');         values.push(color); }
  if (password)      { fields.push('password_hash = ?'); values.push(bcrypt.hashSync(password, 12)); }

  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  const user = db.prepare(`${SELECT_USER} WHERE id = ?`).get(id);
  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
  res.json(user);
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.user!.id) {
    res.status(400).json({ error: 'Impossible de supprimer votre propre compte' }); return;
  }
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  if (result.changes === 0) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
  res.json({ ok: true });
});

export default router;
