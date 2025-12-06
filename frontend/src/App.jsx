import React, { useState, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { 
  Upload, Download, ChevronRight, ChevronLeft, Instagram, 
  MessageCircle, Clock, Zap, Smile, Mic, Link, Trash2, 
  AlertCircle, Hash, Sparkles, Trophy, Calendar, Quote,
  Type, ShieldCheck, HelpCircle, X
} from 'lucide-react';

// --- CSS (Scrollbar Gizleme) ---
const scrollHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- YARDIMCI BİLEŞENLER ---

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

// GÜNCELLEME: İsimlerin kesilmemesi için 'truncate' kaldırıldı, 'break-words' eklendi
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

// --- YENİLENMİŞ POSTER TASARIMI (FESTİVAL TARZI) ---
const SummaryPoster = ({ data }) => {
  const findWinner = (obj, key = null) => {
    if (!obj) return { name: '-', val: '-' };
    let max = -1;
    let winner = '-';
    Object.entries(obj).forEach(([user, stats]) => {
      const val = key ? stats[key] : stats;
      if (typeof val === 'number' && val > max) {
        max = val;
        winner = user;
      }
    });
    return { name: winner, val: max };
  };

  // Verileri hazırla
  const categories = [
    { title: "MESAJ KRALI", ...findWinner(data.messages.reduce((acc, curr) => ({...acc, [curr['Kişi']]: curr['Mesaj Sayısı']}), {})) },
    { title: "EN HIZLI DÖNÜŞ", name: Object.entries(data.response_time).sort((a,b) => (a[1]?.minutes||999)-(b[1]?.minutes||999))[0]?.[0], val: "Flaş" },
    { title: "EMOJİ BAĞIMLISI", ...findWinner(data.emojis, 0) },
    { title: "SORU MAKİNESİ", ...findWinner(data.questions, "question_count") },
    { title: "CAPS LOCKÇU", ...findWinner(data.caps, "shout_count") },
    { title: "SESLİ MESAJCI", ...findWinner(data.media, "audio_count") },
    { title: "STICKER USTASI", name: data.special_actions.sticker?.leader, val: data.special_actions.sticker?.count },
    { title: "SİLİCİ", name: data.special_actions.deleted?.leader, val: data.special_actions.deleted?.count },
    { title: "EDEBİYATÇI", ...findWinner(data.vocabulary, "unique") },
    { title: "BAŞLATICI", name: data.initiator?.leader, val: "Lider" },
    { title: "GECE KUŞU", name: data.milestones.latest_message.user, val: data.milestones.latest_message.time },
  ];

  return (
    <div id="poster-download" className="w-[1080px] h-[1920px] bg-[#050505] text-white p-12 flex flex-col items-center justify-between shrink-0 origin-top transform scale-[0.25] md:scale-[0.35] relative mb-[-1400px] border-[16px] border-[#1a1a1a]">
      
      {/* Header */}
      <div className="text-center w-full border-b-8 border-purple-600 pb-8 pt-4">
        <h1 className="text-[130px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 tracking-tighter filter drop-shadow-2xl">2025</h1>
        <h2 className="text-5xl font-bold tracking-[0.6em] text-white mt-2">WHATSAPP LINE-UP</h2>
      </div>

      {/* Main Stats Grid */}
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

      {/* Categories List (Festival Line-up Style) */}
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

      {/* Footer */}
      <div className="text-center w-full pt-8 opacity-40">
         <div className="text-2xl font-mono tracking-[0.5em] font-bold">GENERATED BY MUSTAFA'S AI BOT</div>
      </div>
    </div>
  );
};

// --- GÜVENLİK VE KILAVUZ MODALI ---
const InfoSection = ({ onClose }) => (
   <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#111] w-full max-w-2xl rounded-3xl p-8 border border-gray-800 max-h-[85vh] overflow-y-auto relative shadow-2xl">
         <button onClick={onClose} className="absolute top-4 right-4 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors text-white"><X /></button>
         
         <div className="space-y-10">
            {/* Güvenlik Bölümü */}
            <section>
               <h3 className="text-2xl font-black text-green-400 flex items-center gap-3 mb-4 tracking-wide"><ShieldCheck size={32} /> GÜVENLİK & GİZLİLİK GARANTİSİ</h3>
               <div className="bg-green-900/10 border border-green-900/30 p-6 rounded-2xl text-gray-300 text-base leading-relaxed">
                  <p className="mb-4"><strong className="text-white">Verileriniz Güvende.</strong> Bu uygulama, sohbet dosyalarınızı analiz etmek için sunucuda anlık olarak işler ve analiz tamamlandığı saniye <strong className="text-white underline">dosyayı kalıcı olarak imha eder.</strong></p>
                  <ul className="list-disc list-inside space-y-2 marker:text-green-500">
                     <li>Sohbetleriniz asla bir veritabanına kaydedilmez.</li>
                     <li>İçerikleriniz (fotoğraf, video, mesaj metni) asla okunmaz veya saklanmaz.</li>
                     <li>Size sunulan istatistikler (sayılar ve grafikler) sadece tarayıcınızda görüntülenir.</li>
                  </ul>
               </div>
            </section>

            {/* Nasıl Kullanılır Bölümü */}
            <section>
               <h3 className="text-2xl font-black text-blue-400 flex items-center gap-3 mb-4 tracking-wide"><HelpCircle size={32} /> NASIL KULLANILIR?</h3>
               <div className="space-y-4 text-gray-300">
                  <div className="flex gap-4 items-start">
                     <div className="bg-blue-500/20 text-blue-400 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
                     <p>WhatsApp'ta analiz etmek istediğiniz sohbete (Grup veya Kişi) girin.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="bg-blue-500/20 text-blue-400 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                     <p>İsim kısmına tıklayın, en aşağı inin ve <strong>"Sohbeti Dışa Aktar"</strong> seçeneğine basın.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="bg-blue-500/20 text-blue-400 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
                     <p>Açılan pencerede <strong>"Medya Ekleme"</strong> seçeneğini seçin. (Medyalı dosyalar çok büyük olur ve işlem uzun sürer).</p>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="bg-blue-500/20 text-blue-400 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">4</div>
                     <p>Telefonunuza inen <strong>.zip</strong> dosyasını veya içinden çıkan <strong>_chat.txt</strong> dosyasını buraya yükleyin.</p>
                  </div>
               </div>
            </section>
         </div>
      </div>
   </div>
);

// --- ANA UYGULAMA ---

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const storyRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(res.data);
      setSlideIndex(0);
    } catch (err) {
      alert("Hata: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadSlide = async () => {
    if (!storyRef.current) return;
    const canvas = await html2canvas(storyRef.current, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `story-slide-${slideIndex}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadPoster = async () => {
    const el = document.getElementById('poster-download');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 1 });
    const link = document.createElement('a');
    link.download = `full-wrapped-poster.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // --- SLAYT İÇERİKLERİ ---
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
          {data.messages.sort((a,b)=>b['Mesaj Sayısı']-a['Mesaj Sayısı']).map((m, i) => (
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

    // 4. İLETİŞİM KARAKTERİ
    slides.push(
      <StoryCard title="İLETİŞİM TARZI" subtitle="Karakter Analizi" color="from-teal-900 to-emerald-900">
        <div className="w-full space-y-4">
          <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 p-5 rounded-2xl border border-white/10">
             <div className="flex items-center gap-2 mb-2 text-emerald-300"><Hash size={20} /> <span className="font-bold">SORU MAKİNESİ</span></div>
             {Object.entries(data.questions).sort((a,b)=>b[1].question_count-a[1].question_count).slice(0,1).map(([u, s]) => (
                <div key={u}><div className="flex justify-between items-end"><span className="text-xl font-bold truncate max-w-[150px]">{u}</span><span className="text-2xl font-mono">{s.question_count}</span></div><div className="text-xs text-gray-400 mt-1">Toplam soru sorma sayısı</div></div>
             ))}
          </div>
          <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 p-5 rounded-2xl border border-white/10">
             <div className="flex items-center gap-2 mb-2 text-orange-300"><AlertCircle size={20} /> <span className="font-bold">BÜYÜK HARF (BAĞIRAN)</span></div>
             {Object.entries(data.caps).sort((a,b)=>b[1].shout_count-a[1].shout_count).slice(0,1).map(([u, s]) => (
                <div key={u}><div className="flex justify-between items-end"><span className="text-xl font-bold truncate max-w-[150px]">{u}</span><span className="text-2xl font-mono">{s.shout_count}</span></div><div className="text-xs text-gray-400 mt-1">Kez büyük harflerle yazdı</div></div>
             ))}
          </div>
          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-5 rounded-2xl border border-white/10">
             <div className="flex items-center gap-2 mb-2 text-blue-300"><Sparkles size={20} /> <span className="font-bold">EDEBİYATÇI</span></div>
             {Object.entries(data.vocabulary).sort((a,b)=>b[1].unique-a[1].unique).slice(0,1).map(([u, s]) => (
                <div key={u}><div className="flex justify-between items-end"><span className="text-xl font-bold truncate max-w-[150px]">{u}</span><span className="text-2xl font-mono">{s.unique}</span></div><div className="text-xs text-gray-400 mt-1">Farklı kelime kullanma sayısı</div></div>
             ))}
          </div>
        </div>
      </StoryCard>
    );

    // 5. EN ÇOK KULLANILANLAR
    slides.push(
      <StoryCard title="ENLER LİSTESİ" subtitle="Dilinizden düşmeyenler" color="from-yellow-700 to-orange-900">
         <div className="w-full space-y-6">
            {Object.keys(data.emojis).map(user => (
               <div key={user} className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <div className="text-sm font-bold text-orange-300 mb-3 uppercase tracking-wider">{user}</div>
                  <div className="mb-4">
                     <div className="text-xs opacity-50 mb-1">FAVORİ KELİMELER</div>
                     <div className="flex flex-wrap gap-2">{data.words[user]?.slice(0,3).map((w, idx) => (<span key={idx} className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium border border-white/10">{w.word} <span className="opacity-50 text-xs ml-1">({w.count})</span></span>))}</div>
                  </div>
                  <div>
                     <div className="text-xs opacity-50 mb-1">FAVORİ EMOJİLER</div>
                     <div className="flex gap-3 text-2xl">{data.emojis[user]?.slice(0,5).map((e, idx) => (<div key={idx} className="relative group cursor-help">{e.emoji}<span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{e.count}</span></div>))}</div>
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
                {Object.keys(data.bigrams).map(user => (
                    <div key={user} className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-sm font-bold text-green-300 mb-2 uppercase">{user}</div>
                        <div className="space-y-2">
                            {data.bigrams[user]?.slice(0,3).map((bg, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="italic truncate max-w-[200px]">"{bg.phrase}"</span>
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
            <div className="space-y-2">{Object.entries(data.response_time).sort((a,b)=>(a[1]?.minutes||999)-(b[1]?.minutes||999)).map(([u, t], i) => (<StatRow key={u} label={u} value={t ? `${t.minutes}dk ${t.seconds}sn` : '-'} isLeader={i===0} sub={i===0 ? "En Hızlı Silahşör" : ""} />))}</div>
         </div>
      </StoryCard>
    );

    // 8. GİZLİ İŞLER
    slides.push(
       <StoryCard title="GİZLİ DOSYALAR" subtitle="Silinenler, Düzenlenenler ve Stickerlar" color="from-slate-800 to-gray-900">
          <div className="w-full space-y-6">
             <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <div className="flex items-center gap-2 mb-3 text-red-300"><Trash2 size={18} /> <span className="font-bold text-sm">SİLİNEN MESAJLAR</span></div>
                <div className="space-y-2">{Object.entries(data.special_actions.deleted?.all_stats || {}).sort((a,b)=>b[1]-a[1]).map(([u, c], i) => (<div key={u} className="flex justify-between items-center text-sm"><span className={i===0 ? "font-bold text-white truncate max-w-[200px]" : "text-gray-400 truncate max-w-[200px]"}>{u}</span><span className="font-mono">{c} adet</span></div>))}</div>
             </div>
             <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <div className="flex items-center gap-2 mb-3 text-green-300"><Smile size={18} /> <span className="font-bold text-sm">STICKER USTASI</span></div>
                <div className="space-y-2">{Object.entries(data.special_actions.sticker?.all_stats || {}).sort((a,b)=>b[1]-a[1]).map(([u, c], i) => (<div key={u} className="flex justify-between items-center text-sm"><span className={i===0 ? "font-bold text-white truncate max-w-[200px]" : "text-gray-400 truncate max-w-[200px]"}>{u}</span><span className="font-mono">{c} adet</span></div>))}</div>
             </div>
             {data.special_actions.edited && (<div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20"><div className="flex items-center gap-2 mb-3 text-blue-300"><AlertCircle size={18} /> <span className="font-bold text-sm">KARARSIZ (DÜZENLEME)</span></div><div className="space-y-2">{Object.entries(data.special_actions.edited?.all_stats || {}).sort((a,b)=>b[1]-a[1]).map(([u, c], i) => (<div key={u} className="flex justify-between items-center text-sm"><span className={i===0 ? "font-bold text-white truncate max-w-[200px]" : "text-gray-400 truncate max-w-[200px]"}>{u}</span><span className="font-mono">{c} adet</span></div>))}</div></div>)}
          </div>
       </StoryCard>
    );
    
    // 9. DİNAMİKLER
    slides.push(
       <StoryCard title="GRUP DİNAMİĞİ" subtitle="Rolleriniz ve Gülüşleriniz" color="from-fuchsia-900 to-purple-800">
          <div className="w-full space-y-6">
             <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold tracking-widest mb-1 opacity-60">SOHBET BAŞLATICI 🚀</div>
                <div className="text-sm text-gray-400 mb-3">Uzun sessizlikleri bozan kahraman</div>
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg"><span className="text-xl font-bold truncate max-w-[200px]">{data.initiator?.leader}</span><span className="font-mono font-bold text-yellow-300 border border-yellow-300/30 px-2 py-1 rounded text-xs">LİDER</span></div>
             </div>
             <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold tracking-widest mb-3 opacity-60">GÜLÜŞ PROFİLİ 😂</div>
                {Object.keys(data.laugh).map(user => {
                   const styles = data.laugh[user];
                   const topStyle = Object.keys(styles).reduce((a, b) => styles[a] > styles[b] ? a : b, 'classic');
                   let displayStyle = "";
                   if (topStyle === 'random') displayStyle = "Random (asdfgh...)";
                   else if (topStyle === 'classic') displayStyle = "Klasik (hahaha)";
                   else if (topStyle === 'short') displayStyle = "Kısa (lol/sjsj)";
                   return (<div key={user} className="flex justify-between items-center text-sm border-b border-white/10 py-3 last:border-0"><span className="font-bold truncate max-w-[150px]">{user}</span><span className="opacity-90 bg-fuchsia-500/20 px-3 py-1 rounded-full text-fuchsia-200 text-xs shrink-0">{displayStyle}</span></div>)
                })}
             </div>
          </div>
       </StoryCard>
    );

    // 10. REKORLAR (1000. Mesaj)
    slides.push(
       <StoryCard title="TARİH YAZANLAR" subtitle="Unutulmaz anlar" color="from-emerald-900 to-green-900">
          <div className="w-full space-y-4">
             <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                <Trophy className="mb-3 text-yellow-400 w-8 h-8"/>
                <div className="text-xs font-bold tracking-widest opacity-60">EN GEÇ SAATTE YAZAN</div>
                <div className="text-2xl font-black mt-1 break-words">{data.milestones.latest_message.user}</div>
                <div className="text-4xl font-mono text-emerald-300 my-2">{data.milestones.latest_message.time}</div>
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
    // TAM EKRAN KAPLAYICI (MOBİL İÇİN fixed inset-0)
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
            <h1 className="text-4xl font-black tracking-tight mb-2">WRAPPED 2025</h1>
            <p className="text-gray-400">WhatsApp sohbet dosyanı yükle, yılın özetini çıkaralım.</p>
          </div>
          
          {/* DOSYA YÜKLEME ALANI */}
          <label className="block w-full group cursor-pointer relative">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".txt, .zip" className="hidden" />
            <div className={`py-5 rounded-2xl font-bold transition-all border-2 border-dashed ${file ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-gray-800/50 border-gray-700 text-gray-400 group-hover:border-purple-500 group-hover:text-purple-400'}`}>
              {file ? file.name : "Dosya Seç (.txt veya .zip)"}
            </div>
          </label>

          <button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className="w-full py-5 rounded-2xl font-bold bg-white text-black text-lg disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            {loading ? "Sihir Yapılıyor..." : "Analiz Et"}
          </button>

          {/* BİLGİ BUTONU */}
          <button 
            onClick={() => setShowInfo(true)}
            className="text-xs text-gray-500 hover:text-white flex items-center justify-center gap-1 mx-auto mt-4 transition-colors"
          >
            <ShieldCheck size={14} /> Güvenlik ve Nasıl Kullanılır?
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0 md:gap-6 w-full md:max-w-md h-full md:h-auto relative">
          
          {/* SLAYT ALANI */}
          <div ref={storyRef} className="w-full h-full md:aspect-[9/16] md:h-auto bg-black md:rounded-[2rem] overflow-hidden shadow-2xl relative border-0 md:border border-gray-800 group">
             {slides[slideIndex]}
             
             {/* İlerleme Çubuğu */}
             <div className="absolute top-4 left-4 right-4 flex gap-1 z-50">
                {slides.map((_, i) => (
                   <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= slideIndex ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/20'}`} />
                ))}
             </div>

             {/* Dokunmatik Kontroller */}
             <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} className="absolute left-0 top-0 bottom-0 w-1/3 z-40 opacity-0 cursor-w-resize">Geri</button>
             <button onClick={() => setSlideIndex(Math.min(slides.length - 1, slideIndex + 1))} className="absolute right-0 top-0 bottom-0 w-1/3 z-40 opacity-0 cursor-e-resize">İleri</button>
          </div>

          <div className="hidden md:flex justify-between w-full gap-3">
             <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} className="bg-[#111] p-4 rounded-2xl hover:bg-[#222] border border-gray-800 transition-colors"><ChevronLeft/></button>
             <button onClick={downloadSlide} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/20"><Instagram size={20}/> Story İndir</button>
             <button onClick={() => setSlideIndex(Math.min(slides.length - 1, slideIndex + 1))} className="bg-[#111] p-4 rounded-2xl hover:bg-[#222] border border-gray-800 transition-colors"><ChevronRight/></button>
          </div>
          
          <button onClick={() => setData(null)} className="hidden md:block text-gray-600 text-sm hover:text-white transition-colors py-2">Yeni Analiz Yap</button>
          
          {/* GİZLİ POSTER */}
          <div className="fixed top-0 left-0 pointer-events-none opacity-0"><SummaryPoster data={data} /></div>
        </div>
      )}
    </div>
  );
}

export default App;