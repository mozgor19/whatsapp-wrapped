import { STOP_WORDS, BLACKLIST_BIGRAMS, EMOJI_REGEX } from './constants';

export class WhatsAppAnalyzer {
  constructor(data) {
    this.df = data;
    this._preprocessData();
  }
  
  _preprocessData() {
    this.df = this.df.map(row => {
      const dateParts = row.Tarih.split(/[./-]/).map(Number);
      const d = dateParts[0];
      const m = dateParts[1] - 1; 
      let y = dateParts[2];
      if (y < 100) y += 2000;
      
      const timeParts = row.Saat.split(':').map(Number);
      const h = timeParts[0];
      const min = timeParts[1];
      const sec = timeParts[2] || 0;
      
      const tamZaman = new Date(y, m, d, h, min, sec);
      
      return {
        ...row,
        Tarih_Formatli: new Date(y, m, d),
        Tam_Zaman: tamZaman,
        Saat_Sayisal: h
      };
    }).filter(row => !isNaN(row.Tam_Zaman.getTime()))
    .filter(row => row.Tam_Zaman.getFullYear() === 2025);

    this.df.sort((a, b) => a.Tam_Zaman - b.Tam_Zaman);

    // Temiz Veri Seti (Sistem mesajları hariç)
    this.cleanDf = this.df.filter(row => !row.isSystem);
  }


  // --- ANALİZ FONKSİYONLARI ---

  getMessageStats() {
    const counts = {};
    this.df.forEach(row => {
      counts[row.Gonderen] = (counts[row.Gonderen] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([kisi, sayi]) => ({ Kişi: kisi, 'Mesaj Sayısı': sayi }))
      .sort((a, b) => b['Mesaj Sayısı'] - a['Mesaj Sayısı']);
  }
  
  getTopWords(topN = 3) {
    const users = [...new Set(this.df.map(r => r.Gonderen))];
    const result = {};
    users.forEach(user => {
      const userMsgs = this.cleanDf.filter(r => r.Gonderen === user);
      const validWords = [];
      userMsgs.forEach(row => {
        const msgLower = row.Mesaj.toLowerCase();
        const msgClean = msgLower.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '');
        const words = msgClean.split(/\s+/);
        words.forEach(w => {
          if (!STOP_WORDS.has(w) && w.length > 3) validWords.push(w);
        });
      });
      const counts = {};
      validWords.forEach(w => counts[w] = (counts[w] || 0) + 1);
      result[user] = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([word, count]) => ({ word, count }));
    });
    return result;
  }
  
