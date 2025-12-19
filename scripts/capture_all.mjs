import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = './screenshots';
const DEV_SERVER_URL = 'http://localhost:5173';
const WAIT_TIME = 2000; // Wait for animations

async function captureAll() {
    // Create screenshots directory
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
                setTimeout(resolve, 3000); // Give it time to fully boot
            }
        });
    });

    console.log('Launching browser...');
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2 // High DPI screenshots
    });
    const page = await context.newPage();

    const capture = async (name, url = DEV_SERVER_URL) => {
        try {
            console.log(`Capturing: ${name} (${url})`);
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.waitForTimeout(WAIT_TIME);

            // Ensure fonts are loaded and animations settled
            await page.waitForLoadState('domcontentloaded');

            await page.screenshot({
                path: join(SCREENSHOT_DIR, `${name}.png`),
                fullPage: true
            });
        } catch (e) {
            console.error(`Failed to capture ${name}:`, e.message);
        }
    };

    const clickAndCapture = async (selector, name) => {
        try {
            console.log(`Interacting: ${name}`);

            // Use more specific selector if possible, or first()
            const locator = page.locator(selector).first();
            await locator.waitFor({ state: 'visible', timeout: 5000 });
            await locator.click({ timeout: 5000 });

            await page.waitForTimeout(1000);
            await page.screenshot({ path: join(SCREENSHOT_DIR, `${name}.png`) });

            // Close modal - try multiple selectors for close button
            const closeBtn = page.locator('button:has(svg.lucide-x), button:has-text("X")').first();
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
                await page.waitForTimeout(500);
            } else {
                // Fallback: click outside (top left corner)
                await page.mouse.click(10, 10);
                await page.waitForTimeout(500);
            }
        } catch (e) {
            console.error(`Failed to interact/capture ${name}:`, e.message);
            // Try to recover by reloading dashboard
            await page.goto(`${DEV_SERVER_URL}?screen=app`, { waitUntil: 'networkidle' });
        }
    };

    try {
        // === ONBOARDING FLOW ===
        console.log('\\n=== Capturing Onboarding Flow ===');

        // 1. Onboarding Step 1: Problem Identification
        await capture('01_onboarding_step1', `${DEV_SERVER_URL}?screen=onboarding`);

        // Click Continue to go to step 2 (need to select at least one challenge)
        await page.click('button:has-text("Maintaining consistency")');
        await page.waitForTimeout(500);
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(1500);

        // 2. Onboarding Step 2: Social Proof
        await page.screenshot({ path: join(SCREENSHOT_DIR, '02_onboarding_step2.png'), fullPage: true });

        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(1500);

        // 3. Onboarding Step 3: Value Proposition
        await page.screenshot({ path: join(SCREENSHOT_DIR, '03_onboarding_step3.png'), fullPage: true });

        // 4. Paywall Screen
        await capture('04_paywall', `${DEV_SERVER_URL}?screen=paywall`);

        // 5. Sign Up Screen
        await capture('05_signup', `${DEV_SERVER_URL}?screen=signup`);

        // === MAIN APP ===
        console.log('\\n=== Capturing Main App ===');

        // 6. Main Dashboard
        await capture('06_dashboard', `${DEV_SERVER_URL}?screen=app`);

        // 7. Open Widgets
        await clickAndCapture('text=Today', '07_widget_today');
        await clickAndCapture('text=Lifetime', '08_widget_lifetime');
        await clickAndCapture('text=Activity History', '09_widget_activity');
        await clickAndCapture('text=Notes History', '10_widget_notes');

        // Settings button might need specific selector
        await clickAndCapture('button[aria-label="Settings"]', '11_settings');

        // === STREAK POPUPS ===
        console.log('\\n=== Capturing Streak Popups ===');

        // 8. Streak Milestones (using debug params)
        const milestones = [7, 30, 90, 180, 365];
        for (const days of milestones) {
            await capture(`12_streak_${days}days`, `${DEV_SERVER_URL}?screen=app&debug_streak=${days}`);
        }

        // 9. New Best Streak
        await capture('13_streak_new_best', `${DEV_SERVER_URL}?screen=app&debug_streak=100&debug_new_best=true`);

        console.log('\\n=== Screenshot capture complete! ===');

    } catch (error) {
        console.error('Critical error during capture sequence:', error);
    } finally {
        await browser.close();
        devServer.kill();
        process.exit(0);
    }
}

captureAll();
