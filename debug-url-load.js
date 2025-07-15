const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    // Enable console logs
    recordVideo: {
      dir: './'
    }
  });
  
  const page = await context.newPage();
  
  // Listen to console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  // Navigate to the URL
  console.log('Navigating to WeTravel prototype with state...');
  const url = 'https://wetravel-prototype.vercel.app/?state=eyJwZW9wbGUiOlt7ImlkIjoiMSIsIm5hbWUiOiLsp4Drr7wifSx7ImlkIjoiMiIsIm5hbWUiOiLqt5zruYgifSx7ImlkIjoiMyIsIm5hbWUiOiLslYTsmIEifSx7ImlkIjoiNCIsIm5hbWUiOiLsoJXshK0ifSx7ImlkIjoiNSIsIm5hbWUiOiLsmIjsiqwifSx7ImlkIjoiNiIsIm5hbWUiOiLspIDqsr0ifSx7ImlkIjoiNyIsIm5hbWUiOiLsnKTsoJUifSx7ImlkIjoiOCIsIm5hbWUiOiLsp4DtmIQifSx7ImlkIjoiOSIsIm5hbWUiOiLsmrDtmJUifV0sImV4cGVuc2VzIjpbeyJpZCI6ImV4cDEiLCJuYW1lIjoi66eJ6rWt7IiYIC0g7YWM7J2067iUIDEiLCJhbW91bnQiOjk2MDAwLCJwYWlkQnkiOiIzIiwic3BsaXRBbW9uZyI6WyIyIiwiMyIsIjUiLCI3IiwiOCJdfSx7ImlkIjoiZXhwMiIsIm5hbWUiOiLrp4nqta3siJggLSDthYzsnbTruJQyIiwiYW1vdW50Ijo5ODAwMCwicGFpZEJ5IjoiMSIsInNwbGl0QW1vbmciOlsiMSIsIjQiLCI2IiwiOSJdfSx7ImlkIjoiZXhwMyIsIm5hbWUiOiLrgq3rp4zsp5zsnqUiLCJhbW91bnQiOjc1MjAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIyIiwiNCIsIjUiLCI2Il19LHsiaWQiOiJleHA0IiwibmFtZSI6IuyVvOqwhCDtjrjsnZjsoJAiLCJhbW91bnQiOjQ5NTAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIxIiwiMiIsIjQiLCI1IiwiNiIsIjciLCI5Il19LHsiaWQiOiJleHA1IiwibmFtZSI6Iuq3nOu5iCDsnKDrpZjruYQiLCJhbW91bnQiOjMzMTAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIyIiwiNCIsIjUiLCI2Il19LHsiaWQiOiJleHA2IiwibmFtZSI6IuyImeyGjC0g7JW87IudIiwiYW1vdW50IjoxMzUzMDAsInBhaWRCeSI6IjYiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyIsIjkiXX0seyJpZCI6ImV4cDciLCJuYW1lIjoi7KCA7IiY7KeAIOyYpOumrOuwsCIsImFtb3VudCI6NDQwMDAsInBhaWRCeSI6IjEiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyJdfSx7ImlkIjoiZXhwOCIsIm5hbWUiOiLsiJnshowgLSDsnbjsm5Ag7LaU6rCAIOydtOu2iCIsImFtb3VudCI6MzAwMDAsInBhaWRCeSI6IjEiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyIsIjkiXX0seyJpZCI6ImV4cDkiLCJuYW1lIjoi64Kt66eM7Kec7J6lIC0g7KeA66+8IiwiYW1vdW50IjoyMTMwMCwicGFpZEJ5IjoiMSIsInNwbGl0QW1vbmciOlsiMSIsIjciLCI5Il19XSwiZ3JvdXBOYW1lIjoi6rCV7JuQIOyXrO2WiSJ9';
  
  await page.goto(url);
  
  // Wait for initial load
  await page.waitForLoadState('domcontentloaded');
  console.log('DOM content loaded');
  
  // Take screenshot right after navigation
  await page.screenshot({ path: 'debug-1-initial.png' });
  console.log('Initial screenshot taken');
  
  // Check if we're on the right page
  const title = await page.title();
  console.log('Page title:', title);
  
  // Wait a bit and check for any visible text
  await page.waitForTimeout(5000);
  
  // Check what's visible on the page
  const visibleText = await page.evaluate(() => {
    const body = document.body;
    return body ? body.innerText.substring(0, 500) : 'No body found';
  });
  console.log('Visible text on page:', visibleText);
  
  // Try to find specific elements
  const hasTable = await page.locator('table').count();
  console.log('Number of tables found:', hasTable);
  
  const hasExpenseHeader = await page.locator('text=지출 내역').count();
  console.log('Found "지출 내역" header:', hasExpenseHeader);
  
  const hasSettlementHeader = await page.locator('text=정산 결과').count();
  console.log('Found "정산 결과" header:', hasSettlementHeader);
  
  // Check if there are any people displayed
  const peopleElements = await page.locator('button:has-text("✖")').count();
  console.log('Number of people (X buttons):', peopleElements);
  
  // Take final screenshot
  await page.screenshot({ path: 'debug-2-after-wait.png', fullPage: true });
  console.log('Final screenshot taken');
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('Done!');
})();