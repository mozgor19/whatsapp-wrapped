import { SYSTEM_FILTERS } from './constants';

export function parseWhatsAppToCSV(text) {
  // 1. Unicode ve satır sonu temizliği
  let cleanText = text
    .replace(/\u200e/g, '')
    .replace(/\u202c/g, '')
    .replace(/\u2069/g, '')
    .replace(/\u2068/g, '')
    .replace(/\r\n/g, '\n');

  const lines = cleanText.split('\n');
  const parsed = [];
  
  // iOS ve Android Regex Kalıpları
  const iosPattern = /^\[(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?)\]\s+([^:]+):\s+(.+)/;
  const androidPattern = /^(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+(\d{1,2}:\d{2})\s-\s([^:]+):\s+(.+)/;

  let currentDate = "";
  let currentTime = "";
  let currentSender = "";
  let currentMessage = "";
  let currentIsSystem = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Satır yeni bir mesaj mı?
    let match = line.match(iosPattern) || line.match(androidPattern);

    if (match) {
      // --- YENİ MESAJ ---
      
      // Önceki birikmiş mesajı kaydet
      if (currentMessage) {
        parsed.push({
          Tarih: currentDate,
          Saat: currentTime,
          Gonderen: currentSender,
          Mesaj: currentMessage,
          isSystem: currentIsSystem // Bu bayrağı ekledik
        });
      }
      
      // Yeni verileri al
      currentDate = match[1];
      currentTime = match[2];
      currentSender = match[3];
      let msgContent = match[4];

      // Sistem Mesajı Kontrolü (Silmiyoruz, işaretliyoruz)
      // Mesaj içeriği "medya dahil edilmedi", "silindi" vb. içeriyor mu?
      const msgLower = msgContent.toLowerCase();
      const isSystem = SYSTEM_FILTERS.some(sf => msgLower.includes(sf));

      currentMessage = msgContent;
      currentIsSystem = isSystem;
      
    } else {
      // --- MESAJIN DEVAMI (Multiline) ---
      if (currentMessage) {
        currentMessage += " " + line;
        // Eğer mesajın devamında sistem kelimesi geçerse (nadir), yine de işaretleyelim
        if (!currentIsSystem) {
             const lineLower = line.toLowerCase();
             if (SYSTEM_FILTERS.some(sf => lineLower.includes(sf))) {
                 currentIsSystem = true;
             }
        }
      }
    }
  }
  
  // Son mesajı ekle
  if (currentMessage) {
    parsed.push({
      Tarih: currentDate,
      Saat: currentTime,
      Gonderen: currentSender,
      Mesaj: currentMessage,
      isSystem: currentIsSystem
    });
  }
  
  return parsed;
}