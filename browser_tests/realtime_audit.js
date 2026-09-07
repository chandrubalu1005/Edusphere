const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\83ee4c32-a044-482f-bff1-82fe5f50765e';
const BASE_URL = 'http://10.130.18.187:5173';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function takeScreenshot(page, name) {
    const filename = `${name}.png`;
    const filePath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`[SCREENSHOT_SAVED] ${name} -> ${filePath}`);
    return filePath;
}

(async () => {
    console.log(`=== STARTING FACULTY PORTAL REAL-TIME AUDIT VIA LAN IP (${BASE_URL}) ===`);
    
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();
    
    // Log console messages & network errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[BROWSER_ERROR] ${msg.text()}`);
        }
    });

    page.on('requestfailed', req => {
        console.log(`[NET_FAILED] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    try {
        console.log('1. Navigating to login portal at ' + BASE_URL + '/login ...');
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
        await delay(2000);

        console.log('Waiting for domain selection cards to render...');
        await page.waitForFunction(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.some(b => b.innerText && b.innerText.toLowerCase().includes('faculty'));
        }, { timeout: 15000 });

        console.log('Clicking Faculty portal domain button...');
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const facultyBtn = btns.find(b => b.innerText && b.innerText.toLowerCase().includes('faculty'));
            if (facultyBtn) facultyBtn.click();
        });

        await delay(2000);

        // Enter credentials
        console.log('2. Entering Faculty Credentials (faculty_1@edusphere.edu)...');
        await page.waitForSelector('#login-identifier', { timeout: 10000 });
        await page.type('#login-identifier', 'faculty_1@edusphere.edu');
        await page.type('#login-password', 'demo123');

        await takeScreenshot(page, '00_faculty_login_filled');

        console.log('Submitting login form...');
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            await submitBtn.click();
        } else {
            await page.keyboard.press('Enter');
        }

        // Wait for redirection to faculty portal
        console.log('Waiting for authentication and redirect to /faculty/...');
        await page.waitForFunction(() => window.location.pathname.includes('/faculty/'), { timeout: 15000 });
        await delay(4000);
        console.log('Successfully logged in! Current URL: ' + page.url());

        // Routes to audit and screenshot
        const routes = [
            { name: '01_faculty_dashboard', path: '/faculty/dashboard' },
            { name: '02_faculty_courses', path: '/faculty/courses' },
            { name: '03_faculty_attendance', path: '/faculty/attendance' },
            { name: '04_faculty_assignments', path: '/faculty/assignments' },
            { name: '05_faculty_timetable', path: '/faculty/timetable' },
            { name: '06_faculty_leave', path: '/faculty/leave' },
            { name: '07_faculty_performance', path: '/faculty/performance' },
            { name: '08_faculty_discussions', path: '/faculty/discussions' },
            { name: '09_faculty_announcements', path: '/faculty/announcements' },
            { name: '10_faculty_grades', path: '/faculty/grades' },
            { name: '11_faculty_completion', path: '/faculty/completion' },
            { name: '12_faculty_ai_tools', path: '/faculty/ai-tools' },
            { name: '13_faculty_feedback', path: '/faculty/feedback' },
            { name: '14_faculty_otp_attendance', path: '/faculty/otp-attendance' },
            { name: '15_faculty_content_upload', path: '/faculty/content' },
            { name: '16_faculty_analytics', path: '/faculty/analytics' },
            { name: '17_faculty_profile', path: '/faculty/profile' },
            { name: '18_faculty_notifications', path: '/faculty/notifications' },
            { name: '19_faculty_users', path: '/faculty/users' }
        ];

        console.log(`\n=== 3. WALKING THROUGH ALL ${routes.length} FACULTY ROUTES VIA LAN IP ===`);

        async function navigateToRoute(targetPath) {
            console.log(`Navigating to ${targetPath} ...`);
            const clicked = await page.evaluate((p) => {
                const links = Array.from(document.querySelectorAll('a.nav-item, nav a'));
                const link = links.find(a => a.getAttribute('href') === p);
                if (link) {
                    link.click();
                    return true;
                }
                return false;
            }, targetPath);

            if (!clicked) {
                await page.goto(`${BASE_URL}${targetPath}`, { waitUntil: 'networkidle2' });
            }

            // Wait until loading splash screen is completely gone and page header/card is rendered
            await page.waitForFunction(() => {
                const text = document.body.innerText;
                const notLoading = !text.includes('Loading CampusSphere');
                const hasContent = document.querySelector('.page-header, .page-title, h1, .stat-grid, .card, main') !== null;
                return notLoading && hasContent;
            }, { timeout: 15000 });

            await delay(2500); // Allow live data queries and charts to render
        }

        for (const route of routes) {
            await navigateToRoute(route.path);
            await takeScreenshot(page, route.name);
            console.log(`[PAGE_PASS] ${route.name} loaded successfully.`);
        }

        // Test real interaction: On Leave Management (/faculty/leave)
        console.log('\n=== 4. TESTING REAL-TIME WORKFLOW INTERACTION: LEAVE MANAGEMENT ===');
        await page.goto(`${BASE_URL}/faculty/leave`, { waitUntil: 'networkidle2' });
        await delay(3000);

        // Look for an approve button or action
        const actionButtons = await page.$$('button');
        let approved = false;
        for (const btn of actionButtons) {
            const txt = await page.evaluate(el => el.innerText, btn);
            if (txt && (txt.toLowerCase().includes('approve') || txt.toLowerCase().includes('accept'))) {
                console.log(`Found action button "${txt.trim()}", clicking to test real-time approval...`);
                await btn.click();
                approved = true;
                await delay(2000);
                break;
            }
        }

        await takeScreenshot(page, '20_faculty_leave_after_action');

        console.log('\n=== 5. REFRESHING PAGE TO VERIFY PERSISTENCE ===');
        await page.reload({ waitUntil: 'networkidle2' });
        await delay(3000);
        await takeScreenshot(page, '21_faculty_leave_persisted_after_refresh');

        console.log('\n=== FACULTY REAL-TIME AUDIT COMPLETED SUCCESSFULLY! ===');
    } catch (err) {
        console.error('Walkthrough error:', err);
        await takeScreenshot(page, 'error_state');
    } finally {
        await browser.close();
        console.log('Browser session closed.');
    }
})();
