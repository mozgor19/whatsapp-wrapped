import React from 'react';

const StatRow = ({ label, value, sub, isLeader }) => (
  <div className={`w-full flex justify-between items-center p-3 rounded-xl border ${isLeader ? 'bg-white/20 border-white/40 shadow-lg scale-[1.02]' : 'bg-black/20 border-white/5'}`}>
    <div className="flex items-center gap-3 overflow-hidden flex-1">
      {isLeader && <span className="text-lg shrink-0">👑</span>}
      <span className={`font-bold text-sm md:text-base break-words leading-tight ${isLeader ? 'text-white' : 'text-gray-300'}`}>{label}</span>
    </div>
    <div className="text-right shrink-0 ml-3">
      <div className="font-mono text-lg font-bold">{value}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </div>
  </div>
);

export default StatRow;