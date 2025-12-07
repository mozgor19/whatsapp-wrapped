import pandas as pd
import re
from collections import Counter
import emoji

# --- SABİTLER VE FİLTRELER ---

STOP_WORDS = set([
    "bir", "ve", "ile", "de", "da", "bu", "şu", "o", "ben", "sen", "biz", "siz", "onlar",
    "mı", "mi", "mu", "mü", "ama", "fakat", "lakin", "ancak", "için", "gibi", "kadar",
    "diye", "yok", "var", "ne", "nasıl", 'neden', 'niye', 'şey', 'yani', 'zaten',
    'tamam', 'peki', 'evet', 'hayır', 'olur', 'olmaz', 'iyi', 'güzel', 'kötü',
    'bunu', 'şunu', 'onu', 'bana', 'sana', 'ona', 'şimdi', 'sonra', 'önce', 'daha',
    'en', 'çok', 'az', 'biraz', 'bile', 'ise', 'tüm', 'her', 'hiç', 'kendi',
    'sadece', 'veya', 'ya', 'hem', 'böyle', 'öyle', 'zaman', 'olsun', 'olsa',
    'hani', 'işte', 'falan', 'filan', 'tmm', 'ok', 'oke', 'aynen', 'tabii', 'tabi',
    'değil', 'misin', 'musun', 'bence', 'sence', 'galiba', 'sanırım', 'bide',
    'artık', 'hala', 'diğer', 'mesaj', 'kanka', 'abi', 'abla', 'di', 'bi', 'be', 'lan'
])

SYSTEM_FILTERS = [
    "dahil edilmedi", "uçtan uca şifreli", "araması", "kişisini ekledi",
    "grubu oluşturdu", "gruptan ayrıldı", "tanımı değişti", "sildi",
    "silindi", "düzenlendi", "iletilen", "konumu paylaştı", "kartvizit"
]

BLACKLIST_BIGRAMS = [
    "dahil edilmedi", "çıkartma dahil", "mesaj düzenlendi",
    "mesaj bekleniyor", "mesaj silindi", "bu mesaj", "bu ileti",
    "uçtan uca", "uca şifreli", "araması cevapsız", "görüntülü arama",
    "bekleniyor alabilir", "zaman alabilir", "işlem biraz",
    "ses dahil", "video dahil", "görüntü dahil",
    "mesajı sildiniz", "sildiniz", "hadi demek"
]

