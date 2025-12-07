import React from 'react';

const StoryCard = ({ children, color = "from-purple-900 to-black", title, subtitle }) => (
  <div className={`w-full h-full bg-gradient-to-br ${color} flex flex-col items-center text-white relative overflow-hidden font-sans`}>
    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
    
    <div className="mt-14 z-20 text-center w-full shrink-0 px-4">
      <h2 className="text-3xl font-black tracking-tighter uppercase drop-shadow-xl">{title}</h2>
      {subtitle && <p className="text-sm opacity-80 font-medium mt-1">{subtitle}</p>}
    </div>
    
    <div className="flex-1 w-full flex flex-col justify-center items-center z-10 gap-4 overflow-y-auto no-scrollbar px-6 py-4">
      {children}
    </div>
    
    <div className="mb-8 z-20 opacity-40 text-[10px] tracking-[0.2em] font-bold shrink-0">WHATSAPP WRAPPED 2025</div>
  </div>
);

export default StoryCard;