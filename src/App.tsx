import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './pages/Overview';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Changelog } from './pages/Changelog';
import { Team } from './pages/Team';
import { ServerStatus } from './pages/ServerStatus';

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  '/':          { title: 'Vue d\'ensemble', subtitle: 'Tableau de bord REBORNMC · Minecraft 1.21.8 Java' },
  '/projects':  { title: 'Projets', subtitle: 'Gestion des plugins et modules du serveur' },
  '/tasks':     { title: 'Tâches', subtitle: 'Kanban board — suivi des tâches de développement' },
  '/changelog': { title: 'Changelog', subtitle: 'Historique des versions et mises à jour' },
  '/team':      { title: 'Équipe', subtitle: 'Membres de l\'équipe de développement' },
  '/server':    { title: 'Serveur', subtitle: 'Statut et métriques du serveur en temps réel' },
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
    <BrowserRouter basename="/devdashboard">
      <Routes>
        <Route path="/" element={<Layout path="/"><Overview /></Layout>} />
        <Route path="/projects" element={<Layout path="/projects"><Projects /></Layout>} />
        <Route path="/tasks" element={<Layout path="/tasks"><Tasks /></Layout>} />
        <Route path="/changelog" element={<Layout path="/changelog"><Changelog /></Layout>} />
        <Route path="/team" element={<Layout path="/team"><Team /></Layout>} />
        <Route path="/server" element={<Layout path="/server"><ServerStatus /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
