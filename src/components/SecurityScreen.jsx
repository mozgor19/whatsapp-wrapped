import React, { useState } from 'react';
import { Lock, CheckCircle, HelpCircle } from 'lucide-react';

const SecurityScreen = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-green-950 via-black to-emerald-950 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-black/80 backdrop-blur-xl w-full max-w-3xl rounded-3xl p-8 border-2 border-green-500/30 shadow-2xl my-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-green-500/50">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-3">GÜVENLİK GARANTİSİ</h1>
          <p className="text-xl text-green-300 font-semibold">%100 Client-Side • Sıfır Sunucu</p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Dosyanız ASLA Sunucuya Gitmez</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Tüm analiz işlemi <strong className="text-green-400">tarayıcınızın içinde</strong> gerçekleşir. 
                  Sohbet dosyanız internet üzerinden hiçbir yere gönderilmez.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Verileriniz Saklanmaz</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Analiz tamamlandığında tüm veriler tarayıcı belleğinden silinir. 
                  Hiçbir şey veritabanına, çereze veya yerel depolamaya kaydedilmez.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Açık Kaynak Güvencesi</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Tüm kod açık kaynaklıdır. Tarayıcınızın geliştirici konsolundan 
                  <strong className="text-green-400"> Network</strong> sekmesini açıp hiçbir 
                  veri transferi olmadığını görebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border-2 border-blue-500/40 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <HelpCircle className="w-8 h-8 text-blue-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Nasıl Kullanılır?</h3>
                <ol className="text-gray-300 text-lg space-y-2 list-decimal list-inside">
                  <li>WhatsApp'ta sohbete girin</li>
                  <li>İsme tıklayın → En alta inin → <strong className="text-blue-300">"Sohbeti Dışa Aktar"</strong></li>
                  <li><strong className="text-blue-300">"Medya Olmadan"</strong> seçeneğini seçin (daha hızlı)</li>
                  <li>İnen <strong className="text-blue-300">.txt veya .zip</strong> dosyasını buraya yükleyin</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <label className="flex items-center justify-center gap-3 mb-6 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-6 h-6 rounded border-2 border-green-500 bg-black/50 checked:bg-green-500 cursor-pointer"
          />
          <span className="text-xl font-semibold text-white group-hover:text-green-300 transition-colors">
            Okudum, anladım ve kabul ediyorum
          </span>
        </label>

        <button
          onClick={onAccept}
          disabled={!accepted}
          className="w-full py-6 rounded-2xl font-black text-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-500/30 disabled:hover:scale-100"
        >
          {accepted ? "DEVAM ET 🚀" : "LÜTFEN ONAY KUTUSUNU İŞARETLEYİN"}
        </button>
      </div>
    </div>
  );
};

export default SecurityScreen;