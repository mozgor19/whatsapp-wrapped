import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { 
  Upload, Download, ChevronRight, ChevronLeft, Instagram, 
  Clock, Zap, Smile, Trash2, 
  AlertCircle, Hash, Sparkles, Trophy, Calendar,
  ShieldCheck, HelpCircle, X
} from 'lucide-react';

import { parseWhatsAppToCSV } from './utils/parser';
import { WhatsAppAnalyzer } from './utils/analyzer';

// --- CSS ---
const scrollHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- COMPONENTS ---

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

const StatRow = ({ label, value, sub, isLeader }) => (
  <div className={`w-full flex justify-between items-center p-3 rounded-xl border ${isLeader ? 'bg-white/20 border-white/40 shadow-lg scale-[1.02]' : 'bg-black/20 border-white/5'}`}>
    <div className="flex items-center gap-3 overflow-hidden flex-1">
       {isLeader && <span className="text-lg shrink-0">👑</span>}
       {/* DÜZELTME: İsimler kesilmesin diye break-words eklendi */}
       <span className={`font-bold text-sm md:text-base break-words leading-tight ${isLeader ? 'text-white' : 'text-gray-300'}`}>{label}</span>
    </div>
    <div className="text-right shrink-0 ml-3">
      <div className="font-mono text-lg font-bold">{value}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </div>
  </div>
);

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
    { title: "STICKER USTASI", name: data.special_actions.sticker?.leader || '-', val: data.special_actions.sticker?.count || '-' },
    { title: "EDEBİYATÇI", ...findWinner(data.vocabulary, "unique") },
    { title: "BAŞLATICI", name: data.initiator?.leader || '-', val: "Lider" },
    { title: "GECE KUŞU", name: data.milestones.latest_message.user, val: data.milestones.latest_message.time },
  ];

  return (
    <div id="poster-download" className="w-[1080px] h-[1920px] bg-[#050505] text-white p-12 flex flex-col items-center justify-between shrink-0 origin-top transform scale-[0.25] md:scale-[0.35] relative mb-[-1400px] border-[16px] border-[#1a1a1a]">
      
      <div className="text-center w-full border-b-8 border-purple-600 pb-8 pt-4">
        <h1 className="text-[130px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 tracking-tighter filter drop-shadow-2xl">2025</h1>
        <h2 className="text-5xl font-bold tracking-[0.6em] text-white mt-2">WHATSAPP LINE-UP</h2>
      </div>

      <div className="w-full grid grid-cols-2 gap-8 my-6">
         <div className="bg-[#111] p-8 rounded-3xl text-center border-2 border-gray-800 shadow-xl">
            <div className="text-4xl text-gray-500 mb-2 font-bold tracking-wider">TOPLAM</div>
            <div className="text-8xl font-black text-white">{data.messages.reduce((a,b)=>a+b['Mesaj Sayısı'],0).toLocaleString()}</div>
            <div className="text-2xl text-gray-600 mt-2 font-bold">MESAJ</div>
         </div>
         <div className="bg-[#111] p-8 rounded-3xl text-center border-2 border-gray-800 shadow-xl">
            <div className="text-4xl text-gray-500 mb-2 font-bold tracking-wider">REKOR GÜN</div>
            <div className="text-6xl font-black text-purple-400">{data.peak_day.date}</div>
            <div className="text-3xl text-gray-400 mt-2 font-mono font-bold">{data.peak_day.count} mesaj</div>
         </div>
      </div>

      <div className="flex-1 w-full bg-[#111] rounded-3xl p-10 flex flex-col justify-center gap-5 border-2 border-gray-800 shadow-2xl relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050505] px-6 py-2 text-2xl font-bold tracking-widest border-2 border-gray-800 rounded-full">KATEGORİ LİDERLERİ</div>
         
         {categories.map((cat, i) => (
            <div key={i} className="flex items-end justify-between border-b border-gray-800 pb-3 last:border-0">
               <div className="flex flex-col pr-4">
                  <span className="text-xl text-purple-500 font-bold tracking-widest mb-1">{cat.title}</span>
                  <span className="text-4xl font-black text-white break-words leading-none uppercase">{cat.name || '-'}</span>
               </div>
               <span className="text-5xl font-mono text-gray-600 font-bold whitespace-nowrap">{typeof cat.val === 'number' ? cat.val.toLocaleString() : cat.val}</span>
            </div>
         ))}
      </div>

      <div className="text-center w-full pt-8 opacity-40">
         <div className="text-2xl font-mono tracking-[0.5em] font-bold">CLIENT-SIDE SECURE ANALYSIS</div>
      </div>
    </div>
  );
};

