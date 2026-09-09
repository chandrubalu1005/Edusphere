import json
import os

log_path = r'C:\Users\ASUS\.gemini\antigravity-ide\brain\9b1d19d9-8f9f-4459-af5e-533c7cf53997\.system_generated\logs\transcript_full.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT':
                content = data.get('content', '')
                marker = 'userId,username,displayName,role,status'
                if marker in content:
                    idx = content.find(marker)
                    csv_data = content[idx:]
                    with open('CampusSphere_All_1141_Users(1).csv', 'w', encoding='utf-8') as out:
                        out.write(csv_data)
                    print("CSV extracted successfully!")
                    break
        except Exception as e:
            pass
