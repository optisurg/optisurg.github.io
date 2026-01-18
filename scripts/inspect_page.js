const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const screenshotsDir = path.join(__dirname, '..', 'site_screenshots');
    if (!fs.existsSync(screenshotsDir)){
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    console.log('Taking screenshot...');
    await page.screenshot({ path: path.join(screenshotsDir, 'current_view.png') });

    console.log('Capturing page content...');
    const content = await page.content();
    fs.writeFileSync(path.join(screenshotsDir, 'page_content.html'), content);
    
    const textContent = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync(path.join(screenshotsDir, 'page_content.txt'), textContent);

    console.log('Done. Check site_screenshots/ for output.');
  } catch (error) {
    console.error('Error viewing page:', error);
  } finally {
    await browser.close();
  }
})();
