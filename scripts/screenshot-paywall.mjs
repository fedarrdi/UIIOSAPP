import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = './screenshots';
const SCREEN = process.argv[2] || 'splash'; // Default to splash screen
const DEV_SERVER_URL = `http://localhost:5173/?screen=${SCREEN}`;
const WAIT_TIME = 2000; // Wait 2 seconds for app to render

async function takeScreenshot() {
  // Create screenshots directory if it doesn't exist
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  // Launch browser and take screenshot
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 393, height: 852 } // Mobile viewport like the reference image
  });

  console.log(`Navigating to ${DEV_SERVER_URL}...`);
  await page.goto(DEV_SERVER_URL, { waitUntil: 'networkidle' });

  // Wait a bit for animations/dynamic content
  await page.waitForTimeout(WAIT_TIME);

  // Generate timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('Z')[0];
  const screenshotPath = join(SCREENSHOT_DIR, `${SCREEN}_${timestamp}.png`);

  console.log(`Taking screenshot...`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  console.log(`Screenshot saved to: ${screenshotPath}`);

  // Cleanup
  await browser.close();

  process.exit(0);
}

takeScreenshot().catch((error) => {
  console.error('Error taking screenshot:', error);
  process.exit(1);
});
