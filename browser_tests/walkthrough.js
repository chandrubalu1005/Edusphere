const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\83ee4c32-a044-482f-bff1-82fe5f50765e';
const BASE_URL = 'http://10.130.18.187:5173';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
    const filePath = path.join(ARTIFACT_DIR, `${name}_${Date.now()}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`[SCREENSHOT] Saved ${name} to ${filePath}`);
    return filePath;
}

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();
    
    try {
        console.log('Navigating to login...');
        page.on('console', msg => console.log('PAGE LOG:', msg.text())); await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
        
        // Wait for login or domain selection
        await delay(3000);
        const bodyText = await page.evaluate(() => document.body.innerText);
        if (bodyText.includes('Select Portal')) {
            console.log('Selecting Faculty domain...');
            // Click the faculty portal option
            const buttons = await page.$$('button');
            for (let btn of buttons) {
                const text = await page.evaluate(el => el.innerText, btn);
                if (text.includes('Faculty Portal')) {
                    await btn.click();
                    break;
                }
            }
            await delay(2000);
        }
        
        console.log('Entering credentials...');
        const html = await page.evaluate(() => document.body.innerHTML); fs.writeFileSync('login_failed.html', html); await page.waitForSelector('input', {timeout: 10000});
        await page.type('input[type="text"], input[type="email"], input[name="identifier"]', 'faculty_1@edusphere.edu');
        await page.type('input[type="password"]', 'demo123');
        await delay(1000);
        
        // Find and click the submit button
        const buttons = await page.$$('button');
        for (let btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login')) {
                await btn.click();
                break;
            }
        }
        
        console.log('Waiting for login to complete...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        await delay(5000); // Wait for data to load
        
        const currentUrl = page.url();
        console.log(`Currently at: ${currentUrl}`);
        
        // Take Dashboard Screenshot
        await takeScreenshot(page, 'faculty_dashboard');
        
        // Navigate to Courses
        console.log('Navigating to Courses...');
        page.on('console', msg => console.log('PAGE LOG:', msg.text())); await page.goto(`${BASE_URL}/faculty/courses`, { waitUntil: 'networkidle2' });
        await delay(3000);
        await takeScreenshot(page, 'faculty_courses');
        
        // Navigate to Assignments
        console.log('Navigating to Assignments...');
        page.on('console', msg => console.log('PAGE LOG:', msg.text())); await page.goto(`${BASE_URL}/faculty/assignments`, { waitUntil: 'networkidle2' });
        await delay(3000);
        await takeScreenshot(page, 'faculty_assignments');
        
        // Navigate to Attendance
        console.log('Navigating to Attendance...');
        page.on('console', msg => console.log('PAGE LOG:', msg.text())); await page.goto(`${BASE_URL}/faculty/attendance`, { waitUntil: 'networkidle2' });
        await delay(3000);
        await takeScreenshot(page, 'faculty_attendance');
        
        // Navigate to Leave
        console.log('Navigating to Leave Management...');
        page.on('console', msg => console.log('PAGE LOG:', msg.text())); await page.goto(`${BASE_URL}/faculty/leave`, { waitUntil: 'networkidle2' });
        await delay(3000);
        await takeScreenshot(page, 'faculty_leave');
        
        // Attempt an interaction: Approve Leave
        console.log('Testing Leave Approval workflow...');
        const buttonsLeave = await page.$$('button');
        let approveClicked = false;
        for (let btn of buttonsLeave) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.toLowerCase().includes('approve')) {
                await btn.click();
                approveClicked = true;
                console.log('Clicked Approve on a leave request');
                break;
            }
        }
        if (approveClicked) {
            await delay(3000);
            await takeScreenshot(page, 'faculty_leave_approved');
        } else {
            console.log('No Approve button found (maybe no pending leaves?)');
        }
        
        // Navigate to Timetable
        console.log('Navigating to Timetable...');
        page.on('console', msg => console.log('PAGE LOG:', msg.text())); await page.goto(`${BASE_URL}/faculty/timetable`, { waitUntil: 'networkidle2' });
        await delay(3000);
        await takeScreenshot(page, 'faculty_timetable');
        
        // Navigate to Profile
        console.log('Navigating to Profile...');
        page.on('console', msg => console.log('PAGE LOG:', msg.text())); await page.goto(`${BASE_URL}/faculty/profile`, { waitUntil: 'networkidle2' });
        await delay(3000);
        await takeScreenshot(page, 'faculty_profile');
        
        console.log('Walkthrough completed successfully.');
    } catch (err) {
        console.error('Error during walkthrough:', err);
    } finally {
        await browser.close();
    }
})();
