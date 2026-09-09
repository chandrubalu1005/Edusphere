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
            if (entry.content) {
                const marker = 'userId,username,displayName,role,status';
                const startIndex = entry.content.indexOf(marker);
                if (startIndex !== -1) {
                    const csvContent = entry.content.substring(startIndex);
                    // Just slice it up to the last known line
                    fs.writeFileSync('CampusSphere_All_1141_Users(1).csv', csvContent, 'utf8');
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
