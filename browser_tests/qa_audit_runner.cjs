const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://10.130.16.178:5173';
const EVIDENCE_DIR = path.join(__dirname, '../qa-evidence/2026-09-09');

const USERS = [
    { role: 'student', user: 'cse2026a001', pass: 'password123', portal: '/student', unauthorized: '/admin/dashboard' },
    { role: 'faculty', user: 'csefac001', pass: 'password123', portal: '/faculty', unauthorized: '/admin/dashboard' },
    { role: 'hod', user: 'csehod', pass: 'password123', portal: '/faculty', unauthorized: '/admin/dashboard' },
    { role: 'admin', user: 'admin01', pass: 'password123', portal: '/admin', unauthorized: '/student/dashboard' },
    { role: 'management', user: 'management01', pass: 'password123', portal: '/management', unauthorized: '/admin/dashboard' },
    { role: 'root_admin', user: 'rootadmin', pass: 'password123', portal: '/admin', unauthorized: '/student/dashboard' }
];

async function run() {
    if (!fs.existsSync(EVIDENCE_DIR)) fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();
    const results = [];

    for (const u of USERS) {
        console.log(`\nTesting ${u.role}...`);
        
        // 1. Clear state
        await page.goto(BASE_URL);
        await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch(e){} });
        
        // 2. Login
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
        await page.waitForFunction(() => !document.querySelector('.splash-overlay'), { timeout: 15000 }).catch(()=>{});
        
        // Select Domain
        await page.waitForFunction(() => document.querySelectorAll('button').length > 0, { timeout: 15000 }).catch(()=>{});
        
        const btnIndex = await page.evaluate((role) => {
            const btns = Array.from(document.querySelectorAll('button'));
            let targetDomain = role;
            if (role === 'hod') targetDomain = 'faculty';
            if (role === 'root_admin') targetDomain = 'admin';
            if (role === 'management') targetDomain = 'management';
            
            return btns.findIndex(b => b.textContent && b.textContent.toLowerCase().includes(targetDomain));
        }, u.role);
        
        if (btnIndex >= 0) {
            const btns = await page.$$('button');
            await btns[btnIndex].click();
        } else {
            const texts = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent));
            console.log(`[WARN] Could not find domain button for ${u.role}. Found buttons:`, texts);
        }
        
        await page.waitForSelector('#login-identifier', { timeout: 10000 }).catch(()=>{});
        await page.type('#login-identifier', u.user);
        await page.type('#login-password', u.pass);
        await page.click('button.btn-primary');
        
        try {
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
        } catch (e) {
            console.log(`[WARN] Navigation timeout for ${u.role}`);
        }

        await page.screenshot({ path: path.join(EVIDENCE_DIR, `${u.role}_dashboard.png`) });
        
        // Check if actually logged in
        const currentUrl = page.url();
        if (!currentUrl.includes(u.portal)) {
            console.log(`[FAIL] ${u.role} failed to reach portal. Current URL: ${currentUrl}`);
            results.push({ role: u.role, route: 'login', status: 'FAIL', reason: 'Auth failed' });
            continue;
        }

        // 3. Extract Sidebar Links
        const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a[href]'));
            return anchors.map(a => ({ href: a.getAttribute('href'), text: a.innerText })).filter(a => a.href.startsWith('/'));
        });
        
        const uniqueLinks = [...new Set(links.map(l => l.href))];
        console.log(`Found ${uniqueLinks.length} routes for ${u.role}`);

        // 4. Visit Links
        for (const link of uniqueLinks) {
            if (link.includes('logout') || link === '/') continue;
            console.log(`  Visiting ${link}...`);
            try {
                await page.goto(`${BASE_URL}${link}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
                // Give it a tiny bit of time for React to render
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                console.log(`  [WARN] Navigation timeout for ${link}, proceeding anyway...`);
            }
            await page.screenshot({ path: path.join(EVIDENCE_DIR, `${u.role}_${link.replaceAll('/', '_')}.png`) });
            
            // Detect Placeholders
            const isPlaceholder = await page.evaluate(() => {
                const text = document.body.innerText.toLowerCase();
                return text.includes('pageplaceholder') || text.includes('coming soon') || text.includes('under construction');
            });
            
            // Check for actual data elements (e.g. tables, cards that are not empty)
            const hasData = await page.evaluate(() => {
                return document.querySelectorAll('tr, .card, .grid > div').length > 0;
            });

            results.push({
                role: u.role,
                route: link,
                status: isPlaceholder ? 'PLACEHOLDER' : (hasData ? 'REAL/PARTIAL' : 'STATIC/EMPTY')
            });
        }
        
        // 5. Test Unauthorized Access
        console.log(`  Testing RBAC: ${u.role} -> ${u.unauthorized}`);
        try {
            await page.goto(`${BASE_URL}${u.unauthorized}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.log(`  [WARN] Navigation timeout for ${u.unauthorized}`);
        }
        await page.screenshot({ path: path.join(EVIDENCE_DIR, `${u.role}_unauthorized.png`) });
        
        const rbacUrl = page.url();
        const rbacStatus = (rbacUrl.includes('unauthorized') || rbacUrl.includes(u.portal)) ? 'PASS' : 'FAIL';
        results.push({
            role: u.role,
            route: u.unauthorized,
            status: rbacStatus,
            type: 'SECURITY_TEST'
        });
    }

    fs.writeFileSync(path.join(EVIDENCE_DIR, 'route_audit_results.json'), JSON.stringify(results, null, 2));
    await browser.close();
    console.log("Audit Complete.");
}

run();
