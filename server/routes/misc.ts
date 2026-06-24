import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { slpPing } from '../minecraft.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function getConfig(): Record<string, unknown> {
  const rows = db.prepare('SELECT key, value FROM server_config').all() as { key: string; value: string }[];
  const out: Record<string, unknown> = {};
  for (const r of rows) {
    try { out[r.key] = JSON.parse(r.value); }
    catch { out[r.key] = r.value; }
  }
  return out;
}

function formatUptime(ms: number): string {
  if (ms <= 0) return '—';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}j ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Simple in-memory cache for external API calls (30s)
type CacheEntry<T> = { data: T; at: number };
let ptCache: CacheEntry<PtData> | null = null;
let slpCache: CacheEntry<{ online: number; max: number; version: string } | null> | null = null;
const CACHE_TTL = 30_000;

interface PtData {
  current_state: string;
  resources: { memory_bytes: number; cpu_absolute: number; disk_bytes: number; uptime: number };
}

async function fetchPterodactyl(): Promise<PtData | null> {
  const url = process.env.PTERODACTYL_URL;
  const key = process.env.PTERODACTYL_API_KEY;
  const sid = process.env.PTERODACTYL_SERVER_ID;
  if (!url || !key || !sid) return null;

  if (ptCache && Date.now() - ptCache.at < CACHE_TTL) return ptCache.data;

  try {
    const r = await fetch(`${url}/api/client/servers/${sid}/resources`, {
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    });
    if (!r.ok) return null;
    const body = await r.json() as { attributes: PtData };
    ptCache = { data: body.attributes, at: Date.now() };
    return body.attributes;
  } catch {
    return null;
  }
}

async function fetchSlp(): Promise<{ online: number; max: number; version: string } | null> {
  const host = process.env.MC_HOST;
  const port = parseInt(process.env.MC_PORT ?? '25565', 10);
  if (!host) return null;

  if (slpCache && Date.now() - slpCache.at < CACHE_TTL) return slpCache.data;

  const result = await slpPing(host, port);
  slpCache = { data: result, at: Date.now() };
  return result;
}

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

// ── Team ──────────────────────────────────────────────────────────────────────

router.get('/team', (_req, res) => {
  const users = db.prepare('SELECT id, username, display_role, avatar, color FROM users ORDER BY id').all() as { id: number; username: string; display_role: string; avatar: string; color: string }[];

  const result = users.map(u => ({
    id: String(u.id),
    name: u.username,
    role: u.display_role,
    avatar: u.avatar,
    color: u.color,
    activeTasks: (db.prepare("SELECT COUNT(*) as n FROM tasks WHERE assignee_id = ? AND status != 'done'").get(u.id) as { n: number }).n,
    completedProjects: (db.prepare("SELECT COUNT(*) as n FROM tasks WHERE assignee_id = ? AND status = 'done'").get(u.id) as { n: number }).n,
    assignedProjects: (db.prepare('SELECT COUNT(*) as n FROM project_assignees WHERE user_id = ?').get(u.id) as { n: number }).n,
  }));

  res.json(result);
});

// ── Settings ──────────────────────────────────────────────────────────────────

router.get('/settings', requireAuth, (_req, res) => {
  const config = getConfig();
  config.integrations = {
    pterodactyl: !!(process.env.PTERODACTYL_URL && process.env.PTERODACTYL_API_KEY && process.env.PTERODACTYL_SERVER_ID),
    mc_ping: !!(process.env.MC_HOST),
  };
  res.json(config);
});

router.put('/settings', requireAuth, requireRole('admin'), (req, res) => {
  const body = req.body as Record<string, unknown>;
  const upsert = db.prepare('INSERT OR REPLACE INTO server_config (key, value) VALUES (?, ?)');
  const allowed = ['dashboard_name', 'dashboard_subtitle', 'mc_version', 'server_address',
    'server_type', 'java_version', 'os_info', 'cpu_info', 'storage_info', 'ram_max_gb',
    'max_players', 'plugins'];

  db.transaction(() => {
    for (const key of allowed) {
      if (key in body) {
        const val = body[key];
        upsert.run(key, typeof val === 'string' ? val : JSON.stringify(val));
      }
    }
  })();

  const config = getConfig();
  config.integrations = {
    pterodactyl: !!(process.env.PTERODACTYL_URL && process.env.PTERODACTYL_API_KEY && process.env.PTERODACTYL_SERVER_ID),
    mc_ping: !!(process.env.MC_HOST),
  };
  res.json(config);
});

// ── Server info ───────────────────────────────────────────────────────────────

router.get('/server-info', async (_req, res) => {
  const cfg = getConfig();
  const projectCount = (db.prepare('SELECT COUNT(*) as n FROM projects').get() as { n: number }).n;
  const taskCount    = (db.prepare("SELECT COUNT(*) as n FROM tasks WHERE status != 'done'").get() as { n: number }).n;

  const ramMaxGb = parseFloat(String(cfg.ram_max_gb ?? '16'));
  const maxPlayers = parseInt(String(cfg.max_players ?? '200'), 10);

  // Fetch live data from Pterodactyl
  const pt = await fetchPterodactyl();
  // Fetch player count via Minecraft SLP
  const slp = await fetchSlp();

  let status: 'online' | 'offline' | 'maintenance' = 'online';
  let ram = { used: 0, max: ramMaxGb };
  let cpu = 0;
  let disk = 0;
  let uptime = '—';
  let players = { current: slp?.online ?? 0, max: slp?.max ?? maxPlayers };

  if (pt) {
    const state = pt.current_state;
    status = state === 'running' ? 'online' : state === 'offline' ? 'offline' : 'maintenance';
    ram = {
      used: Math.round((pt.resources.memory_bytes / 1_073_741_824) * 10) / 10,
      max: ramMaxGb,
    };
    cpu = Math.round(pt.resources.cpu_absolute * 10) / 10;
    disk = Math.round((pt.resources.disk_bytes / 1_073_741_824) * 10) / 10;
    uptime = formatUptime(pt.resources.uptime);
    if (!slp) players = { current: 0, max: maxPlayers };
  }

  res.json({
    name:         cfg.dashboard_name    ?? 'REBORNMC',
    version:      cfg.mc_version        ?? '1.21.8',
    serverType:   cfg.server_type       ?? 'Paper',
    javaVersion:  cfg.java_version      ?? 'OpenJDK 21',
    osInfo:       cfg.os_info           ?? 'Ubuntu 24.04 LTS',
    cpuInfo:      cfg.cpu_info          ?? '8 vCPU',
    storageInfo:  cfg.storage_info      ?? '200 GB SSD',
    address:      cfg.server_address    ?? 'play.rebornmc.fr',
    plugins:      cfg.plugins           ?? [],
    status,
    players,
    uptime,
    tps: pt ? null : 19.8,
    ram,
    cpu,
    disk,
    hasPterodactyl: !!pt,
    hasMcPing: !!slp,
    stats: { projects: projectCount, activeTasks: taskCount },
  });
});

export default router;
