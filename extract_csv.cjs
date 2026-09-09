const fs = require('fs');
const content = fs.readFileSync('user_request_untruncated.txt', 'utf8');
const searchStr = 'userId,username,displayName,role';
const startIndex = content.indexOf(searchStr);
if (startIndex !== -1) {
    fs.writeFileSync('CampusSphere_All_1141_Users(1).csv', content.substring(startIndex));
    console.log('Successfully wrote CSV to CampusSphere_All_1141_Users(1).csv');
} else {
    console.error('Could not find CSV start in user_request_untruncated.txt');
}
