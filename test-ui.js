import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const ROLES = [
  { domain: 'student', username: 'john_doe' },
  { domain: 'faculty', username: 'sarah_j' },
  { domain: 'admin', username: 'sys_admin' },
  { domain: 'management', username: 'dean_academic' }
];
const PASSWORD = 'demo123';

const bugInventory = [];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCrawler() {
  console.log("Starting Puppeteer Crawler...");
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  
  // Listen for console events
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const text = msg.text();
      if (text.includes('React Router') || text.includes('HMR') || text.includes('WebSocket')) return; // ignore dev noise
      bugInventory.push({ type: 'CONSOLE_' + msg.type().toUpperCase(), url: page.url(), message: text });
    }
  });

  // Listen for page errors (unhandled exceptions)
  page.on('pageerror', err => {
    bugInventory.push({ type: 'UNHANDLED_EXCEPTION', url: page.url(), message: err.message });
  });

  // Listen for failed network requests
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('.js') && !url.includes('.css') && !url.includes('.woff') && !url.includes('.png')) {
      bugInventory.push({ type: 'NETWORK_ERROR', url, status, pageUrl: page.url() });
    }
  });

  for (const role of ROLES) {
    console.log(`Testing role: ${role.domain}`);
    try {
      // Clear localStorage
      await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      // Wait for React to render
      await page.waitForTimeout(2000); // allow initial React render
      await page.waitForSelector('.login-right', { visible: true, timeout: 60000 });
      await page.waitForTimeout(500); // ensure layout stable
      // Log number of button candidates
      let cardCount = await page.$$eval('.login-right button', els => els.length);
      console.log('DEBUG: .login-right button count', cardCount);
      let cards = await page.$$('.login-right button');
      if (cards.length === 0) {
        cards = await page.$$('button');
        console.log('DEBUG: fallback button count', cards.length);
      }
      let clicked = false; // ensure we click a domain card
      for (const card of cards) {
        const text = await page.evaluate(el => el.textContent, card);
        if (text.toLowerCase().includes(role.domain)) {
          await card.click();
          await page.waitForTimeout(500); // allow DomainLogin component to render
          // Wait for the login form fields to appear before proceeding
          await page.waitForSelector('input[type="text"]', { visible: true, timeout: 30000 });
          clicked = true;
          break;
        }
      }
      if (!clicked) throw new Error(`Could not find domain card for ${role.domain}`);
      
      // Fill login form
      await page.waitForSelector('input[type="text"]');
      await page.type('input[type="text"]', role.username);
      await page.type('input[type="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await delay(2000); // Give React time to render sidebar
      
      // Get all sidebar links
      const links = await page.$$eval('.sidebar-nav a', els => els.map(a => a.href));
      console.log(`Found ${links.length} nav links for ${role.domain}`);
      
      for (const href of links) {
        if (!href) continue;
        console.log(`  Visiting ${href}`);
        await page.goto(href, { waitUntil: 'networkidle2' });
        await delay(2000); // Wait for API calls to settle and UI to render
        
        // Basic check for empty state bugs
        const html = await page.content();
        if (html.includes('NaN') || html.includes('undefined') || html.includes('Invalid Date')) {
           bugInventory.push({ type: 'RENDER_ERROR', url: href, message: 'Found NaN, undefined, or Invalid Date in HTML text' });
        }
      }
      
    } catch (e) {
      console.error(`Error during ${role.domain} testing: ${e.message}`);
      bugInventory.push({ type: 'CRAWLER_ERROR', role: role.domain, message: e.message });
    }
  }

  await browser.close();
  
  fs.writeFileSync('bug_inventory.json', JSON.stringify(bugInventory, null, 2));
  console.log("Crawl complete. Report written to bug_inventory.json");
}

runCrawler().catch(console.error);
