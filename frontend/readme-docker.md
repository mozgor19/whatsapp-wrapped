# WhatsApp Wrapped - Docker Setup

WhatsApp konuşmalarınızdan Wrapped görsellerinizi oluşturun!

## 📦 Proje Yapısı

```
whatsapp-wrapped/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .dockerignore
└── src/
    ├── main.jsx
    ├── App.jsx
    └── index.css
```

## 🚀 Hızlı Başlangıç

### Docker Compose ile (Önerilen)

```bash
# Projeyi başlat
docker-compose up -d

# Tarayıcıda aç
# http://localhost:3000
```

### Manuel Docker Build

```bash
# Image'ı build et
docker build -t whatsapp-wrapped .

# Container'ı çalıştır
docker run -d -p 3000:80 --name whatsapp-wrapped whatsapp-wrapped

# Tarayıcıda aç
# http://localhost:3000
```

## 🛠️ Geliştirme Ortamı

Geliştirme için lokal olarak çalıştırmak isterseniz:

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# http://localhost:5173
```

## 📝 WhatsApp Sohbeti Nasıl Dışa Aktarılır?

1. WhatsApp'ta sohbeti açın
2. Üst menüden **⋮** (Daha fazla) > **Dışa aktar**'a tıklayın
3. **Medya olmadan** seçeneğini seçin
4. Dosyayı kaydedin (.txt formatında)
5. Uygulamaya yükleyin

## 🐳 Docker Komutları

```bash
# Logları görüntüle
docker-compose logs -f

# Container'ı durdur
docker-compose down

# Container'ı yeniden başlat
docker-compose restart

# Image'ı yeniden build et
docker-compose up -d --build

# Container içine gir
docker exec -it whatsapp-wrapped sh
```

## 🔧 Port Değiştirme

`docker-compose.yml` dosyasında portu değiştirebilirsiniz:

```yaml
ports:
  - "8080:80"  # 8080 yerine istediğiniz portu yazın
```

## 📊 Özellikler

### Bireysel Sohbet
- Mesaj sayıları
- En çok kullanılan kelime ve emoji
- En uzun konuşma günü
- En aktif saat
- Sohbetin rengi (harf dağılımına göre)

### Grup Sohbeti
- Tüm bireysel özellikler +
- En geveze kişi
- En sessiz kişi
- En detaylı yazan
- Gece kuşu
- Sabahçı

## 🖼️ Görsel İndirme

Her slayt için ayrı ayrı PNG formatında görsel indirebilirsiniz.

## 🐛 Sorun Giderme

### Port zaten kullanımda hatası
```bash
# 3000 portu kullanımdaysa başka port deneyin
docker run -d -p 8080:80 whatsapp-wrapped
```

### Build hatası
```bash
# Cache'i temizle ve tekrar build et
docker-compose build --no-cache
docker-compose up -d
```

### Container çalışmıyor
```bash
# Logları kontrol et
docker-compose logs

# Containerları listele
docker ps -a
```

## 📄 Lisans

MIT License

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için lütfen önce bir issue açın.

---

⭐ Beğendiyseniz yıldız vermeyi unutmayın!