const InfoSection = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(() => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('iphone') || ua.includes('ipad') ? 'ios' : 'android';
  });

  return (
   <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#111] w-full max-w-2xl rounded-3xl border border-gray-800 max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col">
         
         <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#111] z-10">
            <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
               <HelpCircle className="text-blue-500" /> NASIL YAPILIR?
            </h3>
            <button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors text-white"><X size={20} /></button>
         </div>
         
         <div className="p-6 space-y-8">
            <div className="flex bg-gray-900 p-1 rounded-xl">
               <button onClick={() => setActiveTab('ios')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'ios' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}><span className="text-lg">🍎</span> iOS (iPhone)</button>
               <button onClick={() => setActiveTab('android')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'android' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><span className="text-lg">🤖</span> Android</button>
            </div>

            <div className="space-y-6">
               {activeTab === 'ios' ? (
                  <div className="space-y-4">
                     <div className="flex gap-4 items-center bg-gray-800/30 p-4 rounded-xl border border-gray-700"><div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 font-bold">1</div><p className="text-gray-300">WhatsApp'ı açın ve analiz etmek istediğiniz <strong>Sohbete</strong> girin.</p></div>
                     <div className="flex gap-4 items-center bg-gray-800/30 p-4 rounded-xl border border-gray-700"><div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 font-bold">2</div><p className="text-gray-300">En üstteki <strong>Kişi/Grup İsmine (Contact Info)</strong> tıklayın.</p></div>
                     <div className="flex gap-4 items-center bg-gray-800/30 p-4 rounded-xl border border-gray-700"><div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 font-bold">3</div><p className="text-gray-300">En aşağı inin ve <strong className="text-blue-400">Sohbeti Dışa Aktar (Export Chat)</strong> seçeneğine basın.</p></div>
                  </div>
               ) : (
                  <div className="space-y-4">
                     <div className="flex gap-4 items-center bg-gray-800/30 p-4 rounded-xl border border-gray-700"><div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 font-bold">1</div><p className="text-gray-300">Sohbete girin ve sağ üstteki <strong>üç noktaya (⋮)</strong> tıklayın.</p></div>
                     <div className="flex gap-4 items-center bg-gray-800/30 p-4 rounded-xl border border-gray-700"><div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 font-bold">2</div><p className="text-gray-300">Sırasıyla <strong>Diğer (More) {'>'} Sohbeti Dışa Aktar (Export Chat)</strong> seçeneğine basın.</p></div>
                  </div>
               )}

               <div className="mt-6 bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex gap-4 items-start animate-pulse">
                  <AlertCircle className="text-red-400 shrink-0 mt-1" size={24} />
                  <div>
                     <h4 className="font-bold text-red-400 mb-1 text-lg">ÇOK ÖNEMLİ / IMPORTANT:</h4>
                     <p className="text-gray-300">Karşınıza çıkan soruda mutlaka <strong>"MEDYA EKLEME" (Without Media)</strong> seçeneğini seçin. <br/><br/><span className="opacity-60 text-sm">Medyalı dosyalar çok büyük olur ve tarayıcınız işleyemeyebilir.</span></p>
                  </div>
               </div>

               <div className="flex gap-4 items-center bg-green-900/20 p-4 rounded-xl border border-green-800/50">
                  <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-xl shrink-0">✓</div>
                  <p className="text-gray-300">Oluşan <strong>.zip</strong> veya <strong>.txt</strong> dosyasını kaydedin ve bu siteye yükleyin.</p>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-800 text-center">
               <div className="inline-flex items-center gap-2 text-green-500/90 text-sm font-bold bg-green-900/20 px-4 py-2 rounded-full border border-green-900/50">
                  <ShieldCheck size={16} />
                  <span>%100 GÜVENLİ • CİHAZINIZDA İŞLENİR</span>
               </div>
            </div>
         </div>
      </div>
   </div>
  );
};

