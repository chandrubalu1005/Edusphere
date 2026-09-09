const fs = require('fs');
const content = fs.readFileSync('user_request_untruncated.txt', 'utf8');
const marker = 'userId,username,displayName,role,status';
const startIndex = content.indexOf(marker);
if (startIndex !== -1) {
    let csv = content.substring(startIndex);
    // it ends when the next block or tag starts, or end of file
    const endTag = csv.indexOf('</USER_REQUEST>');
    if (endTag !== -1) {
        csv = csv.substring(0, endTag).trim();
    }
    fs.writeFileSync('CampusSphere_All_1141_Users(1).csv', csv, 'utf8');
    console.log('Done, wrote lines: ' + csv.split('\n').length);
} else {
    console.log('Marker not found');
}