  getEmojiStats(topN = 5) {
    const users = [...new Set(this.df.map(r => r.Gonderen))];
    const result = {};
    users.forEach(user => {
      const userMsgs = this.cleanDf.filter(r => r.Gonderen === user);
      const allEmojis = [];
      userMsgs.forEach(row => {
        const matches = row.Mesaj.match(EMOJI_REGEX);
        if (matches) allEmojis.push(...matches);
      });
      if (allEmojis.length > 0) {
        const counts = {};
        allEmojis.forEach(e => counts[e] = (counts[e] || 0) + 1);
        result[user] = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([emoji, count]) => ({ emoji, count }));
      } else {
        result[user] = [];
      }
    });
    return result;
  }
  
  getMediaStats() {
    const audioPatterns = ["sesli mesaj", "audio omitted", "ptt", "ses kaydı", "voice message"];
    const urlRegex = /(https?:\/\/|www\.)\S+/g;
    const users = [...new Set(this.df.map(r => r.Gonderen))];
    const result = {};
    users.forEach(user => {
        const userMsgs = this.df.filter(r => r.Gonderen === user);
        const audioCount = userMsgs.filter(row => audioPatterns.some(p => row.Mesaj.toLowerCase().includes(p))).length;
        const linkCount = userMsgs.reduce((acc, row) => {
            const matches = row.Mesaj.match(urlRegex);
            return acc + (matches ? matches.length : 0);
        }, 0);
        result[user] = { audio_count: audioCount, link_count: linkCount };
    });
    return result;
  }

  getHourlyActivity() {
    const bins = [[0, 3, "00-03 (Gece)"], [3, 6, "03-06 (Sabaha Karşı)"], [6, 9, "06-09 (Sabah)"], [9, 12, "09-12 (Kuşluk)"], [12, 15, "12-15 (Öğle)"], [15, 18, "15-18 (İkindi)"], [18, 21, "18-21 (Akşam)"], [21, 24, "21-00 (Gece Yarısı)"]];
    const stats = {};
    bins.forEach(([,,label]) => stats[label] = 0);
    this.df.forEach(row => {
        const h = row.Saat_Sayisal;
        for (let [start, end, label] of bins) {
            if (h >= start && h < end) { stats[label]++; break; }
        }
    });
    let mostActive = "-", maxVal = -1;
    Object.entries(stats).forEach(([k, v]) => { if (v > maxVal) { maxVal = v; mostActive = k; } });
    return { stats, most_active: mostActive };
  }
  
  getDailyActivity() {
    const gunCevirisi = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const counts = {};
    this.df.forEach(row => {
      const gun = gunCevirisi[row.Tarih_Formatli.getDay()];
      counts[gun] = (counts[gun] || 0) + 1;
    });
    if (Object.keys(counts).length === 0) return { busiest_day: '-', max_count: 0 };
    const [busiestDay, maxCount] = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b);
    return { busiest_day: busiestDay, max_count: maxCount };
  }
  
  getDeepTalks() {
    if (this.df.length === 0) return [];
    const thresholdMs = 20 * 60 * 1000;
    const sessions = [];
    let currentSession = { start: this.df[0].Tam_Zaman, end: this.df[0].Tam_Zaman, msgCount: 1 };
    for (let i = 1; i < this.df.length; i++) {
        const diff = this.df[i].Tam_Zaman - this.df[i-1].Tam_Zaman;
        if (diff > thresholdMs) {
            sessions.push(currentSession);
            currentSession = { start: this.df[i].Tam_Zaman, end: this.df[i].Tam_Zaman, msgCount: 1 };
        } else {
            currentSession.end = this.df[i].Tam_Zaman;
            currentSession.msgCount++;
        }
    }
    sessions.push(currentSession);
    return sessions.filter(s => (s.end - s.start) > 3600000 && s.msgCount > 50)
        .sort((a, b) => (b.end - b.start) - (a.end - a.start)).slice(0, 5)
        .map(s => ({
            date: s.start.toLocaleDateString('tr-TR'),
            duration_str: `${Math.floor((s.end - s.start) / 3600000)} sa ${Math.floor(((s.end - s.start) % 3600000) / 60000)} dk`,
            message_count: s.msgCount
        }));
  }

  getAverageResponseTime() {
    const users = [...new Set(this.df.map(r => r.Gonderen))];
    const result = {};
    const replies = [];
    for (let i = 1; i < this.df.length; i++) {
      if (this.df[i].Gonderen !== this.df[i-1].Gonderen) {
        const diff = this.df[i].Tam_Zaman - this.df[i-1].Tam_Zaman;
        if (diff < 12 * 3600 * 1000) replies.push({ user: this.df[i].Gonderen, time: diff });
      }
    }
    users.forEach(user => {
        const userReplies = replies.filter(r => r.user === user);
        if (userReplies.length > 0) {
            const avgSec = (userReplies.reduce((acc, r) => acc + r.time, 0) / userReplies.length) / 1000;
            result[user] = { minutes: Math.floor(avgSec / 60), seconds: Math.floor(avgSec % 60) };
        } else { result[user] = null; }
    });
    return result;
  }
  
  getSpecialActions() {
      const targets = { deleted: ["bu mesaj silindi", "bu ileti silindi"], sticker: ["çıkartma dahil edilmedi", "sticker dahil edilmedi"], edited: ["bu mesaj düzenlendi", "bu ileti düzenlendi"] };
      const result = {};
      Object.entries(targets).forEach(([key, keywords]) => {
        const subset = this.df.filter(row => keywords.some(kw => row.Mesaj.toLowerCase().includes(kw)));
        
        const counts = {};
        if (subset.length > 0) {
          subset.forEach(row => counts[row.Gonderen] = (counts[row.Gonderen] || 0) + 1);
          const [leader, maxCount] = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b);
          // DÜZELTME: Veri olsa da olmasa da all_stats dönecek
          result[key] = { leader, count: maxCount, all_stats: counts };
        } else { 
            // DÜZELTME: Veri yoksa boş all_stats dön
            result[key] = { leader: '-', count: 0, all_stats: {} }; 
        }
      });
      return result;
  }

  getLaughStyle() {
      // DÜZELTME: Regex'ler genişletildi
      const patterns = { 
          random: /(?:[asdfghjklşi]{4,})/gi, 
          // 3 tekrardan 2 tekrara düşürdüm (haha, hehe kabul edilsin)
          classic: /(?:ha|he|eh|ehe|hak){2,}/gi, 
          short: /\b(lol|kdkd|sjsj|asds|ksks)\b/gi 
      };
      
      const users = [...new Set(this.df.map(r => r.Gonderen))];
      const result = {};
      users.forEach(user => {
          const userMsgs = this.cleanDf.filter(r => r.Gonderen === user);
          const styles = { random: 0, classic: 0, short: 0 };
          userMsgs.forEach(row => {
              const msg = row.Mesaj.toLowerCase();
              if (msg.match(patterns.random)) styles.random++;
              if (msg.match(patterns.classic)) styles.classic++;
              if (msg.match(patterns.short)) styles.short++;
          });
          result[user] = styles;
      });
      return result;
  }
  
  getInitiatorStats() {
      // DÜZELTME: Sohbet başlatıcı mantığı ve null kontrolü
      const threshold = 6 * 3600 * 1000; // 6 saat
      const counts = {};
      
      for (let i = 1; i < this.df.length; i++) {
          const diff = this.df[i].Tam_Zaman - this.df[i-1].Tam_Zaman;
          if (diff > threshold) {
              const initiator = this.df[i].Gonderen;
              counts[initiator] = (counts[initiator] || 0) + 1;
          }
      }
      
      if (Object.keys(counts).length > 0) {
          const [leader, count] = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b);
          return { leader, count, stats: counts };
      }
      return { leader: '-', count: 0, stats: {} };
  }
  
  getWordPatterns() {
      const users = [...new Set(this.df.map(r => r.Gonderen))];
      const result = {};
      users.forEach(user => {
          const userMsgs = this.cleanDf.filter(r => r.Gonderen === user);
          const validBigrams = [];
          userMsgs.forEach(row => {
              const msg = row.Mesaj.toLowerCase();
              if ((msg.includes("bekleniyor") && msg.includes("alabilir")) || msg.includes("sildiniz")) return;
              const words = msg.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '').split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 2);
              for (let i = 0; i < words.length - 1; i++) {
                  const phrase = `${words[i]} ${words[i+1]}`;
                  if (!BLACKLIST_BIGRAMS.some(bad => phrase.includes(bad))) validBigrams.push(phrase);
              }
          });
          const counts = {};
          validBigrams.forEach(bg => counts[bg] = (counts[bg] || 0) + 1);
          result[user] = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([phrase, count]) => ({ phrase, count }));
      });
      return result;
  }
  
  getQuestionStats() {
      const users = [...new Set(this.df.map(r => r.Gonderen))];
      const result = {};
      users.forEach(user => {
          const userMsgs = this.cleanDf.filter(r => r.Gonderen === user);
          const avgWords = userMsgs.length > 0 ? (userMsgs.reduce((acc, row) => acc + row.Mesaj.split(/\s+/).length, 0) / userMsgs.length) : 0;
          result[user] = {
              question_count: userMsgs.reduce((acc, row) => acc + (row.Mesaj.includes('?') ? 1 : 0), 0),
              avg_word_length: parseFloat(avgWords.toFixed(1))
          };
      });
      return result;
  }
  
  getPeakDay() {
      const counts = {};
      this.df.forEach(row => counts[row.Tarih] = (counts[row.Tarih] || 0) + 1);
      const [bestDate, maxVal] = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b, ['-', 0]);
      return { date: bestDate, count: maxVal };
  }
  
  getVocabularyStats() {
      const users = [...new Set(this.df.map(r => r.Gonderen))];
      const result = {};
      users.forEach(user => {
          const words = this.cleanDf.filter(r => r.Gonderen === user).map(r => r.Mesaj).join(' ').toLowerCase().replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '').split(/\s+/).filter(w => w.length > 0);
          const total = words.length;
          result[user] = { total, unique: new Set(words).size, diversity_ratio: total > 0 ? parseFloat((new Set(words).size / total * 100).toFixed(2)) : 0 };
      });
      return result;
  }
  
  getMilestones() {
      let latestMsg = null, latestScore = -1;
      this.cleanDf.forEach(row => {
          let h = row.Saat_Sayisal;
          if (h >= 0 && h < 6) h += 24;
          const score = h * 60 + parseInt(row.Saat.split(':')[1]);
          if (score > latestScore) { latestScore = score; latestMsg = row; }
      });
      
      // DÜZELTME: 1000. mesaj ve tarih ekleme
      const msg1000Index = 999;
      const msg1000 = this.df.length > msg1000Index ? this.df[msg1000Index] : null;

      return {
          latest_message: latestMsg ? { 
              user: latestMsg.Gonderen, 
              time: latestMsg.Saat, 
              date: latestMsg.Tarih, // Tarih eklendi
              message: latestMsg.Mesaj 
          } : { user: '-', time: '-', date: '', message: '-' },
          msg_1000: msg1000 ? { user: msg1000.Gonderen, date: msg1000.Tarih } : null
      };
  }
  
  getCapsLockStats() {
      const users = [...new Set(this.df.map(r => r.Gonderen))];
      const result = {};
      users.forEach(user => {
          const userMsgs = this.cleanDf.filter(r => r.Gonderen === user);
          let shoutCount = 0;
          userMsgs.forEach(row => {
              const clean = row.Mesaj.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '');
              if (clean.length > 3 && (clean.split('').filter(c => c === c.toUpperCase()).length / clean.length) > 0.8) shoutCount++;
          });
          result[user] = { shout_count: shoutCount };
      });
      return result;
  }

  analyzeAll() {
    return {
      messages: this.getMessageStats(),
      words: this.getTopWords(),
      emojis: this.getEmojiStats(),
      hourly: this.getHourlyActivity(),
      daily: this.getDailyActivity(),
      deep_talks: this.getDeepTalks(),
      response_time: this.getAverageResponseTime(),
      special_actions: this.getSpecialActions(),
      media: this.getMediaStats(),
      laugh: this.getLaughStyle(),
      initiator: this.getInitiatorStats(), // Initiator eklendi
      bigrams: this.getWordPatterns(),
      questions: this.getQuestionStats(),
      peak_day: this.getPeakDay(),
      vocabulary: this.getVocabularyStats(),
      milestones: this.getMilestones(),
      caps: this.getCapsLockStats()
    };
  }
}