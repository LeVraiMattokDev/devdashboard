import type { Project, ChangelogEntry, TeamMember, ServerInfo } from '../types';

export const serverInfo: ServerInfo = {
  name: 'REBORNMC',
  version: '1.21.8',
  status: 'online',
  players: { current: 47, max: 200 },
  uptime: '12j 4h 32m',
  tps: 19.8,
  ram: { used: 6.2, max: 16 },
};

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'LeVraiMattok', role: 'Lead Dev', avatar: 'LM', color: '#5DA832', activeTasks: 8, completedProjects: 12 },
  { id: '2', name: 'CreeperX', role: 'Dev Backend', avatar: 'CX', color: '#3EEEFF', activeTasks: 5, completedProjects: 7 },
  { id: '3', name: 'DiamondFox', role: 'Dev Frontend', avatar: 'DF', color: '#FFAA00', activeTasks: 4, completedProjects: 9 },
  { id: '4', name: 'RedstoneKing', role: 'Dev Plugins', avatar: 'RK', color: '#CC0000', activeTasks: 6, completedProjects: 5 },
  { id: '5', name: 'StoneBuilder', role: 'Builder & Config', avatar: 'SB', color: '#7F7F7F', activeTasks: 3, completedProjects: 14 },
];

export const projects: Project[] = [
  {
    id: 'p1',
    name: 'RebornCore',
    description: 'Plugin principal du serveur gérant les mécaniques de base, les permissions et l\'économie.',
    status: 'active',
    priority: 'critical',
    progress: 78,
    category: 'utility',
    version: '3.2.1',
    mcVersion: '1.21.8',
    assignees: ['1', '2'],
    tags: ['core', 'economy', 'permissions'],
    createdAt: '2024-01-15',
    updatedAt: '2026-06-20',
    githubUrl: '#',
    tasks: [
      { id: 't1', projectId: 'p1', title: 'Système de rang dynamique', description: 'Impl des rangs évolutifs selon les succès', status: 'in-progress', priority: 'high', assignee: '1', labels: ['feature'], createdAt: '2026-06-01' },
      { id: 't2', projectId: 'p1', title: 'API économie v2', description: 'Refactor complet de l\'API économie', status: 'review', priority: 'critical', assignee: '2', labels: ['api', 'breaking-change'], createdAt: '2026-05-28' },
      { id: 't3', projectId: 'p1', title: 'Fix duplication items', description: 'Patch exploit duplication via coffre ender', status: 'done', priority: 'critical', labels: ['bugfix'], createdAt: '2026-06-10' },
      { id: 't4', projectId: 'p1', title: 'Cache Redis optimisation', description: 'Réduire latence BDD avec cache Redis', status: 'todo', priority: 'high', assignee: '2', labels: ['performance'], createdAt: '2026-06-18' },
    ]
  },
  {
    id: 'p2',
    name: 'RebornPvP',
    description: 'Système PvP custom avec classes, compétences, arènes et tournois automatiques.',
    status: 'in-progress',
    priority: 'high',
    progress: 55,
    category: 'pvp',
    version: '1.4.0',
    mcVersion: '1.21.8',
    assignees: ['4', '1'],
    tags: ['pvp', 'classes', 'arenes'],
    createdAt: '2024-03-10',
    updatedAt: '2026-06-22',
    tasks: [
      { id: 't5', projectId: 'p2', title: 'Classe Mage v2', description: 'Nouvelles compétences pour la classe Mage', status: 'in-progress', priority: 'high', assignee: '4', labels: ['feature', 'class'], createdAt: '2026-06-05' },
      { id: 't6', projectId: 'p2', title: 'Tournoi automatique', description: 'Système de tournoi hebdomadaire auto', status: 'todo', priority: 'medium', assignee: '1', labels: ['feature'], createdAt: '2026-06-12' },
      { id: 't7', projectId: 'p2', title: 'Fix cooldown skills', description: 'Bug cooldown reset en cas de mort', status: 'done', priority: 'high', labels: ['bugfix'], createdAt: '2026-06-08' },
      { id: 't8', projectId: 'p2', title: 'Arène Nether', description: 'Nouvelle carte arène thème Nether', status: 'review', priority: 'medium', assignee: '5', labels: ['map', 'arena'], createdAt: '2026-06-15' },
    ]
  },
  {
    id: 'p3',
    name: 'RebornEconomy',
    description: 'Économie avancée avec boutique, auctions, quêtes économiques et marché des joueurs.',
    status: 'active',
    priority: 'high',
    progress: 88,
    category: 'economy',
    version: '2.1.3',
    mcVersion: '1.21.8',
    assignees: ['2', '3'],
    tags: ['economy', 'shop', 'auction'],
    createdAt: '2024-02-01',
    updatedAt: '2026-06-21',
    tasks: [
      { id: 't9', projectId: 'p3', title: 'Auction house UI', description: 'Refonte interface hôtel des ventes', status: 'done', priority: 'high', assignee: '3', labels: ['ui'], createdAt: '2026-05-20' },
      { id: 't10', projectId: 'p3', title: 'Anti-inflation système', description: 'Mécaniques de contrôle inflation monnaie', status: 'in-progress', priority: 'medium', assignee: '2', labels: ['economy'], createdAt: '2026-06-10' },
    ]
  },
  {
    id: 'p4',
    name: 'RebornWorlds',
    description: 'Gestion des mondes custom : génération procédurale, biomes uniques, structures spéciales.',
    status: 'in-progress',
    priority: 'medium',
    progress: 34,
    category: 'world',
    version: '0.8.2',
    mcVersion: '1.21.8',
    assignees: ['5', '2'],
    tags: ['worldgen', 'biomes', 'structures'],
    createdAt: '2025-01-20',
    updatedAt: '2026-06-19',
    tasks: [
      { id: 't11', projectId: 'p4', title: 'Biome Volcanique', description: 'Nouveau biome avec mécanique lave active', status: 'in-progress', priority: 'medium', assignee: '5', labels: ['worldgen', 'biome'], createdAt: '2026-06-01' },
      { id: 't12', projectId: 'p4', title: 'Structure Donjon Custom', description: 'Donjons générés procéduralement avec boss', status: 'todo', priority: 'high', assignee: '2', labels: ['structure', 'dungeon'], createdAt: '2026-06-14' },
      { id: 't13', projectId: 'p4', title: 'Intégration Spigot WorldBorder', description: 'Compatibilité worldborder dynamique', status: 'todo', priority: 'low', labels: ['compatibility'], createdAt: '2026-06-18' },
    ]
  },
  {
    id: 'p5',
    name: 'RebornGuard',
    description: 'Système anti-cheat custom, modération automatique, logs et rapports d\'abus.',
    status: 'active',
    priority: 'critical',
    progress: 91,
    category: 'moderation',
    version: '4.0.1',
    mcVersion: '1.21.8',
    assignees: ['1', '4'],
    tags: ['anticheat', 'moderation', 'security'],
    createdAt: '2023-11-05',
    updatedAt: '2026-06-23',
    tasks: [
      { id: 't14', projectId: 'p5', title: 'Détection KillAura v3', description: 'Amélioration détection KillAura 1.21', status: 'done', priority: 'critical', assignee: '1', labels: ['anticheat'], createdAt: '2026-06-01' },
      { id: 't15', projectId: 'p5', title: 'Dashboard modération web', description: 'Interface web pour modérateurs', status: 'in-progress', priority: 'high', assignee: '3', labels: ['web', 'moderation'], createdAt: '2026-06-10' },
    ]
  },
  {
    id: 'p6',
    name: 'RebornQuests',
    description: 'Système de quêtes narratives, journaux de quêtes, récompenses uniques et arcs scénaristiques.',
    status: 'planned',
    priority: 'medium',
    progress: 12,
    category: 'gameplay',
    version: '0.2.0',
    mcVersion: '1.21.8',
    assignees: ['3'],
    tags: ['quests', 'story', 'rewards'],
    createdAt: '2026-05-01',
    updatedAt: '2026-06-15',
    tasks: [
      { id: 't16', projectId: 'p6', title: 'Architecture quête engine', description: 'Conception du moteur de quêtes', status: 'in-progress', priority: 'high', assignee: '3', labels: ['architecture'], createdAt: '2026-06-10' },
      { id: 't17', projectId: 'p6', title: 'Éditeur quêtes YAML', description: 'Système config quêtes en YAML', status: 'todo', priority: 'medium', labels: ['config'], createdAt: '2026-06-15' },
    ]
  },
];

