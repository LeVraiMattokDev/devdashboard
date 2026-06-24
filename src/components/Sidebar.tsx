import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, ListTodo, BookOpen,
  Users, Server, ChevronRight, Sword, UserCog
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Vue d\'ensemble', roles: null },
  { to: '/projects', icon: FolderKanban, label: 'Projets', roles: null },
  { to: '/tasks', icon: ListTodo, label: 'Tâches', roles: null },
  { to: '/changelog', icon: BookOpen, label: 'Changelog', roles: null },
  { to: '/team', icon: Users, label: 'Équipe', roles: null },
  { to: '/server', icon: Server, label: 'Serveur', roles: null },
];

const adminItems = [
  { to: '/users', icon: UserCog, label: 'Utilisateurs', roles: ['admin'] },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0D1117] border-r border-[#21262D] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#21262D]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-mc-green flex items-center justify-center shadow-mc-inset">
            <Sword size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wider">REBORNMC</div>
            <div className="text-[#5DA832] text-xs mt-0.5">Dev Dashboard</div>
          </div>
        </div>
      </div>

      {/* Version badge */}
      <div className="px-6 py-3 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-mc-green rounded-full animate-pulse" />
          <span className="text-[#7D8590] text-xs">Minecraft 1.21.8 Java</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[#5DA832] text-xs font-semibold tracking-widest px-3 mb-3 uppercase">Navigation</p>
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150 group
                  ${isActive
                    ? 'bg-[#1C2128] text-white border border-[#30363D] shadow-inner'
                    : 'text-[#7D8590] hover:text-white hover:bg-[#161B22]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-mc-green' : 'group-hover:text-mc-green transition-colors'} />
                    <span>{label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto text-mc-green" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {user?.role === 'admin' && (
          <>
            <p className="text-[#7D8590] text-xs font-semibold tracking-widest px-3 mt-6 mb-3 uppercase">Administration</p>
            <ul className="space-y-1">
              {adminItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150 group
                      ${isActive
                        ? 'bg-[#1C2128] text-white border border-[#30363D] shadow-inner'
                        : 'text-[#7D8590] hover:text-white hover:bg-[#161B22]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className={isActive ? 'text-mc-gold' : 'group-hover:text-mc-gold transition-colors'} />
                        <span>{label}</span>
                        {isActive && <ChevronRight size={14} className="ml-auto text-mc-gold" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#21262D]">
        <div className="text-[#3D444D] text-xs text-center">
          © 2026 REBORNMC — All rights reserved
        </div>
      </div>
    </aside>
  );
}