class WhatsAppAnalyzer:
    def __init__(self, csv_path):
        self.df = pd.read_csv(csv_path)
        self._preprocess_data()

    def _preprocess_data(self):
        # Tarih ve Saat birleştirme
        self.df['Tarih_Formatli'] = pd.to_datetime(self.df['Tarih'], format='%d.%m.%Y', errors='coerce')
        self.df['Tam_Zaman'] = pd.to_datetime(
            self.df['Tarih'] + ' ' + self.df['Saat'],
            format='%d.%m.%Y %H:%M:%S',
            errors='coerce'
        )
        self.df = self.df.sort_values('Tam_Zaman')
        self.df['Saat_Sayisal'] = self.df['Saat'].str[:2].astype(int)

    def get_message_stats(self):
        """Mesaj sayıları."""
        msg_counts = self.df['Gonderen'].value_counts().reset_index()
        msg_counts.columns = ['Kişi', 'Mesaj Sayısı']
        return msg_counts.to_dict('records')

    def get_top_words(self, top_n=3):
        """En çok kullanılan kelimeler."""
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            user_msgs = self.df[self.df['Gonderen'] == user]['Mesaj'].astype(str)
            valid_words = []
            for msg in user_msgs:
                msg_lower = msg.lower()
                if any(sys_filter in msg_lower for sys_filter in SYSTEM_FILTERS): continue
                msg_clean = re.sub(r'[^\w\s]', '', msg_lower)
                words = msg_clean.split()
                for w in words:
                    if w not in STOP_WORDS and len(w) > 3:
                        valid_words.append(w)
            most_common = Counter(valid_words).most_common(top_n)
            result[user] = [{"word": word, "count": count} for word, count in most_common]
        return result

    def get_emoji_stats(self, top_n=5):
        """En çok kullanılan emojiler."""
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            user_msgs = self.df[self.df['Gonderen'] == user]['Mesaj'].astype(str)
            all_emojis = []
            for msg in user_msgs:
                extracted = [item['emoji'] for item in emoji.emoji_list(msg)]
                all_emojis.extend(extracted)
            if all_emojis:
                top_emojis = Counter(all_emojis).most_common(top_n)
                result[user] = [{"emoji": e, "count": c} for e, c in top_emojis]
            else:
                result[user] = []
        return result

    def get_hourly_activity(self):
        """Saat dilimi analizi."""
        bins = [0, 3, 6, 9, 12, 15, 18, 21, 24]
        labels = [
            "00:00 - 03:00 (Gece)", "03:00 - 06:00 (Sabaha Karşı)", 
            "06:00 - 09:00 (Sabah)", "09:00 - 12:00 (Kuşluk)", 
            "12:00 - 15:00 (Öğle)", "15:00 - 18:00 (İkindi)", 
            "18:00 - 21:00 (Akşam)", "21:00 - 00:00 (Gece Yarısı)"
        ]
        self.df['Zaman_Dilimi'] = pd.cut(self.df['Saat_Sayisal'], bins=bins, labels=labels, right=False)
        time_stats = self.df['Zaman_Dilimi'].value_counts().sort_index()
        return {"stats": time_stats.to_dict(), "most_active": time_stats.idxmax()}

    def get_daily_activity(self):
        """Gün analizi."""
        gun_cevirisi = {'Monday': 'Pazartesi', 'Tuesday': 'Salı', 'Wednesday': 'Çarşamba', 'Thursday': 'Perşembe', 'Friday': 'Cuma', 'Saturday': 'Cumartesi', 'Sunday': 'Pazar'}
        self.df['Gun'] = self.df['Tarih_Formatli'].dt.day_name().map(gun_cevirisi)
        daily_counts = self.df['Gun'].value_counts()
        return {"busiest_day": daily_counts.idxmax(), "max_count": int(daily_counts.max())}

    def get_deep_talks(self):
        """Kesintisiz sohbetler."""
        df_temp = self.df.copy()
        df_temp['Fark'] = df_temp['Tam_Zaman'].diff()
        threshold = pd.Timedelta(minutes=20)
        df_temp['Yeni_Oturum'] = df_temp['Fark'] > threshold
        df_temp['Oturum_ID'] = df_temp['Yeni_Oturum'].cumsum()
        sessions = df_temp.groupby('Oturum_ID').agg(Baslangic=('Tam_Zaman', 'min'), Bitis=('Tam_Zaman', 'max'), Mesaj_Sayisi=('Mesaj', 'count'))
        sessions['Sure'] = sessions['Bitis'] - sessions['Baslangic']
        deep_talks = sessions[(sessions['Sure'] > pd.Timedelta(hours=1)) & (sessions['Mesaj_Sayisi'] > 50)].sort_values('Sure', ascending=False)
        
        results = []
        for _, row in deep_talks.head(5).iterrows():
            total_seconds = row['Sure'].total_seconds()
            results.append({
                "date": row['Baslangic'].strftime('%d.%m.%Y'),
                "duration_str": f"{int(total_seconds // 3600)} sa {int((total_seconds % 3600) // 60)} dk",
                "message_count": int(row['Mesaj_Sayisi'])
            })
        return results

    def get_average_response_time(self):
        """Ortalama cevap süresi."""
        df_temp = self.df.copy()
        df_temp['Onceki_Gonderen'] = df_temp['Gonderen'].shift(1)
        df_temp['Onceki_Zaman'] = df_temp['Tam_Zaman'].shift(1)
        replies = df_temp[df_temp['Gonderen'] != df_temp['Onceki_Gonderen']].copy()
        replies['Cevap_Suresi'] = replies['Tam_Zaman'] - replies['Onceki_Zaman']
        valid_replies = replies[replies['Cevap_Suresi'] < pd.Timedelta(hours=12)]
        
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            user_replies = valid_replies[valid_replies['Gonderen'] == user]
            if not user_replies.empty:
                avg_seconds = user_replies['Cevap_Suresi'].mean().total_seconds()
                result[user] = {"minutes": int(avg_seconds // 60), "seconds": int(avg_seconds % 60)}
            else:
                result[user] = None
        return result

    def get_special_actions(self):
        """Silinen, düzenlenen mesajlar ve stickerlar."""
        targets = {
            "deleted": ["bu mesaj silindi", "bu ileti silindi"],
            "sticker": ["çıkartma dahil edilmedi", "sticker dahil edilmedi"],
            "edited": ["bu mesaj düzenlendi", "bu ileti düzenlendi", "<bu ileti düzenlendi>"]
        }
        result = {}
        for key, keywords in targets.items():
            pattern = "|".join(keywords)
            subset = self.df[self.df['Mesaj'].str.contains(pattern, case=False, na=False)]
            if not subset.empty:
                counts = subset['Gonderen'].value_counts()
                result[key] = {"leader": counts.idxmax(), "count": int(counts.max()), "all_stats": counts.to_dict()}
            else:
                result[key] = None
        return result

    def get_media_stats(self):
        """Sesli mesaj ve link analizi."""
        audio_patterns = ["sesli mesaj", "audio omitted", "ptt", "ses kaydı"]
        url_pattern = r'(https?://|www\.)\S+'
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            user_msgs = self.df[self.df['Gonderen'] == user]['Mesaj'].astype(str).str.lower()
            audio_count = user_msgs.apply(lambda x: any(p in x for p in audio_patterns)).sum()
            link_count = user_msgs.str.count(url_pattern).sum()
            result[user] = {"audio_count": int(audio_count), "link_count": int(link_count)}
        return result

    def get_laugh_style(self):
        """Gülüş stili."""
        patterns = {"random": r'(?:[asdfghjklşi]{4,})', "classic": r'(?:ha){3,}|(?:he){3,}|(?:eh){3,}', "short": r'\b(lol|kdkd|sjsj)\b'}
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            user_msgs = self.df[self.df['Gonderen'] == user]['Mesaj'].astype(str).str.lower()
            user_stats = {}
            for style, pattern in patterns.items():
                count = user_msgs.str.count(pattern).sum()
                if count > 0: user_stats[style] = int(count)
            result[user] = user_stats
        return result

    def get_initiator_stats(self):
        """Konu başlatıcı."""
        df_temp = self.df.copy()
        df_temp['Fark'] = df_temp['Tam_Zaman'].diff()
        initiations = df_temp[df_temp['Fark'] > pd.Timedelta(hours=6)]
        counts = initiations['Gonderen'].value_counts()
        if not counts.empty:
            return {"leader": counts.idxmax(), "stats": counts.to_dict()}
        return None

    def get_word_patterns(self):
        """İkili kelime kalıpları (Bigrams)."""
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            user_msgs = self.df[self.df['Gonderen'] == user]['Mesaj'].astype(str).str.lower()
            valid_bigrams = []
            for msg in user_msgs:
                if "bekleniyor" in msg and "alabilir" in msg: continue
                if "sildiniz" in msg: continue
                msg_clean = re.sub(r'[^\w\s]', '', msg)
                words = [w for w in msg_clean.split() if w not in STOP_WORDS and len(w) > 2]
                bigrams = list(zip(words, words[1:]))
                for bg in bigrams:
                    phrase = f"{bg[0]} {bg[1]}"
                    if any(bad in phrase for bad in BLACKLIST_BIGRAMS): continue
                    valid_bigrams.append(phrase)
            if valid_bigrams:
                result[user] = [{"phrase": p, "count": c} for p, c in Counter(valid_bigrams).most_common(10)]
            else:
                result[user] = []
        return result

    def get_question_stats(self):
        """Soru ve kelime uzunluğu."""
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            user_msgs = self.df[self.df['Gonderen'] == user]['Mesaj'].astype(str)
            question_count = user_msgs.str.count(r'\?').sum()
            avg_words = user_msgs.apply(lambda x: len(x.split())).mean()
            result[user] = {"question_count": int(question_count), "avg_word_length": round(avg_words, 1)}
        return result

    def get_peak_day(self):
        """Rekor gün."""
        daily_counts = self.df['Tarih'].value_counts()
        return {"date": daily_counts.idxmax(), "count": int(daily_counts.max())}

    def get_vocabulary_stats(self):
        """Kelime hazinesi."""
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            text = " ".join(self.df[self.df['Gonderen'] == user]['Mesaj'].astype(str)).lower()
            text = re.sub(r'[^\w\s]', '', text)
            words = text.split()
            total = len(words)
            unique = len(set(words))
            ratio = (unique / total * 100) if total > 0 else 0
            result[user] = {"total": total, "unique": unique, "diversity_ratio": round(ratio, 2)}
        return result

    def get_milestones(self):
        """Yılın enleri: Geç saat, 1000. mesaj ve **En Kısa Mesaj**."""
        milestones = {}
        
        # En Geç Saat
        def shift_time(t_str):
            if pd.isna(t_str): return -1
            try:
                hour = int(t_str[:2])
                minute = int(t_str[3:5])
                if 0 <= hour < 6: hour += 24
                return hour * 60 + minute
            except: return -1
        self.df['Gece_Skoru'] = self.df['Saat'].apply(shift_time)
        latest_row = self.df.loc[self.df['Gece_Skoru'].idxmax()]
        milestones["latest_message"] = {"user": latest_row['Gonderen'], "time": latest_row['Saat'], "message": latest_row['Mesaj']}

        # 1000. Mesaj
        if len(self.df) >= 1000:
            msg_1000 = self.df.iloc[999]
            milestones["msg_1000"] = {"user": msg_1000['Gonderen'], "date": msg_1000['Tarih']}
        else:
            milestones["msg_1000"] = None

        # --- YENİ EKLENEN: En Kısa Mesaj ---
        # Sadece sistem mesajı olmayanları filtrele
        clean_df = self.df[~self.df['Mesaj'].str.lower().apply(lambda x: any(sf in x for sf in SYSTEM_FILTERS))]
        if not clean_df.empty:
            clean_df['Uzunluk'] = clean_df['Mesaj'].astype(str).apply(len)
            min_len = clean_df['Uzunluk'].min()
            shortest_row = clean_df[clean_df['Uzunluk'] == min_len].iloc[0]
            milestones["shortest_message"] = {"user": shortest_row['Gonderen'], "length": int(min_len), "message": shortest_row['Mesaj']}
        else:
            milestones["shortest_message"] = None
            
        return milestones

    def get_caps_lock_stats(self):
        """Caps lock analizi."""
        users = self.df['Gonderen'].unique()
        result = {}
        for user in users:
            user_msgs = self.df[self.df['Gonderen'] == user]['Mesaj'].astype(str)
            shout_count = 0
            for msg in user_msgs:
                clean_msg = re.sub(r'[^a-zA-ZğüşıöçĞÜŞİÖÇ]', '', msg)
                if len(clean_msg) > 3:
                    upper_count = sum(1 for c in clean_msg if c.isupper())
                    if upper_count / len(clean_msg) > 0.8: shout_count += 1
            result[user] = {"shout_count": shout_count}
        return result