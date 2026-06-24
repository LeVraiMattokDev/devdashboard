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
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  tasks: Task[];
  githubUrl?: string | null;
  github_url?: string | null;
}

export interface Task {
  id: string;
  projectId: string;
  project_id?: string;
  projectName?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
  created_at?: string;
  labels: string[];
}

export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  projectId: string;
  project_id?: string;
  projectName: string;
  project_name?: string;
  changes: { type: 'added' | 'changed' | 'fixed' | 'removed' | 'security'; description: string }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  activeTasks: number;
  completedProjects: number;
  assignedProjects?: number;
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

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'developer' | 'viewer';
  displayRole: string;
  avatar: string;
  color: string;
  mustChangePw: boolean;
}

export interface AppUser {
  id: number;
  username: string;
  email: string;
  role: string;
  display_role: string;
  avatar: string;
  color: string;
  must_change_pw: number;
  last_login: string | null;
  created_at: string;
}
