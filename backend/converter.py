import re
import csv
import sys
import os

def parse_whatsapp_to_csv(input_file, output_file):
    print(f"Islem basliyor: {input_file} -> {output_file}")
    
    # Regex: Gün/Ay tek veya çift hane olabilir (1.1.2025 veya 01.01.2025)
    log_pattern = re.compile(
        r'^\[?(\d{1,2}[./]\d{1,2}[./]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\]?(?:\s-\s)?\s([^:]+):\s(.+)', 
        re.VERBOSE
    )

    system_messages = [
        "uçtan uca şifreli", "grubu oluşturdu", "kişisini ekledi", 
        "ayrıldı", "medya dahil edilmedi", "görüntü dahil edilmedi", 
        "araması", "engellediniz", "belge dahil edilmedi", "video dahil edilmedi",
        "sticker dahil edilmedi"
    ]

    parsed_data = []
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        current_date = ""
        current_time = ""
        current_sender = ""
        current_message = ""
        
        for line in lines:
            line = line.strip()
            
            # --- KRİTİK GÜNCELLEME BURADA ---
            # WhatsApp'ın gizli yön karakterlerini temizliyoruz
            # \u200e: Left-to-Right Mark
            # \u202c: Pop Directional Formatting
            # \u2069: Pop Directional Isolate (Senin hatan buydu)
            # \u2068: First Strong Isolate
            line = line.replace('\u200e', '').replace('\u202c', '').replace('\u2069', '').replace('\u2068', '')
            # --------------------------------

            if not line: continue
            
            if any(sys_msg in line.lower() for sys_msg in system_messages):
                continue

            match = log_pattern.match(line)
            
            if match:
                # Yeni mesaj yakalandı, öncekini kaydet
                if current_message:
                    parsed_data.append([current_date, current_time, current_sender, current_message])
                
                current_date, current_time, current_sender, msg_content = match.groups()
                current_message = msg_content
                
            else:
                # Eşleşme yoksa önceki mesajın devamıdır
                if current_message:
                    current_message += " " + line

        # Son mesajı ekle
        if current_message:
             parsed_data.append([current_date, current_time, current_sender, current_message])

        # CSV Yazma
        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["Tarih", "Saat", "Gonderen", "Mesaj"])
            writer.writerows(parsed_data)
            
        print(f"Basarili! Toplam {len(parsed_data)} mesaj CSV'ye cevrildi.")

    except FileNotFoundError:
        print("HATA: Dosya bulunamadi.")
    except Exception as e:
        print(f"HATA: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanim: python converter.py <sohbet.txt>")
    else:
        input_txt = sys.argv[1]
        output_csv = input_txt.replace(".txt", ".csv")
        parse_whatsapp_to_csv(input_txt, output_csv)