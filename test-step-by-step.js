const { chromium } = require('playwright');

async function testSettlement() {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✓ Page loaded');
    
    // Add people
    const people = ['지민', '윤정', '지수', '현수'];
    for (let i = 0; i < people.length; i++) {
      await page.fill('input[placeholder="이름 입력"]', people[i]);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      console.log(`✓ Added ${people[i]}`);
    }
    
    await page.screenshot({ path: 'step1-people-added.png' });
    console.log('✓ Screenshot: People added');
    
    // Wait for expense form
    await page.waitForTimeout(1000);
    
    // Expense 1: 점심
    await page.fill('input[placeholder*="지출 내용"]', '점심');
    await page.fill('input[placeholder*="금액"]', '1000');
    await page.selectOption('select', '지민');
    
    // Uncheck all and check only 지민
    const checkboxes = await page.$$('input[type="checkbox"]');
    for (const cb of checkboxes) {
      await cb.evaluate(el => el.checked = false);
    }
    await page.check('label:has-text("지민") input[type="checkbox"]');
    
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(500);
    console.log('✓ Added expense: 점심');
    
    await page.screenshot({ path: 'step2-first-expense.png' });
    
    // Expense 2: 영화
    await page.fill('input[placeholder*="지출 내용"]', '영화');
    await page.fill('input[placeholder*="금액"]', '8000');
    await page.selectOption('select', '윤정');
    
    // Check all people
    for (const person of people) {
      await page.check(`label:has-text("${person}") input[type="checkbox"]`);
    }
    
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(500);
    console.log('✓ Added expense: 영화');
    
    await page.screenshot({ path: 'step3-second-expense.png' });
    
    // Expense 3: 스키장
    await page.fill('input[placeholder*="지출 내용"]', '스키장');
    await page.fill('input[placeholder*="금액"]', '60000');
    await page.selectOption('select', '현수');
    
    await page.click('button:has-text("지출 추가")');
    await page.waitForTimeout(1000);
    console.log('✓ Added expense: 스키장');
    
    // Scroll to settlement results
    await page.evaluate(() => {
      const section = document.querySelector('h2:has-text("정산 결과")');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    
    // Final screenshots
    await page.screenshot({ path: 'step4-final-settlement.png', fullPage: true });
    console.log('✓ Final screenshot saved');
    
    // Keep open briefly
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
    console.log('✓ Test completed');
  }
}

testSettlement().catch(console.error);