const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down operations to see what's happening
  });
  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Step 1: Add people manually by typing and pressing Enter
    console.log('Adding people...');
    const peopleInput = page.locator('input[placeholder="이름 입력"]');
    
    // Add 지민
    await peopleInput.fill('지민');
    await peopleInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Add 윤정
    await peopleInput.fill('윤정');
    await peopleInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Add 지수
    await peopleInput.fill('지수');
    await peopleInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Add 현수
    await peopleInput.fill('현수');
    await peopleInput.press('Enter');
    await page.waitForTimeout(1000);

    console.log('People added. Now adding expenses...');

    // The expense form should now be visible
    // Step 2: Add first expense
    await page.fill('input[placeholder*="지출 내용"]', '점심');
    await page.fill('input[placeholder*="금액"]', '1000');
    
    // Select payer
    await page.locator('select').selectOption('지민');
    
    // Uncheck all checkboxes first
    await page.evaluate(() => {
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
    
    // Check only 지민
    await page.locator('label:has-text("지민") input[type="checkbox"]').check();
    
    // Click add expense
    await page.locator('button:has-text("지출 추가")').click();
    await page.waitForTimeout(1000);

    // Step 3: Add second expense
    await page.fill('input[placeholder*="지출 내용"]', '영화');
    await page.fill('input[placeholder*="금액"]', '8000');
    await page.locator('select').selectOption('윤정');
    
    // Check all people
    await page.locator('label:has-text("지민") input[type="checkbox"]').check();
    await page.locator('label:has-text("윤정") input[type="checkbox"]').check();
    await page.locator('label:has-text("지수") input[type="checkbox"]').check();
    await page.locator('label:has-text("현수") input[type="checkbox"]').check();
    
    await page.locator('button:has-text("지출 추가")').click();
    await page.waitForTimeout(1000);

    // Step 4: Add third expense
    await page.fill('input[placeholder*="지출 내용"]', '스키장');
    await page.fill('input[placeholder*="금액"]', '60000');
    await page.locator('select').selectOption('현수');
    
    // All should still be checked
    await page.locator('button:has-text("지출 추가")').click();
    await page.waitForTimeout(2000);

    // Take final screenshot
    console.log('Taking final screenshot...');
    await page.screenshot({ 
      path: 'final-settlement-results.png',
      fullPage: true 
    });
    
    // Try to capture just the settlement section
    try {
      const settlementHeader = page.locator('h2:has-text("정산 결과")');
      await settlementHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      const settlementSection = page.locator('section:has(h2:has-text("정산 결과"))');
      await settlementSection.screenshot({ 
        path: 'final-settlement-section.png' 
      });
    } catch (e) {
      console.log('Could not capture settlement section separately');
    }

    console.log('Test completed! Check final-settlement-results.png');
    
    // Keep browser open to see results
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();