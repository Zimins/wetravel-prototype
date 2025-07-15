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

    // Step 1: Add 4 people
    const people = ['지민', '윤정', '지수', '현수'];
    
    for (const person of people) {
      console.log(`Adding person: ${person}`);
      // Find the input field with placeholder "이름 입력"
      await page.fill('input[placeholder="이름 입력"]', person);
      // Click the "추가" button
      await page.click('button:has-text("추가")');
      await page.waitForTimeout(500); // Small delay to ensure UI updates
    }

    // Wait a bit to ensure all people are added
    await page.waitForTimeout(1000);

    // Step 2: Add expense "점심" for ₩1000, paid by 지민, only split among 지민
    console.log('Adding expense: 점심');
    
    // Find expense inputs - they should appear after people are added
    const expenseInputs = await page.locator('input').all();
    let expenseNameInput = null;
    let expenseAmountInput = null;
    
    for (const input of expenseInputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && placeholder.includes('지출 내용')) {
        expenseNameInput = input;
      } else if (placeholder && placeholder.includes('금액')) {
        expenseAmountInput = input;
      }
    }
    
    if (expenseNameInput && expenseAmountInput) {
      await expenseNameInput.fill('점심');
      await expenseAmountInput.fill('1000');
    }
    
    // Select payer (지민) - find select element
    const selectElements = await page.locator('select').all();
    if (selectElements.length > 0) {
      await selectElements[0].selectOption({ label: '지민' });
    }
    
    // Uncheck all people first, then check only 지민
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      await checkbox.uncheck();
    }
    
    // Find and check only 지민's checkbox
    const jiminCheckbox = await page.locator('label:has-text("지민") input[type="checkbox"]').first();
    await jiminCheckbox.check();
    
    // Click add expense button
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(500);

    // Step 3: Add expense "영화" for ₩8000, paid by 윤정, split among all 4 people
    console.log('Adding expense: 영화');
    
    if (expenseNameInput && expenseAmountInput) {
      await expenseNameInput.fill('영화');
      await expenseAmountInput.fill('8000');
    }
    
    // Select payer (윤정)
    if (selectElements.length > 0) {
      await selectElements[0].selectOption({ label: '윤정' });
    }
    
    // Check all people
    for (const person of people) {
      const checkbox = await page.locator(`label:has-text("${person}") input[type="checkbox"]`).first();
      await checkbox.check();
    }
    
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(500);

    // Step 4: Add expense "스키장" for ₩60000, paid by 현수, split among all 4 people
    console.log('Adding expense: 스키장');
    
    if (expenseNameInput && expenseAmountInput) {
      await expenseNameInput.fill('스키장');
      await expenseAmountInput.fill('60000');
    }
    
    // Select payer (현수)
    if (selectElements.length > 0) {
      await selectElements[0].selectOption({ label: '현수' });
    }
    
    // All people should already be checked, but let's ensure they are
    for (const person of people) {
      const checkbox = await page.locator(`label:has-text("${person}") input[type="checkbox"]`).first();
      await checkbox.check();
    }
    
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(1000);

    // Step 5: Take a screenshot of the final settlement results
    console.log('Taking screenshot of the final settlement results...');
    
    // Scroll to the settlement section
    await page.evaluate(() => {
      const settlementSection = document.querySelector('h2:has-text("정산 결과")');
      if (settlementSection) {
        settlementSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    await page.waitForTimeout(1000); // Wait for smooth scroll
    
    // Take a full page screenshot
    await page.screenshot({ 
      path: 'settlement-results.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved as settlement-results.png');
    
    // Also take a focused screenshot of just the settlement section
    try {
      const settlementSection = await page.locator('section:has(h2:has-text("정산 결과"))').first();
      await settlementSection.screenshot({ 
        path: 'settlement-section.png' 
      });
      console.log('Settlement section screenshot saved as settlement-section.png');
    } catch (e) {
      console.log('Could not capture settlement section separately');
    }

    // Keep browser open for a few seconds to see the results
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();