import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, ListTodo, BookOpen,
  Users, Server, ChevronRight, Sword, UserCog, Settings2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Vue d\'ensemble' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projets'         },
  { to: '/tasks',     icon: ListTodo,        label: 'Tâches'          },
  { to: '/changelog', icon: BookOpen,        label: 'Changelog'       },
  { to: '/team',      icon: Users,           label: 'Équipe'          },
  { to: '/server',    icon: Server,          label: 'Serveur'         },
];

const adminItems = [
  { to: '/users',    icon: UserCog,   label: 'Utilisateurs', color: 'mc-gold' },
  { to: '/settings', icon: Settings2, label: 'Paramètres',   color: 'mc-gold' },
];

function NavItem({ to, icon: Icon, label, accentColor = 'mc-green' }: {
  to: string; icon: React.ElementType; label: string; accentColor?: string;
}) {
  return (
    <li>
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
            <Icon size={16} className={isActive ? `text-${accentColor}` : `group-hover:text-${accentColor} transition-colors`} />
            <span>{label}</span>
            {isActive && <ChevronRight size={14} className={`ml-auto text-${accentColor}`} />}
          </>
        )}
      </NavLink>
    </li>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const { settings } = useSettings();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0D1117] border-r border-[#21262D] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#21262D]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-mc-green flex items-center justify-center shadow-mc-inset">
            <Sword size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-sm tracking-wider truncate">{settings.dashboard_name}</div>
            <div className="text-[#5DA832] text-xs mt-0.5">{settings.dashboard_subtitle}</div>
          </div>
        </div>
      </div>

      {/* Version badge */}
      <div className="px-6 py-3 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-mc-green rounded-full animate-pulse" />
          <span className="text-[#7D8590] text-xs">Minecraft {settings.mc_version} Java</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[#5DA832] text-xs font-semibold tracking-widest px-3 mb-3 uppercase">Navigation</p>
        <ul className="space-y-1">
          {navItems.map(item => <NavItem key={item.to} {...item} />)}
        </ul>

        {user?.role === 'admin' && (
          <>
            <p className="text-[#7D8590] text-xs font-semibold tracking-widest px-3 mt-6 mb-3 uppercase">Administration</p>
            <ul className="space-y-1">
              {adminItems.map(item => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} accentColor={item.color} />
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#21262D]">
        <div className="text-[#3D444D] text-xs text-center">
          © 2026 {settings.dashboard_name} — All rights reserved
        </div>
      </div>
    </aside>
  );
}
