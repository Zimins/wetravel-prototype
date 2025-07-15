const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Step 1: Add 4 people
    const people = ['지민', '윤정', '지수', '현수'];
    
    for (const person of people) {
      console.log(`Adding person: ${person}`);
      await page.fill('input[placeholder="이름 입력"]', person);
      await page.keyboard.press('Enter'); // Try Enter instead of clicking button
      await page.waitForTimeout(300);
    }

    console.log('All people added. Taking screenshot...');
    await page.screenshot({ path: 'test-people-added.png', fullPage: true });

    // Wait for expense form to appear
    await page.waitForTimeout(1000);

    // Step 2: Add first expense
    console.log('Adding expense: 점심');
    await page.type('input[placeholder*="지출 내용"]', '점심');
    await page.type('input[placeholder*="금액"]', '1000');
    
    // Select payer
    await page.selectOption('select', '지민');
    
    // Uncheck all and check only 지민
    const checkboxes = await page.$$('input[type="checkbox"]');
    for (const cb of checkboxes) {
      await cb.uncheck();
    }
    await page.check('text=지민');
    
    // Submit expense
    await page.click('text=지출 추가');
    await page.waitForTimeout(500);

    // Step 3: Add second expense
    console.log('Adding expense: 영화');
    await page.fill('input[placeholder*="지출 내용"]', '영화');
    await page.fill('input[placeholder*="금액"]', '8000');
    await page.selectOption('select', '윤정');
    
    // Check all people
    for (const person of people) {
      await page.check(`text=${person}`);
    }
    
    await page.click('text=지출 추가');
    await page.waitForTimeout(500);

    // Step 4: Add third expense
    console.log('Adding expense: 스키장');
    await page.fill('input[placeholder*="지출 내용"]', '스키장');
    await page.fill('input[placeholder*="금액"]', '60000');
    await page.selectOption('select', '현수');
    
    // All should still be checked
    await page.click('text=지출 추가');
    await page.waitForTimeout(1000);

    // Final screenshots
    console.log('Taking final screenshots...');
    await page.screenshot({ path: 'settlement-results.png', fullPage: true });
    
    console.log('Test completed successfully!');
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();