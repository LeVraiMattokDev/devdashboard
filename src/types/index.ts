export type ProjectStatus = 'active' | 'in-progress' | 'planned' | 'completed' | 'on-hold';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type PluginCategory = 'gameplay' | 'economy' | 'moderation' | 'utility' | 'pvp' | 'world';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  category: PluginCategory;
  version: string;
  mcVersion: string;
  assignees: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  githubUrl?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  labels: string[];
}

export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  projectId: string;
  projectName: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed' | 'security';
    description: string;
  }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  activeTasks: number;
  completedProjects: number;
}

export interface ServerInfo {
  name: string;
  version: string;
  status: 'online' | 'offline' | 'maintenance';
  players: { current: number; max: number };
  uptime: string;
  tps: number;
  ram: { used: number; max: number };
}
