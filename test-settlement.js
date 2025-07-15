const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Navigate to localhost:3000 without URL parameters to clear data
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 2. Add 4 people: 지민, 윤정, 지수, 현수
    console.log('Adding people...');
    const peopleToAdd = ['지민', '윤정', '지수', '현수'];
    
    for (const person of peopleToAdd) {
      // Find the person input field (second input on the page)
      const inputs = await page.$$('input[type="text"]');
      await inputs[1].fill(person); // Second text input is for person name
      
      // Click the add person button (참가자 추가)
      await page.click('button:has-text("참가자 추가")');
      await page.waitForTimeout(500); // Small delay to ensure UI updates
    }

    // 3. Add expense "점심" for ₩1000, paid by 지민, only check 지민
    console.log('Adding expense "점심"...');
    
    // Find expense name input (third text input)
    const expenseInputs = await page.$$('input[type="text"]');
    await expenseInputs[2].fill('점심');
    
    // Find amount input
    await page.fill('input[type="number"]', '1000');
    
    // Select paid by 지민
    await page.selectOption('select', '지민');
    
    // Uncheck all checkboxes first
    const checkboxes = await page.$$('input[type="checkbox"]');
    for (const checkbox of checkboxes) {
      await checkbox.uncheck();
    }
    
    // Check only 지민 (first checkbox)
    await checkboxes[0].check();
    
    // Click add expense button
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(500);

    // 4. Add expense "영화" for ₩8000, paid by 윤정, check all 4 people
    console.log('Adding expense "영화"...');
    
    // Clear and fill expense name
    const expenseInputs2 = await page.$$('input[type="text"]');
    await expenseInputs2[2].fill('영화');
    
    // Fill amount
    await page.fill('input[type="number"]', '8000');
    
    // Select paid by 윤정
    await page.selectOption('select', '윤정');
    
    // Check all checkboxes
    const checkboxes2 = await page.$$('input[type="checkbox"]');
    for (const checkbox of checkboxes2) {
      await checkbox.check();
    }
    
    // Click add expense button
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(500);

    // 5. Add expense "스키장" for ₩60000, paid by 현수, check only 지민, 윤정, 지수 (NOT 현수)
    console.log('Adding expense "스키장"...');
    
    // Clear and fill expense name
    const expenseInputs3 = await page.$$('input[type="text"]');
    await expenseInputs3[2].fill('스키장');
    
    // Fill amount
    await page.fill('input[type="number"]', '60000');
    
    // Select paid by 현수
    await page.selectOption('select', '현수');
    
    // Uncheck all checkboxes first
    const checkboxes3 = await page.$$('input[type="checkbox"]');
    for (const checkbox of checkboxes3) {
      await checkbox.uncheck();
    }
    
    // Check only 지민 (0), 윤정 (1), 지수 (2) - NOT 현수 (3)
    await checkboxes3[0].check(); // 지민
    await checkboxes3[1].check(); // 윤정
    await checkboxes3[2].check(); // 지수
    
    // Click add expense button
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(1000);

    // 6. Take a screenshot of the settlement results
    console.log('Taking screenshot of settlement results...');
    
    // Scroll to the settlement section
    await page.evaluate(() => {
      const settlementSection = document.querySelector('h3:has-text("정산 결과")');
      if (settlementSection) {
        settlementSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    await page.waitForTimeout(1000); // Wait for scroll
    
    await page.screenshot({ 
      path: 'settlement-results.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved as settlement-results.png');
    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Error occurred:', error);
    // Take error screenshot
    await page.screenshot({ 
      path: 'error-screenshot.png',
      fullPage: true 
    });
  } finally {
    // Keep browser open for manual inspection
    console.log('Browser will remain open for inspection. Close manually when done.');
    // await browser.close();
  }
})();