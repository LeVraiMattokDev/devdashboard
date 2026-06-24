import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-14 border-b border-[#21262D] flex items-center justify-between px-6 bg-[#0D1117]/80 backdrop-blur sticky top-0 z-40">
      <div>
        <h1 className="text-white font-semibold text-base">{title}</h1>
        {subtitle && <p className="text-[#7D8590] text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8590]" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-[#161B22] border border-[#30363D] text-sm text-[#7D8590] rounded pl-8 pr-4 py-1.5 w-48 focus:outline-none focus:border-mc-green focus:text-white transition-colors placeholder:text-[#3D444D]"
          />
        </div>
        <button className="relative p-2 rounded text-[#7D8590] hover:text-white hover:bg-[#161B22] transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mc-redstone rounded-full" />
        </button>
        <div className="w-8 h-8 bg-mc-green flex items-center justify-center rounded text-white text-xs font-bold shadow-mc-inset">
          LM
        </div>
      </div>
    </header>
  );
}
