import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const DATA_DIR = process.env.DB_PATH
  ? join(process.cwd(), process.env.DB_PATH, '..')
  : join(process.cwd(), 'data');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = process.env.DB_PATH
  ? join(process.cwd(), process.env.DB_PATH)
  : join(DATA_DIR, 'rebornmc.db');

export const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL UNIQUE,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'developer',
    display_role    TEXT    NOT NULL DEFAULT 'Développeur',
    avatar          TEXT    NOT NULL DEFAULT '??',
    color           TEXT    NOT NULL DEFAULT '#5DA832',
    must_change_pw  INTEGER NOT NULL DEFAULT 0,
    last_login      TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          TEXT    PRIMARY KEY,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'planned',
    priority    TEXT    NOT NULL DEFAULT 'medium',
    progress    INTEGER NOT NULL DEFAULT 0,
    category    TEXT    NOT NULL DEFAULT 'utility',
    version     TEXT    NOT NULL DEFAULT '0.1.0',
    mc_version  TEXT    NOT NULL DEFAULT '1.21.8',
    tags        TEXT    NOT NULL DEFAULT '[]',
    github_url  TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_assignees (
    project_id TEXT    NOT NULL,
    user_id    INTEGER NOT NULL,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT    PRIMARY KEY,
    project_id  TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'todo',
    priority    TEXT    NOT NULL DEFAULT 'medium',
    assignee_id INTEGER,
    due_date    TEXT,
    labels      TEXT    NOT NULL DEFAULT '[]',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id)    ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS changelog (
    id           TEXT PRIMARY KEY,
    version      TEXT NOT NULL,
    date         TEXT NOT NULL,
    type         TEXT NOT NULL DEFAULT 'patch',
    project_id   TEXT NOT NULL,
    project_name TEXT NOT NULL,
    changes      TEXT NOT NULL DEFAULT '[]',
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS server_config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// ── Seed ──────────────────────────────────────────────────────────────────────

const userCount = (db.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number }).n;

