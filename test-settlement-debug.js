const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'debug-1-initial.png' });

    // Step 1: Add 4 people
    const people = ['지민', '윤정', '지수', '현수'];
    
    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      console.log(`Adding person: ${person}`);
      
      // Try different selectors for the input field
      try {
        // First try the Korean placeholder
        await page.fill('input[placeholder="이름"]', person);
      } catch (e) {
        console.log('Korean placeholder not found, trying English...');
        await page.fill('input[placeholder="Name"]', person);
      }
      
      // Try different selectors for the button
      try {
        await page.click('button:has-text("인원 추가")');
      } catch (e) {
        console.log('Korean button not found, trying to find add person button...');
        // Look for any button that might add a person
        await page.click('button:has-text("Add Person")');
      }
      
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `debug-2-person-${i+1}.png` });
    }

    console.log('All people added. Taking final screenshot...');
    await page.screenshot({ path: 'debug-final.png', fullPage: true });

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
  } finally {
    console.log('Test completed. Browser will close in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();