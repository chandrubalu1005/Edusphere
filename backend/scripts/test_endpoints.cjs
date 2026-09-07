const axios = require('axios');

const BASE_API = 'http://10.50.240.43:5173/api';

(async () => {
  try {
    console.log('Logging in via Vite proxy to /api/auth/login ...');
    const res = await axios.post(`${BASE_API}/auth/login`, {
      identifier: 'faculty_2@edusphere.edu',
      password: 'demo123',
      domain: 'faculty'
    });
    console.log('Login success! User:', res.data.user);
    const token = res.data.token;
    
    const testEndpoints = [
      { name: '01 courses', url: `${BASE_API}/courses` },
      { name: '02 assignments', url: `${BASE_API}/assignments` },
      { name: '03 pending submissions', url: `${BASE_API}/submissions/pending` },
      { name: '04 attendance weekly-summary', url: `${BASE_API}/attendance/weekly-summary?facultyId=${res.data.user.id || res.data.user._id}` },
      { name: '05 leave requests', url: `${BASE_API}/leave/requests?role=faculty` },
      { name: '06 leave quota', url: `${BASE_API}/leave/quota/${res.data.user.id || res.data.user._id}` },
      { name: '07 calendar events', url: `${BASE_API}/calendar` },
      { name: '08 timetable', url: `${BASE_API}/timetable` },
      { name: '09 discussions', url: `${BASE_API}/discussion/threads/6a9c4a12f4eacbcd9a85c48d` },
      { name: '10 assignment stats', url: `${BASE_API}/assignments/stats` },
      { name: '11 notifications', url: `${BASE_API}/notifications` },
      { name: '12 users', url: `${BASE_API}/users` },
      { name: '13 user profile', url: `${BASE_API}/users/${res.data.user.id || res.data.user._id}` }
    ];

    for (const ep of testEndpoints) {
      try {
        const r = await axios.get(ep.url, { headers: { Authorization: `Bearer ${token}` } });
        console.log(`[PASS] ${ep.name} -> status ${r.status}`);
      } catch (err) {
        console.log(`[FAIL] ${ep.name} -> status ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
      }
    }
  } catch (e) {
    console.error('Fatal Login Error:', e.response?.status, e.response?.data || e.message);
  }
})();
