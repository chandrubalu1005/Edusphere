const fs = require('fs');
const readline = require('readline');

async function extract() {
    const logPath = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\9b1d19d9-8f9f-4459-af5e-533c7cf53997\\.system_generated\\logs\\transcript_full.jsonl';
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        try {
            const entry = JSON.parse(line);
            const strContent = JSON.stringify(entry);
            const marker = 'userId,username,displayName,role,status';
            const startIndex = strContent.indexOf(marker);
            if (startIndex !== -1) {
                // Find where the CSV ends, assuming it ends before the next JSON field or closing quotes.
                // It's easier to just regex extract or use the stringified version and then parse it back
                let actualText = '';
                if (typeof entry.content === 'string') {
                    actualText = entry.content;
                } else if (Array.isArray(entry.content)) {
                    for (const part of entry.content) {
                        if (part.text && part.text.includes(marker)) {
                            actualText = part.text;
                        }
                    }
                } else if (entry.content && entry.content.text) {
                    actualText = entry.content.text;
                }
                
                if (!actualText) {
                    // fallback to raw string content
                    const match = strContent.match(/userId,username,displayName,role.*?,,/g);
                    if (match) actualText = match[0];
                }
                
                const realStart = actualText.indexOf(marker);
                if (realStart !== -1) {
                    fs.writeFileSync('CampusSphere_All_1141_Users(1).csv', actualText.substring(realStart), 'utf8');
                    console.log('Successfully extracted CSV!');
                    return;
                }
            }
        } catch (e) {
            // ignore
        }
    }
    console.log('CSV not found in transcript.');
}

extract();
