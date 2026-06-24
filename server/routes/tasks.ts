import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = Router();

type DbTask = { id: string; project_id: string; title: string; description: string; status: string; priority: string; assignee_id: number | null; due_date: string | null; labels: string; created_at: string; updated_at: string };

function hydrate(t: DbTask & { project_name?: string }) {
  return {
    ...t,
    projectId: t.project_id,
    projectName: t.project_name || '',
    assignee: t.assignee_id ? String(t.assignee_id) : undefined,
    labels: JSON.parse(t.labels),
  };
}

router.get('/', (_req, res) => {
  const tasks = db.prepare(`
    SELECT t.*, p.name as project_name
    FROM tasks t JOIN projects p ON p.id = t.project_id
    ORDER BY t.created_at
  `).all() as (DbTask & { project_name: string })[];
  res.json(tasks.map(hydrate));
});

router.get('/:id', (req, res) => {
  const t = db.prepare('SELECT t.*, p.name as project_name FROM tasks t JOIN projects p ON p.id = t.project_id WHERE t.id = ?').get(req.params.id) as (DbTask & { project_name: string }) | undefined;
  if (!t) { res.status(404).json({ error: 'Tâche introuvable' }); return; }
  res.json(hydrate(t));
});

router.post('/', requireAuth, requireRole('admin', 'developer'), (req, res) => {
  const b = req.body as Partial<{ projectId: string; title: string; description: string; status: string; priority: string; assignee: string; dueDate: string; labels: string[] }>;
  if (!b.projectId || !b.title) {
    res.status(400).json({ error: 'projectId et title sont requis' }); return;
  }

  const id = `t${Date.now()}`;
  const now = new Date().toISOString().slice(0, 10);

  db.prepare(`
    INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, due_date, labels, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.projectId, b.title, b.description || '', b.status || 'todo', b.priority || 'medium',
    b.assignee ? parseInt(b.assignee) : null, b.dueDate || null,
    JSON.stringify(b.labels || []), now, now,
  );

  const created = db.prepare('SELECT t.*, p.name as project_name FROM tasks t JOIN projects p ON p.id = t.project_id WHERE t.id = ?').get(id) as DbTask & { project_name: string };
  res.status(201).json(hydrate(created));
});

router.put('/:id', requireAuth, requireRole('admin', 'developer'), (req, res) => {
  const { id } = req.params;
  const b = req.body as Partial<{ title: string; description: string; status: string; priority: string; assignee: string | null; dueDate: string; labels: string[] }>;

  const exists = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
  if (!exists) { res.status(404).json({ error: 'Tâche introuvable' }); return; }

  const fields: string[] = [`updated_at = datetime('now')`];
  const values: unknown[] = [];

  if (b.title !== undefined)       { fields.push('title = ?');       values.push(b.title); }
  if (b.description !== undefined) { fields.push('description = ?'); values.push(b.description); }
  if (b.status !== undefined)      { fields.push('status = ?');      values.push(b.status); }
  if (b.priority !== undefined)    { fields.push('priority = ?');    values.push(b.priority); }
  if (b.assignee !== undefined)    { fields.push('assignee_id = ?'); values.push(b.assignee ? parseInt(b.assignee) : null); }
  if (b.dueDate !== undefined)     { fields.push('due_date = ?');    values.push(b.dueDate || null); }
  if (b.labels !== undefined)      { fields.push('labels = ?');      values.push(JSON.stringify(b.labels)); }

  values.push(id);
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT t.*, p.name as project_name FROM tasks t JOIN projects p ON p.id = t.project_id WHERE t.id = ?').get(id) as DbTask & { project_name: string };
  res.json(hydrate(updated));
});

router.delete('/:id', requireAuth, requireRole('admin', 'developer'), (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) { res.status(404).json({ error: 'Tâche introuvable' }); return; }
  res.json({ ok: true });
});

export default router;