// --- APP ---

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const storyRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setTimeout(async () => {
      try {
        let text = "";
        if (file.name.endsWith('.zip')) {
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          const txtFile = Object.values(contents.files).find(f => f.name.endsWith('.txt'));
          if (txtFile) text = await txtFile.async('text');
          else { alert("ZIP içinde .txt bulunamadı!"); setLoading(false); return; }
        } else {
          text = await file.text();
        }

        const parsedData = parseWhatsAppToCSV(text);
        if (parsedData.length === 0) {
          alert("Mesaj bulunamadı! Formatın doğru olduğundan emin olun.");
          setLoading(false); return;
        }

        const analyzer = new WhatsAppAnalyzer(parsedData);
        setData(analyzer.analyzeAll());
        setSlideIndex(0);
      } catch (error) {
        console.error(error);
        alert("Hata oluştu.");
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const downloadSlide = async () => {
    if (!storyRef.current) return;
    const canvas = await html2canvas(storyRef.current, { scale: 2, useCORS: true, backgroundColor: '#000' });
    const link = document.createElement('a');
    link.download = `story-slide-${slideIndex}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadPoster = async () => {
    const el = document.getElementById('poster-download');
    if (!el) return;
    const originalStyle = el.style.cssText;
    el.style.transform = 'none'; el.style.margin = '0'; el.style.position = 'fixed'; el.style.top = '0'; el.style.left = '0'; el.style.zIndex = '-1';
    const canvas = await html2canvas(el, { scale: 1, useCORS: true, backgroundColor: '#050505' });
    el.style.cssText = originalStyle;
    const link = document.createElement('a');
    link.download = `whatsapp-lineup-2025.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getSlides = () => {
    if (!data) return [];
    const slides = [];

    // 1. GİRİŞ
    slides.push(
      <StoryCard title="2025 ÖZETİ" color="from-black to-gray-800">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">WRAPPED</h1>
        <p className="text-xl text-gray-400 mt-4">Sohbetinizin DNA'sı çıkarıldı.</p>
        <div className="mt-12 bg-white/10 px-6 py-3 rounded-full border border-white/20">
          <span className="font-bold text-2xl">{data.messages.reduce((a,b)=>a+b['Mesaj Sayısı'],0).toLocaleString()}</span> <span className="text-sm">Toplam Mesaj</span>
        </div>
      </StoryCard>
    );

    // 2. MESAJ SIRALAMASI
    slides.push(
      <StoryCard title="KİM NE KADAR YAZDI?" subtitle="Grubun en aktif parmakları" color="from-indigo-900 to-purple-900">
        <div className="w-full space-y-4">
          {data.messages.slice(0, 6).map((m, i) => (
            <StatRow key={i} label={m['Kişi']} value={m['Mesaj Sayısı']} sub="mesaj gönderdi" isLeader={i===0} />
          ))}
        </div>
      </StoryCard>
    );

    // 3. ZAMAN ANALİZİ
    slides.push(
      <StoryCard title="ZAMANLAMA" subtitle="Hangi anlarda aktiftiniz?" color="from-blue-900 to-slate-900">
        <div className="text-center mb-8 bg-white/5 p-6 rounded-3xl w-full border border-white/10">
          <Clock className="w-12 h-12 mx-auto mb-2 text-blue-400" />
          <div className="text-gray-400 text-xs tracking-widest uppercase mb-1">EN AKTİF SAAT ARALIĞI</div>
          <div className="text-2xl font-black text-white">{data.hourly.most_active}</div>
        </div>
        <div className="text-center bg-white/5 p-6 rounded-3xl w-full border border-white/10">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-pink-400" />
          <div className="text-gray-400 text-xs tracking-widest uppercase mb-1">FAVORİ GÜN</div>
          <div className="text-2xl font-black text-white">{data.daily.busiest_day}</div>
          <div className="text-sm opacity-60">Toplam {data.daily.max_count} mesaj atıldı</div>
        </div>
      </StoryCard>
    );

    // 4. İLETİŞİM KARAKTERİ (DÜZELTME: İsimler kesilmesin diye düzenlendi)
    slides.push(
      <StoryCard title="İLETİŞİM TARZI" subtitle="Karakter Analizi" color="from-teal-900 to-emerald-900">
        <div className="w-full space-y-4">
          <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 p-5 rounded-2xl border border-white/10">
             <div className="flex items-center gap-2 mb-2 text-emerald-300"><Hash size={20} /> <span className="font-bold">SORU MAKİNESİ</span></div>
             {Object.entries(data.questions).sort((a,b)=>b[1].question_count-a[1].question_count).slice(0,1).map(([u, s]) => (
                <div key={u}><div className="flex justify-between items-end"><span className="text-xl font-bold break-words w-2/3">{u}</span><span className="text-2xl font-mono">{s.question_count}</span></div><div className="text-xs text-gray-400 mt-1">Toplam soru sorma sayısı</div></div>
             ))}
          </div>
          <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 p-5 rounded-2xl border border-white/10">
             <div className="flex items-center gap-2 mb-2 text-orange-300"><AlertCircle size={20} /> <span className="font-bold">BÜYÜK HARF (BAĞIRAN)</span></div>
             {Object.entries(data.caps).sort((a,b)=>b[1].shout_count-a[1].shout_count).slice(0,1).map(([u, s]) => (
                <div key={u}><div className="flex justify-between items-end"><span className="text-xl font-bold break-words w-2/3">{u}</span><span className="text-2xl font-mono">{s.shout_count}</span></div><div className="text-xs text-gray-400 mt-1">Kez büyük harflerle yazdı</div></div>
             ))}
          </div>
          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-5 rounded-2xl border border-white/10">
             <div className="flex items-center gap-2 mb-2 text-blue-300"><Sparkles size={20} /> <span className="font-bold">EDEBİYATÇI</span></div>
             {Object.entries(data.vocabulary).sort((a,b)=>b[1].unique-a[1].unique).slice(0,1).map(([u, s]) => (
                <div key={u}><div className="flex justify-between items-end"><span className="text-xl font-bold break-words w-2/3">{u}</span><span className="text-2xl font-mono">{s.unique}</span></div><div className="text-xs text-gray-400 mt-1">Farklı kelime kullanma sayısı</div></div>
             ))}
          </div>
        </div>
      </StoryCard>
    );

    // 5. EN ÇOK KULLANILANLAR (DÜZELTME: Emojiler gözükmüyorsa diye kontrol)
    slides.push(
      <StoryCard title="ENLER LİSTESİ" subtitle="Dilinizden düşmeyenler" color="from-yellow-700 to-orange-900">
         <div className="w-full space-y-6">
            {Object.keys(data.emojis).slice(0, 2).map(user => (
               <div key={user} className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <div className="text-sm font-bold text-orange-300 mb-3 uppercase tracking-wider">{user}</div>
                  <div className="mb-4">
                     <div className="text-xs opacity-50 mb-1">FAVORİ KELİMELER</div>
                     <div className="flex flex-wrap gap-2">{data.words[user]?.slice(0,3).map((w, idx) => (<span key={idx} className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium border border-white/10">{w.word} <span className="opacity-50 text-xs ml-1">({w.count})</span></span>))}</div>
                  </div>
                  <div>
                     <div className="text-xs opacity-50 mb-1">FAVORİ EMOJİLER</div>
                     <div className="flex gap-3 text-2xl">
                        {data.emojis[user] && data.emojis[user].length > 0 ? (
                            data.emojis[user].slice(0,5).map((e, idx) => (
                                <div key={idx} className="relative group cursor-help">{e.emoji}<span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{e.count}</span></div>
                            ))
                        ) : <span className="text-xs opacity-50">Emoji kullanılmamış</span>}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </StoryCard>
    );

    // 6. KELİME KALIPLARI
    slides.push(
        <StoryCard title="FAVORİ CÜMLELER" subtitle="Birbirinize en çok böyle seslendiniz" color="from-green-900 to-teal-900">
            <div className="w-full space-y-4">
                {Object.keys(data.bigrams).slice(0, 2).map(user => (
                    <div key={user} className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-sm font-bold text-green-300 mb-2 uppercase">{user}</div>
                        <div className="space-y-2">
                            {data.bigrams[user]?.slice(0,3).map((bg, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="italic break-words w-2/3">"{bg.phrase}"</span>
                                    <span className="opacity-60 shrink-0">{bg.count} kez</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </StoryCard>
    );

    // 7. DERİN ANALİZ
    slides.push(
      <StoryCard title="DERİN SULAR" subtitle="Sohbet derinliği ve hızı" color="from-rose-900 to-pink-950">
         <div className="text-center mb-6 w-full bg-gradient-to-b from-white/10 to-transparent p-6 rounded-2xl border border-white/10">
            <Zap className="mx-auto mb-2 text-yellow-400 w-8 h-8"/>
            <div className="text-xs font-bold tracking-widest opacity-60 uppercase mb-1">REKOR KESİNTİSİZ SOHBET</div>
            <div className="text-5xl font-black text-white drop-shadow-lg">{data.deep_talks[0]?.duration_str || "Veri Yok"}</div>
            <div className="text-xs mt-3 opacity-70 bg-black/30 inline-block px-3 py-1 rounded-full">{data.deep_talks[0]?.date} • {data.deep_talks[0]?.message_count} Mesaj</div>
         </div>
         <div className="w-full">
            <div className="flex items-center gap-2 mb-3 px-1"><Clock size={16} className="text-pink-300"/><div className="text-xs font-bold tracking-widest">ORTALAMA CEVAP SÜRESİ</div></div>
            <div className="space-y-2">{Object.entries(data.response_time).sort((a,b)=>(a[1]?.minutes||999)-(b[1]?.minutes||999)).slice(0,3).map(([u, t], i) => (<StatRow key={u} label={u} value={t ? `${t.minutes}dk ${t.seconds}sn` : '-'} isLeader={i===0} sub={i===0 ? "En Hızlı Silahşör" : ""} />))}</div>
         </div>
      </StoryCard>
    );

    // 8. GİZLİ İŞLER (DÜZELTME: Veriler boş olsa bile patlamasın)
    slides.push(
       <StoryCard title="GİZLİ DOSYALAR" subtitle="Silinenler, Düzenlenenler ve Stickerlar" color="from-slate-800 to-gray-900">
          <div className="w-full space-y-6">
             <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <div className="flex items-center gap-2 mb-3 text-red-300"><Trash2 size={18} /> <span className="font-bold text-sm">SİLİNEN MESAJLAR</span></div>
                <div className="space-y-2">
                    {data.special_actions.deleted?.all_stats && Object.keys(data.special_actions.deleted.all_stats).length > 0 ? (
                        Object.entries(data.special_actions.deleted.all_stats).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([u, c], i) => (<div key={u} className="flex justify-between items-center text-sm"><span className={i===0 ? "font-bold text-white break-words w-2/3" : "text-gray-400 break-words w-2/3"}>{u}</span><span className="font-mono">{c} adet</span></div>))
                    ) : <div className="text-xs opacity-50">Hiç silinen mesaj yok</div>}
                </div>
             </div>
             <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <div className="flex items-center gap-2 mb-3 text-green-300"><Smile size={18} /> <span className="font-bold text-sm">STICKER USTASI</span></div>
                <div className="space-y-2">
                    {data.special_actions.sticker?.all_stats && Object.keys(data.special_actions.sticker.all_stats).length > 0 ? (
                        Object.entries(data.special_actions.sticker.all_stats).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([u, c], i) => (<div key={u} className="flex justify-between items-center text-sm"><span className={i===0 ? "font-bold text-white break-words w-2/3" : "text-gray-400 break-words w-2/3"}>{u}</span><span className="font-mono">{c} adet</span></div>))
                    ) : <div className="text-xs opacity-50">Hiç sticker yok</div>}
                </div>
             </div>
          </div>
       </StoryCard>
    );
    
    // 9. DİNAMİKLER (DÜZELTME: Initiator eklendi ve Gülüş profili düzeltildi)
    slides.push(
       <StoryCard title="GRUP DİNAMİĞİ" subtitle="Rolleriniz ve Gülüşleriniz" color="from-fuchsia-900 to-purple-800">
          <div className="w-full space-y-6">
             <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold tracking-widest mb-1 opacity-60">SOHBET BAŞLATICI 🚀</div>
                <div className="text-sm text-gray-400 mb-3">Uzun sessizlikleri bozan kahraman</div>
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg"><span className="text-xl font-bold break-words w-2/3">{data.initiator?.leader || "-"}</span><span className="font-mono font-bold text-yellow-300 border border-yellow-300/30 px-2 py-1 rounded text-xs">LİDER</span></div>
             </div>
             <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold tracking-widest mb-3 opacity-60">GÜLÜŞ PROFİLİ 😂</div>
                {Object.keys(data.laugh).slice(0, 4).map(user => {
                   const styles = data.laugh[user];
                   // En baskın stili bul
                   const topStyle = Object.keys(styles).reduce((a, b) => styles[a] > styles[b] ? a : b, 'classic');
                   let displayStyle = "";
                   if (styles[topStyle] === 0) displayStyle = "Ciddi (-)"; 
                   else if (topStyle === 'random') displayStyle = "Random (asdfgh...)";
                   else if (topStyle === 'classic') displayStyle = "Klasik (haha)";
                   else if (topStyle === 'short') displayStyle = "Kısa (lol/sjsj)";
                   return (<div key={user} className="flex justify-between items-center text-sm border-b border-white/10 py-3 last:border-0"><span className="font-bold break-words w-1/2">{user}</span><span className="opacity-90 bg-fuchsia-500/20 px-3 py-1 rounded-full text-fuchsia-200 text-xs shrink-0">{displayStyle}</span></div>)
                })}
             </div>
          </div>
       </StoryCard>
    );

    // 10. REKORLAR (DÜZELTME: Tarih eklendi)
    slides.push(
       <StoryCard title="TARİH YAZANLAR" subtitle="Unutulmaz anlar" color="from-emerald-900 to-green-900">
          <div className="w-full space-y-4">
             <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                <Trophy className="mb-3 text-yellow-400 w-8 h-8"/>
                <div className="text-xs font-bold tracking-widest opacity-60">EN GEÇ SAATTE YAZAN (Gece Kuşu)</div>
                <div className="text-2xl font-black mt-1 break-words">{data.milestones.latest_message.user}</div>
                <div className="text-4xl font-mono text-emerald-300 mt-2">{data.milestones.latest_message.time}</div>
                <div className="text-sm opacity-60 mb-2">{data.milestones.latest_message.date}</div>
                <div className="text-sm bg-black/40 p-3 rounded-lg italic text-gray-300">"{data.milestones.latest_message.message.substring(0,50)}{data.milestones.latest_message.message.length>50?'...':''}"</div>
             </div>
             
             {data.milestones.msg_1000 && (
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                   <Hash className="mb-3 text-blue-400 w-8 h-8"/>
                   <div className="text-xs font-bold tracking-widest opacity-60">1000. MESAJ JÜBİLESİ</div>
                   <div className="text-2xl font-black mt-1 break-words">{data.milestones.msg_1000.user}</div>
                   <div className="text-lg mt-1 opacity-80 font-mono text-blue-300">{data.milestones.msg_1000.date}</div>
                   <div className="text-xs mt-2 opacity-50">Tarihinde 1000. mesajı atarak tarihe geçti.</div>
                </div>
             )}
          </div>
       </StoryCard>
    );
    
    // 11. POSTER İNDİR
    slides.push(
       <StoryCard title="ÖZET POSTERİ" color="from-black to-gray-800">
          <div className="text-center space-y-8 flex flex-col items-center justify-center h-full">
             <div className="text-8xl animate-bounce">📜</div>
             <p className="max-w-xs mx-auto text-lg leading-relaxed">Tüm bu verilerin ve daha fazlasının yer aldığı dev posteri indirmek için tıkla.</p>
             <button onClick={downloadPoster} className="bg-white text-black px-8 py-5 rounded-full font-black text-lg flex items-center gap-3 hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                <Download size={24}/> POSTERİ İNDİR
             </button>
          </div>
       </StoryCard>
    );

    return slides;
  };

  const slides = getSlides();

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center font-sans text-white overflow-hidden">
      <style>{scrollHideStyle}</style>
      
      {showInfo && <InfoSection onClose={() => setShowInfo(false)} />}

      {!data ? (
        <div className="w-full max-w-md bg-[#111] md:rounded-[2rem] p-10 border-0 md:border border-gray-800 text-center space-y-8 shadow-2xl relative overflow-hidden h-full md:h-auto flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
          
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 transform rotate-3">
            <Upload className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">W(P)RAPPED 2025</h1>
            <p className="text-gray-400">WhatsApp sohbet dosyanı yükle, yılın özetini çıkaralım.</p>
          </div>
          
          <div 
             onClick={() => fileInputRef.current?.click()}
             className="py-5 rounded-2xl font-bold transition-all border-2 border-dashed bg-gray-800/50 border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400 cursor-pointer group"
          >
             <input 
               type="file" 
               ref={fileInputRef}
               onChange={handleFileUpload} 
               accept=".txt, .zip" 
               className="hidden" 
             />
             {loading ? "Sihir Yapılıyor..." : "Dosya Seç (.txt veya .zip)"}
          </div>

          <button 
            onClick={() => setShowInfo(true)}
            className="w-full mt-6 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 hover:border-gray-600 transition-all p-4 rounded-2xl flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-full group-hover:bg-blue-500/30 transition-colors">
                <HelpCircle className="text-blue-400 w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-lg">Nasıl Yapılır?</div>
                <div className="text-gray-400 text-sm">Adım adım resimli anlatım</div>
              </div>
            </div>
            <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" />
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-green-500/60 text-xs font-mono">
            <ShieldCheck size={12} />
            <span>Verileriniz sunucuya gönderilmez</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0 md:gap-6 w-full md:max-w-md h-full md:h-auto relative">
          
          <div ref={storyRef} className="w-full h-full md:aspect-[9/16] md:h-auto bg-black md:rounded-[2rem] overflow-hidden shadow-2xl relative border-0 md:border border-gray-800 group">
             {slides[slideIndex]}
             
             <div className="absolute top-4 left-4 right-4 flex gap-1 z-50">
                {slides.map((_, i) => (
                   <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= slideIndex ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/20'}`} />
                ))}
             </div>

             <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} className="absolute left-0 top-0 bottom-0 w-1/3 z-40 opacity-0 cursor-w-resize">Geri</button>
             <button onClick={() => setSlideIndex(Math.min(slides.length - 1, slideIndex + 1))} className="absolute right-0 top-0 bottom-0 w-1/3 z-40 opacity-0 cursor-e-resize">İleri</button>
          </div>

          <div className="hidden md:flex justify-between w-full gap-3">
             <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} className="bg-[#111] p-4 rounded-2xl hover:bg-[#222] border border-gray-800 transition-colors"><ChevronLeft/></button>
             <button onClick={downloadSlide} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/20"><Instagram size={20}/> Story İndir</button>
             <button onClick={() => setSlideIndex(Math.min(slides.length - 1, slideIndex + 1))} className="bg-[#111] p-4 rounded-2xl hover:bg-[#222] border border-gray-800 transition-colors"><ChevronRight/></button>
          </div>
          
          <button onClick={() => setData(null)} className="hidden md:block text-gray-600 text-sm hover:text-white transition-colors py-2">Yeni Analiz Yap</button>
          
          <div className="fixed top-0 left-0 pointer-events-none opacity-0"><SummaryPoster data={data} /></div>
        </div>
      )}
    </div>
  );
}

export default App;