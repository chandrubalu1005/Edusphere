const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting diagnostic browser session...');
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`[CONSOLE ${msg.type()}]:`, msg.text());
    });

    page.on('response', async res => {
        const url = res.url();
        const status = res.status();
        if (url.includes('/api/')) {
            if (status >= 400) {
                let body = '';
                try { body = await res.text(); } catch(e){}
                console.log(`[API ERROR ${status}] ${url} -> ${body}`);
            } else {
                console.log(`[API OK ${status}] ${url}`);
            }
        }
    });

    try {
        await page.goto('http://10.50.240.43:5173/login', { waitUntil: 'networkidle2' });
        
        console.log('Waiting for domain buttons...');
        await page.waitForFunction(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.some(b => b.innerText && b.innerText.toLowerCase().includes('faculty'));
        }, { timeout: 15000 });

        // Click faculty portal
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const facultyBtn = btns.find(b => b.innerText && b.innerText.toLowerCase().includes('faculty'));
            if (facultyBtn) facultyBtn.click();
        });

        console.log('Waiting for login form...');
        await page.waitForSelector('#login-identifier', { timeout: 10000 });
        await page.type('#login-identifier', 'faculty_1@edusphere.edu');
        await page.type('#login-password', 'demo123');

        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) await submitBtn.click();

        await page.waitForFunction(() => window.location.pathname.includes('/faculty/'), { timeout: 15000 });
        console.log('Logged in! Current URL:', page.url());

        await new Promise(r => setTimeout(r, 4000));

        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log('Body snippet:\n', bodyText.slice(0, 500));

        await page.screenshot({ path: 'diagnostic_dashboard.png', fullPage: true });
        console.log('Screenshot saved to diagnostic_dashboard.png');

    } catch (err) {
        console.error('Error during diagnosis:', err);
    } finally {
        await browser.close();
    }
})();
