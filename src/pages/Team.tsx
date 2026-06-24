import { teamMembers, projects } from '../data';
import { CheckCircle, Code, Star } from 'lucide-react';

export function Team() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teamMembers.map(member => {
          const memberProjects = projects.filter(p => p.assignees.includes(member.id));
          const allTasks = memberProjects.flatMap(p =>
            p.tasks.filter(t => t.assignee === member.id)
          );
          const inProgressTasks = allTasks.filter(t => t.status === 'in-progress' || t.status === 'todo' || t.status === 'review');
          const doneTasks = allTasks.filter(t => t.status === 'done');

          return (
            <div key={member.id} className="mc-card p-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded flex items-center justify-center text-lg font-bold flex-shrink-0"
                  style={{ backgroundColor: `${member.color}20`, color: member.color, border: `2px solid ${member.color}50` }}>
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">{member.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ color: member.color, backgroundColor: `${member.color}20`, border: `1px solid ${member.color}40` }}>
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0D1117] rounded p-3 text-center border border-[#21262D]">
                  <div className="text-xl font-bold" style={{ color: member.color }}>{inProgressTasks.length}</div>
                  <div className="text-xs text-[#7D8590] mt-0.5">Tâches actives</div>
                </div>
                <div className="bg-[#0D1117] rounded p-3 text-center border border-[#21262D]">
                  <div className="text-xl font-bold text-mc-green">{doneTasks.length}</div>
                  <div className="text-xs text-[#7D8590] mt-0.5">Terminées</div>
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="text-xs text-[#7D8590] mb-2 flex items-center gap-1.5">
                  <Code size={11} /> Projets assignés ({memberProjects.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {memberProjects.map(p => (
                    <span key={p.id} className="text-xs px-2 py-0.5 bg-[#161B22] text-[#7D8590] rounded border border-[#21262D]">
                      {p.name}
                    </span>
                  ))}
                  {memberProjects.length === 0 && (
                    <span className="text-xs text-[#3D444D]">Aucun projet</span>
                  )}
                </div>
              </div>

              {/* Active tasks preview */}
              {inProgressTasks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#21262D]">
                  <div className="text-xs text-[#7D8590] mb-2 flex items-center gap-1.5">
                    <Star size={11} className="text-mc-gold" /> Tâches récentes
                  </div>
                  <div className="space-y-1.5">
                    {inProgressTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-xs">
                        <CheckCircle size={10} style={{ color: member.color }} />
                        <span className="text-[#C9D1D9] truncate">{task.title}</span>
                      </div>
                    ))}
                    {inProgressTasks.length > 3 && (
                      <div className="text-xs text-[#3D444D] pl-4">
                        +{inProgressTasks.length - 3} autres...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
