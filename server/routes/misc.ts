import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = Router();

// ── Changelog ────────────────────────────────────────────────────────────────

type DbLog = { id: string; version: string; date: string; type: string; project_id: string; project_name: string; changes: string; created_at: string };

router.get('/changelog', (_req, res) => {
  const logs = db.prepare('SELECT * FROM changelog ORDER BY date DESC').all() as DbLog[];
  res.json(logs.map(l => ({ ...l, projectId: l.project_id, changes: JSON.parse(l.changes) })));
});

router.post('/changelog', requireAuth, requireRole('admin', 'developer'), (req, res) => {
  const b = req.body as Partial<{ version: string; date: string; type: string; projectId: string; projectName: string; changes: { type: string; description: string }[] }>;
  if (!b.version || !b.projectId || !b.projectName) {
    res.status(400).json({ error: 'version, projectId et projectName sont requis' }); return;
  }
  const id = `cl${Date.now()}`;
  db.prepare(`
    INSERT INTO changelog (id, version, date, type, project_id, project_name, changes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.version, b.date || new Date().toISOString().slice(0, 10), b.type || 'patch', b.projectId, b.projectName, JSON.stringify(b.changes || []));

  const created = db.prepare('SELECT * FROM changelog WHERE id = ?').get(id) as DbLog;
  res.status(201).json({ ...created, projectId: created.project_id, changes: JSON.parse(created.changes) });
});

router.put('/changelog/:id', requireAuth, requireRole('admin', 'developer'), (req, res) => {
  const b = req.body as Partial<{ version: string; date: string; type: string; changes: unknown[] }>;
  const fields: string[] = [];
  const values: unknown[] = [];
  if (b.version !== undefined) { fields.push('version = ?'); values.push(b.version); }
  if (b.date !== undefined)    { fields.push('date = ?');    values.push(b.date); }
  if (b.type !== undefined)    { fields.push('type = ?');    values.push(b.type); }
  if (b.changes !== undefined) { fields.push('changes = ?'); values.push(JSON.stringify(b.changes)); }
  if (!fields.length) { res.status(400).json({ error: 'Rien à mettre à jour' }); return; }
  values.push(req.params.id);
  db.prepare(`UPDATE changelog SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  const updated = db.prepare('SELECT * FROM changelog WHERE id = ?').get(req.params.id) as DbLog;
  if (!updated) { res.status(404).json({ error: 'Entrée introuvable' }); return; }
  res.json({ ...updated, projectId: updated.project_id, changes: JSON.parse(updated.changes) });
});

router.delete('/changelog/:id', requireAuth, requireRole('admin'), (req, res) => {
  const result = db.prepare('DELETE FROM changelog WHERE id = ?').run(req.params.id);
  if (result.changes === 0) { res.status(404).json({ error: 'Entrée introuvable' }); return; }
  res.json({ ok: true });
});

// ── Team (users as team members) ─────────────────────────────────────────────

router.get('/team', (_req, res) => {
  const users = db.prepare('SELECT id, username, display_role, avatar, color FROM users ORDER BY id').all() as { id: number; username: string; display_role: string; avatar: string; color: string }[];

  const result = users.map(u => {
    const activeTasks = (db.prepare(
      "SELECT COUNT(*) as n FROM tasks WHERE assignee_id = ? AND status != 'done'"
    ).get(u.id) as { n: number }).n;

    const completedTasks = (db.prepare(
      "SELECT COUNT(*) as n FROM tasks WHERE assignee_id = ? AND status = 'done'"
    ).get(u.id) as { n: number }).n;

    const assignedProjects = (db.prepare(
      'SELECT COUNT(*) as n FROM project_assignees WHERE user_id = ?'
    ).get(u.id) as { n: number }).n;

    return {
      id: String(u.id),
      name: u.username,
      role: u.display_role,
      avatar: u.avatar,
      color: u.color,
      activeTasks,
      completedProjects: completedTasks,
      assignedProjects,
    };
  });

  res.json(result);
});

// ── Server info ───────────────────────────────────────────────────────────────

router.get('/server-info', (_req, res) => {
  const projectCount = (db.prepare('SELECT COUNT(*) as n FROM projects').get() as { n: number }).n;
  const taskCount    = (db.prepare("SELECT COUNT(*) as n FROM tasks WHERE status != 'done'").get() as { n: number }).n;

  res.json({
    name: 'REBORNMC',
    version: '1.21.8',
    status: 'online',
    players: { current: 47, max: 200 },
    uptime: '12j 4h 32m',
    tps: 19.8,
    ram: { used: 6.2, max: 16 },
    stats: { projects: projectCount, activeTasks: taskCount },
  });
});

export default router;
