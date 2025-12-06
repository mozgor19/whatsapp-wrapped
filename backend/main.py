from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import zipfile
from converter import parse_whatsapp_to_csv
from analyzer import WhatsAppAnalyzer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def find_chat_file_in_zip(zip_path, extract_to):
    """Zip içindeki _chat.txt dosyasını bulur ve çıkarır."""
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Zip içindeki tüm dosyaları tara
        for file in zip_ref.namelist():
            # Genelde "_chat.txt" veya "sohbet.txt" olur, ama .txt ile biten en büyük dosyayı alalım
            if file.endswith(".txt") and "__MACOSX" not in file:
                zip_ref.extract(file, extract_to)
                return os.path.join(extract_to, file)
    return None

@app.post("/analyze")
async def analyze_chat(file: UploadFile = File(...)):
    # Geçici dosya isimleri
    temp_filename = f"temp_{file.filename}"
    temp_csv = "chat.csv"
    extracted_txt = None
    
    try:
        # 1. Dosyayı sunucuya kaydet
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Dosya tipine göre işlem yap
        if temp_filename.endswith(".zip"):
            extract_folder = "temp_extract"
            if not os.path.exists(extract_folder):
                os.makedirs(extract_folder)
            
            extracted_txt = find_chat_file_in_zip(temp_filename, extract_folder)
            
            if not extracted_txt:
                raise HTTPException(status_code=400, detail="Zip dosyasında geçerli bir .txt sohbet dosyası bulunamadı.")
            
            process_file = extracted_txt
        else:
            process_file = temp_filename

        # 3. Converter (TXT -> CSV)
        try:
            parse_whatsapp_to_csv(process_file, temp_csv)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Dönüştürme hatası: {str(e)}")

        # 4. Analyzer (CSV -> JSON)
        try:
            analyzer = WhatsAppAnalyzer(temp_csv)
            
            data = {
                "messages": analyzer.get_message_stats(),
                "words": analyzer.get_top_words(),
                "emojis": analyzer.get_emoji_stats(),
                "hourly": analyzer.get_hourly_activity(),
                "daily": analyzer.get_daily_activity(),
                "deep_talks": analyzer.get_deep_talks(),
                "response_time": analyzer.get_average_response_time(),
                "special_actions": analyzer.get_special_actions(),
                "media": analyzer.get_media_stats(),
                "laugh": analyzer.get_laugh_style(),
                "initiator": analyzer.get_initiator_stats(),
                "bigrams": analyzer.get_word_patterns(),
                "questions": analyzer.get_question_stats(),
                "peak_day": analyzer.get_peak_day(),
                "vocabulary": analyzer.get_vocabulary_stats(),
                "milestones": analyzer.get_milestones(),
                "caps": analyzer.get_caps_lock_stats()
            }
            return data

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Analiz hatası: {str(e)}")

    finally:
        # 5. TEMİZLİK (GÜVENLİK İÇİN KRİTİK)
        # İşlem bitince sunucudaki tüm geçici dosyaları sil
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        if os.path.exists(temp_csv):
            os.remove(temp_csv)
        if 'extract_folder' in locals() and os.path.exists(extract_folder):
            shutil.rmtree(extract_folder)