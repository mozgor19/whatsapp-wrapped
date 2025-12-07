FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Önce sadece package dosyalarını kopyala (Cache optimizasyonu için)
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Kalan tüm dosyaları kopyala
COPY . .

# Vite portunu dışarı aç
EXPOSE 5173

# Uygulamayı başlat (Host 0.0.0.0 dışarıdan erişim için şarttır)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]