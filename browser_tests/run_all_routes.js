const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\83ee4c32-a044-482f-bff1-82fe5f50765e';
const BASE_URL = 'http://10.50.240.43:5173';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

(async () => {
    console.log(`=== AUDITING ALL FACULTY ROUTES AT ${BASE_URL} ===`);
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();

    const apiErrors = [];
    page.on('response', async res => {
        const url = res.url();
        const status = res.status();
        if (url.includes('/api/') && status >= 400) {
            let body = '';
            try { body = await res.text(); } catch(e){}
            apiErrors.push({ status, url, body });
            console.log(`[API ERROR ${status}] ${url} -> ${body}`);
        }
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[PAGE ERROR]: ${msg.text()}`);
        }
    });

    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
        await page.waitForFunction(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.some(b => b.innerText && b.innerText.toLowerCase().includes('faculty'));
        }, { timeout: 15000 });

        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const facultyBtn = btns.find(b => b.innerText && b.innerText.toLowerCase().includes('faculty'));
            if (facultyBtn) facultyBtn.click();
        });

        await page.waitForSelector('#login-identifier', { timeout: 10000 });
        await page.type('#login-identifier', 'faculty_2@edusphere.edu');
        await page.type('#login-password', 'demo123');

        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) await submitBtn.click();

        await page.waitForFunction(() => window.location.pathname.includes('/faculty/'), { timeout: 15000 });
        console.log('Logged in successfully!');
        // Wait for initial splash screen to finish
        await page.waitForFunction(() => !document.querySelector('.splash-overlay'), { timeout: 15000 }).catch(() => {});
        await delay(1500);

        const routes = [
            { id: 'dashboard', path: '/faculty/dashboard' },
            { id: 'courses', path: '/faculty/courses' },
            { id: 'content', path: '/faculty/content' },
            { id: 'assessments', path: '/faculty/assessments' },
            { id: 'assignments', path: '/faculty/assignments' },
            { id: 'attendance', path: '/faculty/attendance' },
            { id: 'timetable', path: '/faculty/timetable' },
            { id: 'users', path: '/faculty/users' },
            { id: 'performance', path: '/faculty/performance' },
            { id: 'grades', path: '/faculty/grades' },
            { id: 'completion', path: '/faculty/completion' },
            { id: 'feedback', path: '/faculty/feedback' },
            { id: 'discussions', path: '/faculty/discussions' },
            { id: 'announcements', path: '/faculty/announcements' },
            { id: 'analytics', path: '/faculty/analytics' },
            { id: 'leave', path: '/faculty/leave' },
            { id: 'ai-tools', path: '/faculty/ai-tools' },
            { id: 'profile', path: '/faculty/profile' },
            { id: 'notifications', path: '/faculty/notifications' },
            { id: 'otp-attendance', path: '/faculty/otp-attendance' }
        ];

        const results = [];

        for (const r of routes) {
            console.log(`\nTesting route: ${r.path} ...`);
            apiErrors.length = 0; // reset for this page
            
            const sidebarLink = await page.$(`a[href="${r.path}"]`);
            if (sidebarLink) {
                await sidebarLink.click();
            } else {
                await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle2' });
                await page.waitForFunction(() => !document.querySelector('.splash-overlay'), { timeout: 10000 }).catch(() => {});
            }
            await delay(2000);

            const pageState = await page.evaluate(() => {
                const text = document.body.innerText;
                const hasErrorBoundary = text.includes('Something went wrong') && text.includes('We couldn\'t load this page');
                const hasToastError = Array.from(document.querySelectorAll('[role="status"], .toaster, div')).some(d => 
                    d.innerText && (d.innerText.includes('permission') || d.innerText.includes('error') || d.innerText.includes('failed'))
                );
                return {
                    hasErrorBoundary,
                    hasToastError,
                    bodySnippet: text.slice(0, 300).replace(/\n+/g, ' ')
                };
            });

            const screenshotFile = `route_${r.id}.png`;
            const screenshotPath = path.join(ARTIFACT_DIR, screenshotFile);
            await page.screenshot({ path: screenshotPath, fullPage: true });

            const status = pageState.hasErrorBoundary ? 'CRASH' : (apiErrors.length > 0 ? 'WARN' : 'OK');
            console.log(`Result for ${r.id}: [${status}] - ErrorBoundary: ${pageState.hasErrorBoundary}, API Errors: ${apiErrors.length}`);
            if (pageState.hasErrorBoundary) {
                console.log(`  Snippet: ${pageState.bodySnippet}`);
            }

            results.push({
                route: r.path,
                status,
                hasErrorBoundary: pageState.hasErrorBoundary,
                apiErrors: [...apiErrors],
                screenshot: screenshotFile
            });
        }

        console.log('\n================ AUDIT SUMMARY ================');
        for (const res of results) {
            console.log(`${res.route}: ${res.status} (${res.hasErrorBoundary ? 'ERROR BOUNDARY CRASH' : 'NO CRASH'}, ${res.apiErrors.length} API errors)`);
        }

    } catch (err) {
        console.error('Audit fatal error:', err);
    } finally {
        await browser.close();
    }
})();
