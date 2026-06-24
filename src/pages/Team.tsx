import { useState, useEffect } from 'react';
import { CheckCircle, Code } from 'lucide-react';
import { team as teamApi } from '../api';
import { Avatar } from '../components/Avatar';
import type { TeamMember } from '../types';

export function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    teamApi.list().then(setMembers).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map(member => (
          <div key={member.id} className="mc-card p-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-4">
              <Avatar value={member.avatar} color={member.color} size={56} />
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
                <div className="text-xl font-bold" style={{ color: member.color }}>{member.activeTasks}</div>
                <div className="text-xs text-[#7D8590] mt-0.5">Tâches actives</div>
              </div>
              <div className="bg-[#0D1117] rounded p-3 text-center border border-[#21262D]">
                <div className="text-xl font-bold text-mc-green">{member.completedProjects}</div>
                <div className="text-xs text-[#7D8590] mt-0.5">Tâches terminées</div>
              </div>
            </div>

            {/* Projects count */}
            {member.assignedProjects !== undefined && (
              <div>
                <div className="text-xs text-[#7D8590] mb-2 flex items-center gap-1.5">
                  <Code size={11} /> Projets assignés ({member.assignedProjects})
                </div>
                {member.assignedProjects === 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-[#3D444D]">Aucun projet</span>
                  </div>
                )}
              </div>
            )}

            {member.activeTasks > 0 && (
              <div className="mt-4 pt-4 border-t border-[#21262D]">
                <div className="text-xs text-[#7D8590] flex items-center gap-1.5">
                  <CheckCircle size={10} style={{ color: member.color }} />
                  {member.activeTasks} tâche{member.activeTasks > 1 ? 's' : ''} en cours
                </div>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <div className="col-span-3 text-center py-16 text-[#3D444D]">Chargement...</div>
        )}
      </div>
    </div>
  );
}
