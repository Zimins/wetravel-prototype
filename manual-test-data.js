const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Create the state directly
  const testState = {
    people: [
      { id: '1', name: '지민' },
      { id: '2', name: '윤정' },
      { id: '3', name: '지수' },
      { id: '4', name: '현수' }
    ],
    expenses: [
      {
        id: 'exp1',
        name: '점심',
        amount: 1000,
        paidBy: '1', // 지민
        splitAmong: ['1'] // Only 지민
      },
      {
        id: 'exp2',
        name: '영화',
        amount: 8000,
        paidBy: '2', // 윤정
        splitAmong: ['1', '2', '3', '4'] // All 4 people
      },
      {
        id: 'exp3',
        name: '스키장',
        amount: 60000,
        paidBy: '4', // 현수
        splitAmong: ['1', '2', '3', '4'] // All 4 people
      }
    ],
    groupName: '우리 모임'
  };
  
  // Encode the state
  const stateString = JSON.stringify(testState);
  const encodedState = btoa(unescape(encodeURIComponent(stateString)));
  
  // Navigate with the state
  await page.goto(`http://localhost:3000?state=${encodedState}`);
  await page.waitForLoadState('networkidle');
  
  console.log('Loaded test data successfully');
  
  // Wait for everything to render
  await page.waitForTimeout(2000);
  
  // Take screenshot of the full page
  await page.screenshot({ 
    path: 'final-settlement-complete.png',
    fullPage: true 
  });
  
  // Scroll to settlement results
  await page.evaluate(() => {
    const element = Array.from(document.querySelectorAll('h2')).find(h2 => h2.textContent?.includes('정산 결과'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  
  await page.waitForTimeout(1000);
  
  // Take focused screenshot of settlement results
  const settlementSection = await page.locator('section:has(h2:has-text("정산 결과"))');
  if (await settlementSection.count() > 0) {
    await settlementSection.screenshot({ 
      path: 'settlement-results-final.png' 
    });
    console.log('Settlement section screenshot saved');
  }
  
  console.log('Test completed! Check final-settlement-complete.png');
  
  // Keep browser open to see results
  await page.waitForTimeout(5000);
  
  await browser.close();
})();