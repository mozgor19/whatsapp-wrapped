// src/utils/constants.js

export const STOP_WORDS = new Set([
  // ... (Mevcut kelimeler aynen kalsın) ...
  "bir", "ve", "ile", "de", "da", "bu", "şu", "o", "ben", "sen", "biz", "siz", "onlar",
  "mı", "mi", "mu", "mü", "ama", "fakat", "lakin", "ancak", "için", "gibi", "kadar",
  "diye", "yok", "var", "ne", "nasıl", "neden", "niye", "şey", "yani", "zaten",
  "tamam", "peki", "evet", "hayır", "olur", "olmaz", "iyi", "güzel", "kötü",
  "bunu", "şunu", "onu", "bana", "sana", "ona", "şimdi", "sonra", "önce", "daha",
  "en", "çok", "az", "biraz", "bile", "ise", "tüm", "her", "hiç", "kendi",
  "sadece", "veya", "ya", "hem", "böyle", "öyle", "zaman", "olsun", "olsa",
  "hani", "işte", "falan", "filan", "tmm", "ok", "oke", "aynen", "tabii", "tabi",
  "değil", "misin", "musun", "bence", "sence", "galiba", "sanırım", "bide",
  "artık", "hala", "diğer", "mesaj", "kanka", "abi", "abla", "di", "bi", "be", "lan",
  // --- YENİ EKLENEN GÜVENLİK KELİMELERİ ---
  "dahil", "edilmedi", "medya", "görüntü", "video", "ses", "dosya", "çıkartma", "sticker", 
  "omit", "omitted", "media", "image", "audio", "voice", "call", "missed"
]);

export const SYSTEM_FILTERS = [
  // Türkçe Sistem Mesajları
  "dahil edilmedi", 
  "uçtan uca şifreli", 
  "araması", 
  "kişisini ekledi",
  "grubu oluşturdu", 
  "gruptan ayrıldı", 
  "tanımı değişti", 
  "sildi",
  "silindi", 
  "düzenlendi", 
  "iletilen", 
  "konumu paylaştı", 
  "kartvizit",
  "engellediniz",
  "belge dahil edilmedi",
  "video dahil edilmedi",
  "görüntü dahil edilmedi",
  "medya dahil edilmedi",
  "sticker dahil edilmedi",
  "ses dahil edilmedi",
  "dosya dahil edilmedi",
  "süreli mesajlar",
  "davet bağlantısı",
  
  // İngilizce Sistem Mesajları (Telefonu İngilizce olanlar için)
  "media omitted",
  "image omitted",
  "video omitted",
  "audio omitted",
  "sticker omitted",
  "added",
  "left",
  "created group",
  "changed the subject",
  "security code changed",
  "end-to-end encrypted"
];

export const BLACKLIST_BIGRAMS = [
  "dahil edilmedi", "çıkartma dahil", "mesaj düzenlendi",
  "mesaj bekleniyor", "mesaj silindi", "bu mesaj", "bu ileti",
  "uçtan uca", "uca şifreli", "araması cevapsız", "görüntülü arama",
  "bekleniyor alabilir", "zaman alabilir", "işlem biraz",
  "ses dahil", "video dahil", "görüntü dahil",
  "mesajı sildiniz", "sildiniz", "hadi demek",
  "media omitted", "image omitted"
];

export const EMOJI_REGEX = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])(?:[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*)?/g;