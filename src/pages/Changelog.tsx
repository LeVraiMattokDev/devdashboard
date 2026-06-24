import { changelog } from '../data';
import { Plus, RefreshCw, Wrench, Trash2, ShieldCheck } from 'lucide-react';

const changeTypeConfig = {
  added:    { icon: Plus,        color: '#5DA832', label: 'Ajout' },
  changed:  { icon: RefreshCw,   color: '#3EEEFF', label: 'Modifié' },
  fixed:    { icon: Wrench,      color: '#FFAA00', label: 'Corrigé' },
  removed:  { icon: Trash2,      color: '#CC0000', label: 'Supprimé' },
  security: { icon: ShieldCheck, color: '#CC0000', label: 'Sécurité' },
};

const releaseTypeConfig = {
  major:  { label: 'MAJEUR',  color: '#5DA832', bg: 'rgba(93,168,50,0.15)' },
  minor:  { label: 'MINEUR',  color: '#3EEEFF', bg: 'rgba(62,238,255,0.1)' },
  patch:  { label: 'PATCH',   color: '#FFAA00', bg: 'rgba(255,170,0,0.1)' },
  hotfix: { label: 'HOTFIX',  color: '#CC0000', bg: 'rgba(204,0,0,0.15)' },
};

export function Changelog() {
  return (
    <div className="p-6 space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(releaseTypeConfig).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded font-mono font-bold"
              style={{ color: val.color, backgroundColor: val.bg, border: `1px solid ${val.color}40` }}>
              {val.label}
            </span>
          </div>
        ))}
        <div className="ml-auto text-[#7D8590] text-xs">{changelog.length} releases</div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[120px] top-0 bottom-0 w-px bg-[#21262D]" />

        <div className="space-y-6">
          {changelog.map((entry) => {
            const rConfig = releaseTypeConfig[entry.type];
            return (
              <div key={entry.id} className="flex gap-6">
                {/* Date + type */}
                <div className="w-[120px] flex-shrink-0 pt-1 text-right pr-4">
                  <div className="text-xs text-[#7D8590] mb-1">{entry.date}</div>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold"
                    style={{ color: rConfig.color, backgroundColor: rConfig.bg, border: `1px solid ${rConfig.color}40` }}>
                    {rConfig.label}
                  </span>
                </div>

                {/* Dot */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -left-2 top-2 w-4 h-4 rounded border-2 flex items-center justify-center"
                    style={{ borderColor: rConfig.color, backgroundColor: '#0D1117' }}>
                    <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: rConfig.color }} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pl-4 pb-2">
                  <div className="mc-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-white font-semibold">{entry.projectName}</h3>
                      <span className="text-mc-green font-mono text-sm font-bold">v{entry.version}</span>
                    </div>

                    <div className="space-y-2">
                      {entry.changes.map((change, i) => {
                        const cfg = changeTypeConfig[change.type];
                        const Icon = cfg.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                              <Icon size={12} style={{ color: cfg.color }} />
                              <span className="text-xs font-semibold w-16" style={{ color: cfg.color }}>
                                {cfg.label}
                              </span>
                            </div>
                            <span className="text-[#C9D1D9]">{change.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
