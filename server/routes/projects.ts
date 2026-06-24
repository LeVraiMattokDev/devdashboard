import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = Router();

type DbProject = { id: string; name: string; description: string; status: string; priority: string; progress: number; category: string; version: string; mc_version: string; tags: string; github_url: string | null; created_at: string; updated_at: string };
type DbTask    = { id: string; project_id: string; title: string; description: string; status: string; priority: string; assignee_id: number | null; due_date: string | null; labels: string; created_at: string; updated_at: string };

function hydrate(p: DbProject) {
  const assignees = (db.prepare(`
    SELECT u.id FROM project_assignees pa JOIN users u ON u.id = pa.user_id WHERE pa.project_id = ?
  `).all(p.id) as { id: number }[]).map(a => String(a.id));

  const tasks = (db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at').all(p.id) as DbTask[])
    .map(t => ({ ...t, labels: JSON.parse(t.labels), assignee: t.assignee_id ? String(t.assignee_id) : undefined }));

  return {
    ...p,
    mcVersion: p.mc_version,
    tags: JSON.parse(p.tags),
    assignees,
    tasks,
  };
}

router.get('/', (_req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as DbProject[];
  res.json(projects.map(hydrate));
});

router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as DbProject | undefined;
  if (!p) { res.status(404).json({ error: 'Projet introuvable' }); return; }
  res.json(hydrate(p));
});

router.post('/', requireAuth, requireRole('admin', 'developer'), (req, res) => {
  const b = req.body as Partial<{ name: string; description: string; status: string; priority: string; progress: number; category: string; version: string; mcVersion: string; tags: string[]; githubUrl: string; assignees: string[] }>;
  if (!b.name) { res.status(400).json({ error: 'Le nom est requis' }); return; }

  const id = `p${Date.now()}`;
  const now = new Date().toISOString().slice(0, 10);

  db.transaction(() => {
    db.prepare(`
      INSERT INTO projects (id, name, description, status, priority, progress, category, version, mc_version, tags, github_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, b.name, b.description || '', b.status || 'planned', b.priority || 'medium',
      b.progress ?? 0, b.category || 'utility', b.version || '0.1.0',
      b.mcVersion || '1.21.8', JSON.stringify(b.tags || []), b.githubUrl || null, now, now,
    );
    for (const uid of (b.assignees || [])) {
      db.prepare('INSERT OR IGNORE INTO project_assignees VALUES (?, ?)').run(id, parseInt(uid));
    }
  })();

  const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as DbProject;
  res.status(201).json(hydrate(created));
});

router.put('/:id', requireAuth, requireRole('admin', 'developer'), (req, res) => {
  const { id } = req.params;
  const b = req.body as Partial<{ name: string; description: string; status: string; priority: string; progress: number; category: string; version: string; mcVersion: string; tags: string[]; githubUrl: string; assignees: string[] }>;

  const exists = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
  if (!exists) { res.status(404).json({ error: 'Projet introuvable' }); return; }

  const fields: string[] = [`updated_at = ?`];
  const values: unknown[] = [new Date().toISOString().slice(0, 10)];

  if (b.name !== undefined)        { fields.push('name = ?');        values.push(b.name); }
  if (b.description !== undefined) { fields.push('description = ?'); values.push(b.description); }
  if (b.status !== undefined)      { fields.push('status = ?');      values.push(b.status); }
  if (b.priority !== undefined)    { fields.push('priority = ?');    values.push(b.priority); }
  if (b.progress !== undefined)    { fields.push('progress = ?');    values.push(b.progress); }
  if (b.category !== undefined)    { fields.push('category = ?');    values.push(b.category); }
  if (b.version !== undefined)     { fields.push('version = ?');     values.push(b.version); }
  if (b.mcVersion !== undefined)   { fields.push('mc_version = ?');  values.push(b.mcVersion); }
  if (b.tags !== undefined)        { fields.push('tags = ?');        values.push(JSON.stringify(b.tags)); }
  if (b.githubUrl !== undefined)   { fields.push('github_url = ?');  values.push(b.githubUrl || null); }

  db.transaction(() => {
    values.push(id);
    db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    if (b.assignees !== undefined) {
      db.prepare('DELETE FROM project_assignees WHERE project_id = ?').run(id);
      for (const uid of b.assignees) {
        db.prepare('INSERT OR IGNORE INTO project_assignees VALUES (?, ?)').run(id, parseInt(uid));
      }
    }
  })();

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as DbProject;
  res.json(hydrate(updated));
});

router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (result.changes === 0) { res.status(404).json({ error: 'Projet introuvable' }); return; }
  res.json({ ok: true });
});

export default router;
