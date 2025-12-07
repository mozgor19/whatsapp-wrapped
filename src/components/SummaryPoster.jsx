import React from 'react';

const SummaryPoster = ({ data }) => {
  const findWinner = (obj, key = null) => {
    if (!obj || Object.keys(obj).length === 0) return { name: '-', val: '-' };
    let max = -1, winner = '-';
    Object.entries(obj).forEach(([user, stats]) => {
      const val = key ? stats[key] : stats;
      if (typeof val === 'number' && val > max) { max = val; winner = user; }
    });
    return { name: winner, val: max };
  };

  const categories = [
    { title: "MESAJ KRALI", ...findWinner(data.messages.reduce((acc, curr) => ({...acc, [curr['Kişi']]: curr['Mesaj Sayısı']}), {})) },
    { title: "EN HIZLI DÖNÜŞ", name: Object.entries(data.response_time).sort((a,b) => (a[1]?.minutes||999)-(b[1]?.minutes||999))[0]?.[0] || '-', val: "⚡" },
    { title: "EMOJİ BAĞIMLISI", ...findWinner(Object.keys(data.emojis).reduce((acc, user) => ({...acc, [user]: data.emojis[user]?.length || 0}), {})) },
    { title: "SORU MAKİNESİ", ...findWinner(data.questions, "question_count") },
    { title: "CAPS LOCKÇU", ...findWinner(data.caps, "shout_count") },
    { title: "SESLİ MESAJCI", ...findWinner(data.media, "audio_count") },
    { title: "STICKER USTASI", name: data.special_actions.sticker?.leader || '-', val: data.special_actions.sticker?.count || '-' },
    { title: "SİLİCİ", name: data.special_actions.deleted?.leader || '-', val: data.special_actions.deleted?.count || '-' },
    { title: "EDEBİYATÇI", ...findWinner(data.vocabulary, "unique") },
    { title: "BAŞLATICI", name: data.initiator?.leader || '-', val: "🚀" },
    { title: "GECE KUŞU", name: data.milestones.latest_message.user, val: data.milestones.latest_message.time },
  ];

  return (
    <div id="poster-download" className="w-[1080px] h-[1920px] bg-gradient-to-br from-purple-950 via-black to-blue-950 text-white p-12 flex flex-col items-center justify-between shrink-0 origin-top transform scale-[0.25] md:scale-[0.35] relative mb-[-1400px] border-8 border-purple-500/30 shadow-2xl">
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-[200px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[200px]" />
      </div>

      <div className="text-center w-full border-b-4 border-purple-500/50 pb-8 pt-4 z-10">
        <div className="text-[160px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 tracking-tighter filter drop-shadow-2xl animate-pulse">2025</div>
        <h2 className="text-6xl font-bold tracking-[0.6em] text-white mt-4 drop-shadow-lg">WHATSAPP WRAPPED</h2>
        <div className="text-2xl text-purple-300 mt-2 font-light tracking-wider">Yılın Özeti</div>
      </div>

      <div className="w-full grid grid-cols-2 gap-8 my-8 z-10">
        <div className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-xl p-10 rounded-3xl text-center border-2 border-purple-500/30 shadow-2xl">
          <div className="text-5xl text-purple-300 mb-3 font-bold tracking-wider">TOPLAM</div>
          <div className="text-9xl font-black text-white drop-shadow-xl">{data.messages.reduce((a,b)=>a+b['Mesaj Sayısı'],0).toLocaleString()}</div>
          <div className="text-3xl text-purple-200 mt-3 font-bold">MESAJ</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900/80 to-cyan-900/80 backdrop-blur-xl p-10 rounded-3xl text-center border-2 border-blue-500/30 shadow-2xl">
          <div className="text-5xl text-blue-300 mb-3 font-bold tracking-wider">REKOR GÜN</div>
          <div className="text-7xl font-black text-white drop-shadow-xl">{data.peak_day.date}</div>
          <div className="text-4xl text-blue-200 mt-3 font-mono font-bold">{data.peak_day.count} mesaj</div>
        </div>
      </div>

      <div className="flex-1 w-full bg-black/50 backdrop-blur-xl rounded-3xl p-12 flex flex-col justify-center gap-6 border-2 border-white/10 shadow-2xl relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-3xl font-black tracking-widest border-2 border-white/20 rounded-full shadow-xl">
          KATEGORİ LİDERLERİ 🏆
        </div>
        
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 hover:bg-white/5 px-4 rounded-xl transition-all">
            <div className="flex flex-col pr-6">
              <span className="text-2xl text-purple-400 font-bold tracking-widest mb-2">{cat.title}</span>
              <span className="text-5xl font-black text-white break-words leading-none uppercase drop-shadow-lg">{cat.name || '-'}</span>
            </div>
            <span className="text-6xl font-mono text-purple-300 font-bold whitespace-nowrap drop-shadow-lg">{typeof cat.val === 'number' ? cat.val.toLocaleString() : cat.val}</span>
          </div>
        ))}
      </div>

      <div className="text-center w-full pt-8 opacity-50 z-10">
        <div className="text-2xl font-mono tracking-[0.5em] font-bold text-purple-300">🔒 %100 GÜVENLİ • CLIENT-SIDE</div>
      </div>
    </div>
  );
};

export default SummaryPoster;