import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Changelog } from './pages/Changelog';
import { Team } from './pages/Team';
import { ServerStatus } from './pages/ServerStatus';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  '/':          { title: 'Vue d\'ensemble', subtitle: 'Tableau de bord REBORNMC · Minecraft 1.21.8 Java' },
  '/projects':  { title: 'Projets', subtitle: 'Gestion des plugins et modules du serveur' },
  '/tasks':     { title: 'Tâches', subtitle: 'Kanban board — suivi des tâches de développement' },
  '/changelog': { title: 'Changelog', subtitle: 'Historique des versions et mises à jour' },
  '/team':      { title: 'Équipe', subtitle: 'Membres de l\'équipe de développement' },
  '/server':    { title: 'Serveur', subtitle: 'Statut et métriques du serveur en temps réel' },
  '/users':     { title: 'Utilisateurs', subtitle: 'Gestion des comptes — Administration' },
  '/settings':  { title: 'Paramètres',   subtitle: 'Configuration du dashboard' },
};

function Layout({ children, path }: { children: React.ReactNode; path: string }) {
  const config = pageConfig[path] || { title: 'Dashboard', subtitle: '' };
  return (
    <div className="flex min-h-screen bg-[#0D1117]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title={config.title} subtitle={config.subtitle} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout path="/"><Overview /></Layout></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Layout path="/projects"><Projects /></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout path="/tasks"><Tasks /></Layout></ProtectedRoute>} />
        <Route path="/changelog" element={<ProtectedRoute><Layout path="/changelog"><Changelog /></Layout></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><Layout path="/team"><Team /></Layout></ProtectedRoute>} />
        <Route path="/server" element={<ProtectedRoute><Layout path="/server"><ServerStatus /></Layout></ProtectedRoute>} />
        <Route path="/users"    element={<ProtectedRoute roles={['admin']}><Layout path="/users"><UserManagement /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={['admin']}><Layout path="/settings"><Settings /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
