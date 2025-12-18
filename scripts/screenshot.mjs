import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = './screenshots';
const DEV_SERVER_URL = 'http://localhost:5173';
const WAIT_TIME = 3000; // Wait 3 seconds for app to render

async function takeScreenshot() {
  // Create screenshots directory if it doesn't exist
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  // Start the dev server
  console.log('Starting dev server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });

  // Wait for server to be ready
  await new Promise((resolve) => {
    devServer.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('localhost')) {
        console.log('Dev server is ready!');
        setTimeout(resolve, 2000); // Give it 2 more seconds to stabilize
      }
    });
  });

  // Launch browser and take screenshot
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  console.log(`Navigating to ${DEV_SERVER_URL}...`);
  await page.goto(DEV_SERVER_URL, { waitUntil: 'networkidle' });

  // Wait a bit for animations/dynamic content
  await page.waitForTimeout(WAIT_TIME);

  // Generate timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('Z')[0];
  const screenshotPath = join(SCREENSHOT_DIR, `screenshot_${timestamp}.png`);

  console.log(`Taking screenshot...`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  console.log(`Screenshot saved to: ${screenshotPath}`);

  // Cleanup
  await browser.close();
  devServer.kill();

  // Wait a moment for the server to fully shut down
  await new Promise(resolve => setTimeout(resolve, 1000));

  process.exit(0);
}

takeScreenshot().catch((error) => {
  console.error('Error taking screenshot:', error);
  process.exit(1);
});