if (userCount === 0) {
  console.log('📦 Seeding initial data...');

  const adminHash = bcrypt.hashSync('Admin@RebornMC2026!', 12);
  const devHash   = bcrypt.hashSync('Change@Me123!', 12);

  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash, role, display_role, avatar, color, must_change_pw)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    insertUser.run('LeVraiMattok', 'admin@rebornmc.fr',    adminHash, 'admin',     'Lead Dev',      'LM', '#5DA832', 1);
    insertUser.run('CreeperX',    'creeperx@rebornmc.fr', devHash,   'developer', 'Dev Backend',   'CX', '#3EEEFF', 1);
    insertUser.run('DiamondFox',  'diamondfox@rebornmc.fr',devHash,  'developer', 'Dev Frontend',  'DF', '#FFAA00', 1);
    insertUser.run('RedstoneKing','redstone@rebornmc.fr',  devHash,   'developer', 'Dev Plugins',   'RK', '#CC0000', 1);
    insertUser.run('StoneBuilder','stone@rebornmc.fr',     devHash,   'viewer',    'Builder & Config','SB','#7F7F7F',1);
  })();

  // Get user IDs
  const users = db.prepare('SELECT id, username FROM users').all() as { id: number; username: string }[];
  const uid = (name: string) => users.find(u => u.username === name)!.id;

  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, status, priority, progress, category, version, mc_version, tags, github_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertAssignee = db.prepare(`INSERT INTO project_assignees VALUES (?, ?)`);
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, labels, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLog = db.prepare(`
    INSERT INTO changelog (id, version, date, type, project_id, project_name, changes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    // Projects
    insertProject.run('p1','RebornCore','Plugin principal du serveur gérant les mécaniques de base, les permissions et l\'économie.','active','critical',78,'utility','3.2.1','1.21.8','["core","economy","permissions"]',null,'2024-01-15','2026-06-20');
    insertAssignee.run('p1', uid('LeVraiMattok'));
    insertAssignee.run('p1', uid('CreeperX'));

    insertProject.run('p2','RebornPvP','Système PvP custom avec classes, compétences, arènes et tournois automatiques.','in-progress','high',55,'pvp','1.4.0','1.21.8','["pvp","classes","arenes"]',null,'2024-03-10','2026-06-22');
    insertAssignee.run('p2', uid('RedstoneKing'));
    insertAssignee.run('p2', uid('LeVraiMattok'));

    insertProject.run('p3','RebornEconomy','Économie avancée avec boutique, auctions, quêtes économiques et marché des joueurs.','active','high',88,'economy','2.1.3','1.21.8','["economy","shop","auction"]',null,'2024-02-01','2026-06-21');
    insertAssignee.run('p3', uid('CreeperX'));
    insertAssignee.run('p3', uid('DiamondFox'));

    insertProject.run('p4','RebornWorlds','Gestion des mondes custom : génération procédurale, biomes uniques, structures spéciales.','in-progress','medium',34,'world','0.8.2','1.21.8','["worldgen","biomes","structures"]',null,'2025-01-20','2026-06-19');
    insertAssignee.run('p4', uid('StoneBuilder'));
    insertAssignee.run('p4', uid('CreeperX'));

    insertProject.run('p5','RebornGuard','Système anti-cheat custom, modération automatique, logs et rapports d\'abus.','active','critical',91,'moderation','4.0.1','1.21.8','["anticheat","moderation","security"]',null,'2023-11-05','2026-06-23');
    insertAssignee.run('p5', uid('LeVraiMattok'));
    insertAssignee.run('p5', uid('RedstoneKing'));

    insertProject.run('p6','RebornQuests','Système de quêtes narratives, journaux de quêtes, récompenses uniques et arcs scénaristiques.','planned','medium',12,'gameplay','0.2.0','1.21.8','["quests","story","rewards"]',null,'2026-05-01','2026-06-15');
    insertAssignee.run('p6', uid('DiamondFox'));

    // Tasks
    insertTask.run('t1','p1','Système de rang dynamique','Impl des rangs évolutifs selon les succès','in-progress','high',uid('LeVraiMattok'),'["feature"]','2026-06-01');
    insertTask.run('t2','p1','API économie v2','Refactor complet de l\'API économie','review','critical',uid('CreeperX'),'["api","breaking-change"]','2026-05-28');
    insertTask.run('t3','p1','Fix duplication items','Patch exploit duplication via coffre ender','done','critical',null,'["bugfix"]','2026-06-10');
    insertTask.run('t4','p1','Cache Redis optimisation','Réduire latence BDD avec cache Redis','todo','high',uid('CreeperX'),'["performance"]','2026-06-18');
    insertTask.run('t5','p2','Classe Mage v2','Nouvelles compétences pour la classe Mage','in-progress','high',uid('RedstoneKing'),'["feature","class"]','2026-06-05');
    insertTask.run('t6','p2','Tournoi automatique','Système de tournoi hebdomadaire auto','todo','medium',uid('LeVraiMattok'),'["feature"]','2026-06-12');
    insertTask.run('t7','p2','Fix cooldown skills','Bug cooldown reset en cas de mort','done','high',null,'["bugfix"]','2026-06-08');
    insertTask.run('t8','p2','Arène Nether','Nouvelle carte arène thème Nether','review','medium',uid('StoneBuilder'),'["map","arena"]','2026-06-15');
    insertTask.run('t9','p3','Auction house UI','Refonte interface hôtel des ventes','done','high',uid('DiamondFox'),'["ui"]','2026-05-20');
    insertTask.run('t10','p3','Anti-inflation système','Mécaniques de contrôle inflation monnaie','in-progress','medium',uid('CreeperX'),'["economy"]','2026-06-10');
    insertTask.run('t11','p4','Biome Volcanique','Nouveau biome avec mécanique lave active','in-progress','medium',uid('StoneBuilder'),'["worldgen","biome"]','2026-06-01');
    insertTask.run('t12','p4','Structure Donjon Custom','Donjons générés procéduralement avec boss','todo','high',uid('CreeperX'),'["structure","dungeon"]','2026-06-14');
    insertTask.run('t13','p4','Intégration WorldBorder','Compatibilité worldborder dynamique','todo','low',null,'["compatibility"]','2026-06-18');
    insertTask.run('t14','p5','Détection KillAura v3','Amélioration détection KillAura 1.21','done','critical',uid('LeVraiMattok'),'["anticheat"]','2026-06-01');
    insertTask.run('t15','p5','Dashboard modération web','Interface web pour modérateurs','in-progress','high',uid('DiamondFox'),'["web","moderation"]','2026-06-10');
    insertTask.run('t16','p6','Architecture quête engine','Conception du moteur de quêtes','in-progress','high',uid('DiamondFox'),'["architecture"]','2026-06-10');
    insertTask.run('t17','p6','Éditeur quêtes YAML','Système config quêtes en YAML','todo','medium',null,'["config"]','2026-06-15');

    // Changelog
    insertLog.run('cl1','3.2.1','2026-06-20','patch','p1','RebornCore',JSON.stringify([{type:'fixed',description:'Correction exploit duplication items via coffre ender'},{type:'fixed',description:'Fix crash lors du chargement de chunks corrompus'},{type:'changed',description:'Optimisation requêtes BDD (-40% latence)'}]));
    insertLog.run('cl2','4.0.1','2026-06-18','hotfix','p5','RebornGuard',JSON.stringify([{type:'fixed',description:'Fix faux positifs sur téléportation légale'},{type:'fixed',description:'Correction logs manquants pour bans automatiques'},{type:'security',description:'Patch bypass anti-cheat via packets spéciaux'}]));
    insertLog.run('cl3','2.1.3','2026-06-15','minor','p3','RebornEconomy',JSON.stringify([{type:'added',description:'Nouvelle interface Auction House avec filtres avancés'},{type:'added',description:'Historique des transactions sur 30 jours'},{type:'changed',description:'Refonte UI boutique admin'},{type:'fixed',description:'Fix montant négatif lors d\'échanges simultanés'}]));
    insertLog.run('cl4','1.4.0','2026-06-10','minor','p2','RebornPvP',JSON.stringify([{type:'added',description:'Carte arène Nether (en cours de validation)'},{type:'fixed',description:'Bug cooldown skills resettés à la mort'},{type:'changed',description:'Rééquilibrage classe Archer (+15% dégâts flèche)'}]));
    insertLog.run('cl5','0.8.2','2026-06-05','patch','p4','RebornWorlds',JSON.stringify([{type:'added',description:'Prototype biome volcanique (alpha)'},{type:'fixed',description:'Fix génération structures nulles en bord de monde'}]));
  })();

  console.log('✅ Seed terminé. Compte admin: LeVraiMattok / Admin@RebornMC2026!');
}

// ── Server config seed ────────────────────────────────────────────────────────

const configCount = (db.prepare('SELECT COUNT(*) as n FROM server_config').get() as { n: number }).n;

if (configCount === 0) {
  const set = db.prepare('INSERT INTO server_config (key, value) VALUES (?, ?)');
  db.transaction(() => {
    set.run('dashboard_name',     'REBORNMC');
    set.run('dashboard_subtitle', 'Dev Dashboard');
    set.run('mc_version',         '1.21.8');
    set.run('server_address',     'play.rebornmc.fr');
    set.run('server_type',        'Paper 1.21.8-#100');
    set.run('java_version',       'OpenJDK 21.0.5');
    set.run('os_info',            'Ubuntu 24.04 LTS');
    set.run('cpu_info',           '8 vCPU @ 3.6GHz');
    set.run('storage_info',       '200 GB SSD NVMe');
    set.run('ram_max_gb',         '16');
    set.run('max_players',        '200');
    set.run('plugins', JSON.stringify([
      { name: 'RebornCore',    status: 'enabled',  version: '3.2.1'   },
      { name: 'RebornPvP',     status: 'enabled',  version: '1.4.0'   },
      { name: 'RebornEconomy', status: 'enabled',  version: '2.1.3'   },
      { name: 'RebornWorlds',  status: 'enabled',  version: '0.8.2'   },
      { name: 'RebornGuard',   status: 'enabled',  version: '4.0.1'   },
      { name: 'RebornQuests',  status: 'disabled', version: '0.2.0'   },
      { name: 'LuckPerms',     status: 'enabled',  version: '5.4.145' },
      { name: 'Vault',         status: 'enabled',  version: '1.7.3'   },
      { name: 'WorldEdit',     status: 'enabled',  version: '7.3.5'   },
      { name: 'WorldGuard',    status: 'enabled',  version: '7.0.11'  },
    ]));
  })();
}
