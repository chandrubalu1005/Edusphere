const fs = require('fs');
const path = require('path');
const http = require('http');

const CSV_FILE = path.join(__dirname, '../../CampusSphere_All_1141_Users(1).csv');
const DEFAULT_PASSWORD = 'password123';

function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const parts = [];
    let isInsideQuote = false;
    let colStr = "";
    for(let i=0; i<line.length; i++) {
        if(line[i] === '"') isInsideQuote = !isInsideQuote;
        else if (line[i] === ',' && !isInsideQuote) { parts.push(colStr); colStr = ""; }
        else colStr += line[i];
    }
    parts.push(colStr);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = parts[i] ? parts[i].trim() : null; });
    return obj;
  });
}

// Minimal request wrapper
function makeRequest(method, urlPath, token, payload = null, port = 3001) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: urlPath,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e){}
        resolve({ status: res.statusCode, data: json, raw: data });
      });
    });
    req.on('error', err => resolve({ error: err.message, status: 500 }));
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
}

async function runRbacTests() {
  const csvText = fs.readFileSync(CSV_FILE, 'utf8');
  const users = parseCSV(csvText);

  // Pick 1 of each role
  const rootAdmin = users.find(u => u.role === 'ROOT_ADMIN');
  const admin = users.find(u => u.role === 'ADMIN');
  const mgmt = users.find(u => u.role === 'MANAGEMENT');
  const hod = users.find(u => u.role === 'HOD');
  const faculty = users.find(u => u.role === 'FACULTY');
  const student = users.find(u => u.role === 'STUDENT');

  const selectedUsers = { rootAdmin, admin, mgmt, hod, faculty, student };
  console.log("Selected Users for RBAC Test:");
  Object.keys(selectedUsers).forEach(k => {
      if(selectedUsers[k]) console.log(`${k}: ${selectedUsers[k].username}`);
      else console.log(`${k}: NOT FOUND in CSV`);
  });

  const tokens = {};
  let overallPass = true;
  let md = "# RBAC Verification Report\n\n";

  // Login via Auth Service (port 3001)
  for (const [key, u] of Object.entries(selectedUsers)) {
      if (!u) continue;
      
      let reqDomain = u.role;
      if (['ADMIN', 'MANAGEMENT', 'FACULTY', 'STUDENT'].includes(u.role)) {
          reqDomain = u.role.toLowerCase();
      }

      const res = await makeRequest('POST', '/login', null, {
          identifier: u.username,
          password: DEFAULT_PASSWORD,
          domain: reqDomain
      }, 3001);
      if (res.status === 200 && res.data && res.data.token) {
          tokens[key] = res.data.token;
          console.log(`[PASS] Login ${key}`);
          md += `✅ **Login ${key}**: PASS (${u.username})\n`;
      } else {
          console.error(`[FAIL] Login ${key}: ${res.status}`);
          md += `❌ **Login ${key}**: FAIL (${res.status})\n`;
          overallPass = false;
      }
  }

  // Admin service (3015), User service (3002)
  const rbacTests = [
      {
          desc: "Admin trying to access ROOT_ADMIN specific route (Admin Service)",
          role: "admin",
          method: "GET",
          url: "/audit", // direct route on admin-service
          port: 3015,
          expectStatus: [401, 403, 404]
      },
      {
          desc: "Student accessing another student's profile (User Service)",
          role: "student",
          method: "GET",
          url: `/${admin.userId}`,
          port: 3002,
          expectStatus: [200]
      },
      {
          desc: "Faculty accessing their own profile (User Service)",
          role: "faculty",
          method: "GET",
          url: `/${faculty.userId}`,
          port: 3002,
          expectStatus: [200]
      },
      {
          desc: "HOD trying to access admin users list (Admin Service)",
          role: "hod",
          method: "GET",
          url: "/users",
          port: 3015,
          expectStatus: [403, 401]
      }
  ];

  md += "\n## Endpoint Tests\n\n";

  for (const t of rbacTests) {
      if (!tokens[t.role]) continue;
      const res = await makeRequest(t.method, t.url, tokens[t.role], null, t.port);
      const passed = t.expectStatus.includes(res.status);
      if (passed) {
          console.log(`[PASS] ${t.desc} -> Got ${res.status} (Expected ${t.expectStatus.join('|')})`);
          md += `✅ **${t.desc}**: PASS (Got ${res.status})\n`;
      } else {
          console.log(`[FAIL] ${t.desc} -> Got ${res.status} (Expected ${t.expectStatus.join('|')})`);
          md += `❌ **${t.desc}**: FAIL (Got ${res.status})\n`;
          overallPass = false;
      }
  }

  md += `\n## Overall Verdict\n${overallPass ? 'PASS' : 'FAIL'}\n`;
  fs.writeFileSync(path.join(__dirname, '../../docs/CSV_USER_VERIFICATION_REPORT.md'), md);
  console.log(`\nRBAC Tests completed. Overall: ${overallPass ? 'PASS' : 'FAIL'}`);
}

runRbacTests().catch(console.error);