export const changelog: ChangelogEntry[] = [
  {
    id: 'cl1',
    version: '3.2.1',
    date: '2026-06-20',
    type: 'patch',
    projectId: 'p1',
    projectName: 'RebornCore',
    changes: [
      { type: 'fixed', description: 'Correction exploit duplication items via coffre ender' },
      { type: 'fixed', description: 'Fix crash serveur lors du chargement de chunks corrompus' },
      { type: 'changed', description: 'Optimisation requêtes base de données (-40% latence)' },
    ]
  },
  {
    id: 'cl2',
    version: '4.0.1',
    date: '2026-06-18',
    type: 'hotfix',
    projectId: 'p5',
    projectName: 'RebornGuard',
    changes: [
      { type: 'fixed', description: 'Fix faux positifs sur téléportation légale' },
      { type: 'fixed', description: 'Correction logs manquants pour bans automatiques' },
      { type: 'security', description: 'Patch bypass anti-cheat via packets spéciaux' },
    ]
  },
  {
    id: 'cl3',
    version: '2.1.3',
    date: '2026-06-15',
    type: 'minor',
    projectId: 'p3',
    projectName: 'RebornEconomy',
    changes: [
      { type: 'added', description: 'Nouvelle interface Auction House avec filtres avancés' },
      { type: 'added', description: 'Historique des transactions sur 30 jours' },
      { type: 'changed', description: 'Refonte UI boutique admin' },
      { type: 'fixed', description: 'Fix montant négatif possible lors d\'échanges simultanés' },
    ]
  },
  {
    id: 'cl4',
    version: '1.4.0',
    date: '2026-06-10',
    type: 'minor',
    projectId: 'p2',
    projectName: 'RebornPvP',
    changes: [
      { type: 'added', description: 'Carte arène Nether (en cours de validation)' },
      { type: 'fixed', description: 'Bug cooldown skills resettés à la mort' },
      { type: 'changed', description: 'Rééquilibrage classe Archer (+15% dégâts flèche)' },
    ]
  },
  {
    id: 'cl5',
    version: '0.8.2',
    date: '2026-06-05',
    type: 'patch',
    projectId: 'p4',
    projectName: 'RebornWorlds',
    changes: [
      { type: 'added', description: 'Prototype biome volcanique (alpha)' },
      { type: 'fixed', description: 'Fix génération structures nulles en bord de monde' },
    ]
  },
];
