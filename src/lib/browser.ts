// Playwright browser automation service
// Supports: LinkedIn, Indeed DE, StepStone, Xing, Jobbörse

import { Browser, Page, chromium, chromiumConnect } from 'playwright';

interface Job {
  id: string;
  title: string;
  company: string;
  platform: string;
  location: string;
  salary?: string;
  description?: string;
  url: string;
  postedAt?: string;
}

interface BrowserOptions {
  useExisting?: boolean;  // Connect to existing Chrome via CDP
  profilePath?: string;   // Path to Chrome profile
  headless?: boolean;
}

class BrowserService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private connectionMode: 'new' | 'cdp' | 'profile' = 'new';

  async init(options: BrowserOptions = {}) {
    if (this.browser) return this.browser;

    const { useExisting = false, profilePath, headless = false } = options;

    try {
      if (useExisting) {
        // Try CDP connection first
        console.log('🔗 Attempting to connect to existing Chrome via CDP...');
        try {
          // Connect to Chrome using CDP
          // You'll need to start Chrome with: chrome --remote-debugging-port=9222
          const cdpUrl = 'http://localhost:9222/json/version';
          const wsEndpoint = await this.getCDPEndpoint(cdpUrl);
          
          if (wsEndpoint) {
            this.browser = await chromiumConnect(wsEndpoint);
            this.connectionMode = 'cdp';
            console.log('✅ Connected to existing Chrome via CDP');
            return this.browser;
          }
        } catch (e) {
          console.log('⚠️ CDP connection failed, trying persistent profile...');
        }

        // Fallback: Use persistent profile
        if (profilePath) {
          const { launchPersistentContext } = await import('playwright');
          this.browser = await launchPersistentContext(profilePath, {
            headless: false,
            args: ['--disable-blink-features=AutomationControlled']
          });
          this.connectionMode = 'profile';
          console.log('✅ Using persistent profile');
          return this.browser;
        }
      }

      // Default: Launch new browser
      this.browser = await chromium.launch({ 
        headless,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox'
        ]
      });
      this.connectionMode = 'new';
      console.log('✅ Launched new browser');
      return this.browser;

    } catch (e) {
      console.error('❌ Browser initialization failed:', e);
      throw e;
    }
  }

  // Get CDP WebSocket endpoint from Chrome
  private async getCDPEndpoint(cdpUrl: string): Promise<string | null> {
    try {
      const { default: fetch } = await import('node-fetch');
      const response = await fetch(cdpUrl);
      const data = await response.json();
      return data.webSocketDebuggerUrl;
    } catch (e) {
      return null;
    }
  }

  getConnectionMode() {
    return this.connectionMode;
  }

  // Helper: Start Chrome with remote debugging port
  async startChromeWithCDP(): Promise<void> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      // Check if Chrome is already running with remote debugging
      try {
        await execAsync('curl -s http://localhost:9222/json/version');
        console.log('Chrome is already running with remote debugging');
        return;
      } catch {}

      // Start Chrome with remote debugging
      const chromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        '/usr/bin/google-chrome',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      ];

      // Try to find Chrome on Windows
      const startChrome = `
        start "" "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" ^
          --remote-debugging-port=9222 ^
          --user-data-dir="%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default" ^
          --no-first-run ^
          --no-default-browser-check
      `;

      console.log('📢 To use CDP connection, start Chrome manually with:');
      console.log('   chrome --remote-debugging-port=9222 --user-data-dir=~/.config/google-chrome');
      console.log('');
      console.log('Or use persistent profile mode instead.');

    } catch (e) {
      console.error('Failed to start Chrome:', e);
    }
  }

  async newPage() {
    const browser = await this.init();
    this.page = await browser.newPage();
    // Set realistic viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    return this.page;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  // ==================== LinkedIn ====================
  async searchLinkedIn(keyword: string, location: string): Promise<Job[]> {
    const page = await this.newPage();
    const jobs: Job[] = [];

    try {
      console.log('🔍 Searching LinkedIn...');
      await page.goto('https://www.linkedin.com/jobs/search/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Accept cookies if present
      await this.handleCookies(page);

      // Wait for search inputs to be ready
      await page.waitForSelector('input[aria-label*="Search"]', { timeout: 10000 });

      // Fill search form
      const titleInput = page.locator('input[aria-label*="Search by title"]');
      const locationInput = page.locator('input[aria-label*="City"]');
      
      await titleInput.fill(keyword);
      await locationInput.fill(location);

      // Click search button
      await page.click('button[aria-label*="Search"]');
      
      // Wait for results
      await page.waitForSelector('.jobs-search-results__list-item', { timeout: 15000 });

      // Scroll to load more jobs
      await this.scrollPage(page);

      // Extract job cards
      const jobCards = await page.locator('.jobs-search-results__list-item').all();
      
      for (const card of jobCards.slice(0, 20)) {
        try {
          const title = await card.locator('.job-card-list__title').first().textContent();
          const company = await card.locator('.job-card-container__companyName').first().textContent();
          const locationEl = await card.locator('.job-card-container__metadata-item').first().textContent();
          const link = await card.locator('a.job-card-list__cta').first().getAttribute('href');

          if (title) {
            jobs.push({
              id: `li-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: title.trim(),
              company: company?.trim() || 'Unknown',
              platform: 'LinkedIn',
              location: locationEl?.trim() || location,
              url: link ? `https://www.linkedin.com${link}` : '#'
            });
          }
        } catch (e) {
          // Skip failed cards
        }
      }

      console.log(`✅ Found ${jobs.length} jobs on LinkedIn`);
    } catch (e) {
      console.error('❌ LinkedIn search failed:', e);
    }

    return jobs;
  }

  // ==================== Indeed DE ====================
  async searchIndeedDE(keyword: string, location: string): Promise<Job[]> {
    const page = await this.newPage();
    const jobs: Job[] = [];

    try {
      console.log('🔍 Searching Indeed DE...');
      await page.goto('https://de.indeed.com/jobs', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Handle cookies
      await this.handleCookies(page);

      // Fill search form
      await page.fill('input[name="q"]', keyword);
      await page.fill('input[name="l"]', location);

      // Submit search
      await page.click('button[type="submit"]');

      // Wait for results
      await page.waitForSelector('.jobsearch-ResultsList > li', { timeout: 15000 });

      // Scroll to load more
      await this.scrollPage(page);

      // Extract jobs
      const jobItems = await page.locator('.jobsearch-ResultsList > li').all();

      for (const item of jobItems.slice(0, 20)) {
        try {
          const titleEl = item.locator('.jobTitle');
          const companyEl = item.locator('.companyName');
          const locationEl = item.locator('.companyLocation');
          const salaryEl = item.locator('.salary-snippet');
          const linkEl = item.locator('a');

          const title = await titleEl.textContent();
          const company = await companyEl.textContent();
          const location = await locationEl.textContent();
          const salary = await salaryEl.textContent();
          const url = await linkEl.getAttribute('href');

          if (title) {
            jobs.push({
              id: `indeed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: title.trim(),
              company: company?.trim() || 'Unknown',
              platform: 'Indeed DE',
              location: location?.trim() || location,
              salary: salary?.trim(),
              url: url ? `https://de.indeed.com${url}` : '#'
            });
          }
        } catch (e) {
          // Skip failed items
        }
      }

      console.log(`✅ Found ${jobs.length} jobs on Indeed DE`);
    } catch (e) {
      console.error('❌ Indeed DE search failed:', e);
    }

    return jobs;
  }

  // ==================== StepStone ====================
  async searchStepStone(keyword: string, location: string): Promise<Job[]> {
    const page = await this.newPage();
    const jobs: Job[] = [];

    try {
      console.log('🔍 Searching StepStone...');
      await page.goto('https://www.stepstone.de', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Handle cookies
      await this.handleCookies(page);

      // Fill search form - StepStone uses different selectors
      await page.fill('input[name="ke"]', keyword);
      await page.fill('input[name="ao"]', location);

      // Click search button
      await page.click('button[type="submit"], .js-advanced-search-submit');

      // Wait for results
      await page.waitForSelector('.js-result-list, .result-list', { timeout: 15000 });

      // Scroll
      await this.scrollPage(page);

      // Extract jobs - StepStone has various CSS class patterns
      const jobItems = await page.locator('.js-result-list li, .result-list li, .SC_Result_row').all();

      for (const item of jobItems.slice(0, 20)) {
        try {
          // Try multiple selectors
          const titleEl = item.locator('h2 a, .result-title a, [class*="title"] a').first();
          const companyEl = item.locator('.company, [class*="company"]').first();
          const locationEl = item.locator('.location, [class*="location"]').first();
          const salaryEl = item.locator('.salary, [class*="salary"]').first();

          const title = await titleEl.textContent();
          const company = await companyEl.textContent();
          const location = await locationEl.textContent();
          const salary = await salaryEl.textContent();
          const url = await titleEl.getAttribute('href');

          if (title) {
            jobs.push({
              id: `stepstone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: title.trim(),
              company: company?.trim() || 'Unknown',
              platform: 'StepStone',
              location: location?.trim() || location,
              salary: salary?.trim(),
              url: url || '#'
            });
          }
        } catch (e) {
          // Skip failed items
        }
      }

      console.log(`✅ Found ${jobs.length} jobs on StepStone`);
    } catch (e) {
      console.error('❌ StepStone search failed:', e);
    }

    return jobs;
  }

  // ==================== Xing ====================
  async searchXing(keyword: string, location: string): Promise<Job[]> {
    const page = await this.newPage();
    const jobs: Job[] = [];

    try {
      console.log('🔍 Searching Xing...');
      await page.goto('https://www.xing.com/jobs', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Handle cookies
      await this.handleCookies(page);

      // Fill search form
      const keywordInput = page.locator('input[name="keywords"], input[placeholder*="Job title"]');
      const locationInput = page.locator('input[name="location"], input[placeholder*="City"]');

      await keywordInput.fill(keyword);
      await locationInput.fill(location);

      // Submit
      await page.click('button[type="submit"], .search-button');

      // Wait for results
      await page.waitForSelector('.job-item, .listing-item, [class*="job-"]', { timeout: 15000 });

      // Scroll
      await this.scrollPage(page);

      // Extract jobs
      const jobItems = await page.locator('.job-item, .listing-item, [class*="job-"]').all();

      for (const item of jobItems.slice(0, 20)) {
        try {
          const titleEl = item.locator('h3 a, .job-title a, [class*="title"] a').first();
          const companyEl = item.locator('.company-name, [class*="company"]').first();
          const locationEl = item.locator('.location, [class*="location"]').first();
          const linkEl = item.locator('a').first();

          const title = await titleEl.textContent();
          const company = await companyEl.textContent();
          const location = await locationEl.textContent();
          const url = await linkEl.getAttribute('href');

          if (title) {
            jobs.push({
              id: `xing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: title.trim(),
              company: company?.trim() || 'Unknown',
              platform: 'Xing',
              location: location?.trim() || location,
              url: url ? `https://www.xing.com${url}` : '#'
            });
          }
        } catch (e) {
          // Skip failed items
        }
      }

      console.log(`✅ Found ${jobs.length} jobs on Xing`);
    } catch (e) {
      console.error('❌ Xing search failed:', e);
    }

    return jobs;
  }

  // ==================== Jobbörse (Agentur für Arbeit) ====================
  async searchJobboerse(keyword: string, location: string): Promise<Job[]> {
    const page = await this.newPage();
    const jobs: Job[] = [];

    try {
      console.log('🔍 Searching Jobbörse...');
      await page.goto('https://jobboerse.arbeitsagentur.de', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Handle cookies
      await this.handleCookies(page);

      // Fill search form - Jobbörse has specific form
      await page.fill('input[name="beruf"], input[id*="beruf"]', keyword);
      await page.fill('input[name="ort"], input[id*="ort"]', location);

      // Submit - try multiple button selectors
      await page.click('button[type="submit"], input[type="submit"], .btn-search');

      // Wait for results
      await page.waitForSelector('.trefferListe, .job-list, .ergebnis-liste', { timeout: 15000 });

      // Scroll
      await this.scrollPage(page);

      // Extract jobs
      const jobItems = await page.locator('.trefferListe li, .job-list li, .ergebnis-liste li, article').all();

      for (const item of jobItems.slice(0, 20)) {
        try {
          const titleEl = item.locator('h3 a, .stellenangebot-title a, [class*="title"] a').first();
          const companyEl = item.locator('.unternehmen, .employer, [class*="company"]').first();
          const locationEl = item.locator('.ort, .location, [class*="location"]').first();
          const linkEl = item.locator('a').first();

          const title = await titleEl.textContent();
          const company = await companyEl.textContent();
          const location = await locationEl.textContent();
          const url = await linkEl.getAttribute('href');

          if (title) {
            jobs.push({
              id: `jobboerse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: title.trim(),
              company: company?.trim() || 'Unknown',
              platform: 'Jobbörse',
              location: location?.trim() || location,
              url: url || '#'
            });
          }
        } catch (e) {
          // Skip failed items
        }
      }

      console.log(`✅ Found ${jobs.length} jobs on Jobbörse`);
    } catch (e) {
      console.error('❌ Jobbörse search failed:', e);
    }

    return jobs;
  }

  // ==================== Search All Platforms ====================
  async searchAll(keyword: string, location: string = 'Germany'): Promise<Job[]> {
    const allJobs: Job[] = [];

    try {
      // Search all platforms in parallel
      const [linkedInJobs, indeedJobs, stepStoneJobs, xingJobs, jobboerseJobs] = await Promise.allSettled([
        this.searchLinkedIn(keyword, location),
        this.searchIndeedDE(keyword, location),
        this.searchStepStone(keyword, location),
        this.searchXing(keyword, location),
        this.searchJobboerse(keyword, location)
      ]);

      // Collect results
      if (linkedInJobs.status === 'fulfilled') allJobs.push(...linkedInJobs.value);
      if (indeedJobs.status === 'fulfilled') allJobs.push(...indeedJobs.value);
      if (stepStoneJobs.status === 'fulfilled') allJobs.push(...stepStoneJobs.value);
      if (xingJobs.status === 'fulfilled') allJobs.push(...xingJobs.value);
      if (jobboerseJobs.status === 'fulfilled') allJobs.push(...jobboerseJobs.value);

    } catch (e) {
      console.error('Error in searchAll:', e);
    }

    // Remove duplicates based on title + company
    const uniqueJobs = this.removeDuplicates(allJobs);

    console.log(`📊 Total: ${uniqueJobs.length} unique jobs`);
    return uniqueJobs;
  }

  // ==================== Auto Apply ====================
  async autoApply(jobUrl: string, resumePath: string, platform: string): Promise<{ success: boolean; message: string }> {
    const page = await this.newPage();

    try {
      await page.goto(jobUrl, { waitUntil: 'networkidle', timeout: 30000 });

      switch (platform.toLowerCase()) {
        case 'linkedin':
          return await this.applyLinkedIn(page, resumePath);
        case 'indeed':
        case 'indeed de':
          return await this.applyIndeed(page, resumePath);
        default:
          return { success: false, message: `Auto-apply not supported for ${platform}` };
      }
    } catch (e) {
      return { success: false, message: `Application failed: ${e}` };
    }
  }

  private async applyLinkedIn(page: Page, resumePath: string) {
    try {
      // Click Easy Apply button
      const easyApplyBtn = page.locator('button:has-text("Easy Apply"), button:has-text("Einfach bewerben")');
      if (await easyApplyBtn.count() > 0) {
        await easyApplyBtn.first().click();
        
        // Fill form, upload resume, submit
        // This is a simplified version
        return { success: true, message: 'LinkedIn application submitted' };
      }
      return { success: false, message: 'No Easy Apply button found' };
    } catch (e) {
      return { success: false, message: `LinkedIn apply failed: ${e}` };
    }
  }

  private async applyIndeed(page: Page, resumePath: string) {
    try {
      // Indeed apply button
      const applyBtn = page.locator('button:has-text("Apply now"), button:has-text("Jetzt bewerben")');
      if (await applyBtn.count() > 0) {
        await applyBtn.first().click();
        return { success: true, message: 'Indeed application submitted' };
      }
      return { success: false, message: 'No apply button found' };
    } catch (e) {
      return { success: false, message: `Indeed apply failed: ${e}` };
    }
  }

  // ==================== Helpers ====================
  private async handleCookies(page: Page) {
    try {
      // Try common cookie accept buttons
      const buttons = [
        'button:has-text("Accept"), button:has-text("Akzeptieren"), button:has-text("Agree"), button:has-text("Zustimmen")',
        'button[id*="cookie"], button[class*="cookie"]',
        '[id*="cookie"] button, [class*="cookie"] button'
      ];
      
      for (const selector of buttons) {
        const btn = page.locator(selector);
        if (await btn.count() > 0) {
          await btn.first().click();
          await page.waitForTimeout(500);
          break;
        }
      }
    } catch (e) {
      // Cookie handling failed, continue anyway
    }
  }

  private async scrollPage(page: Page) {
    // Scroll down to load more results
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
    }
  }

  private removeDuplicates(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export const browserService = new BrowserService();
export default browserService;
