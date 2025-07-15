const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({
    headless: false // Set to true if you don't want to see the browser
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Navigate to the URL
  console.log('Navigating to WeTravel prototype...');
  await page.goto('https://wetravel-prototype.vercel.app/?state=eyJwZW9wbGUiOlt7ImlkIjoiMSIsIm5hbWUiOiLsp4Drr7wifSx7ImlkIjoiMiIsIm5hbWUiOiLqt5zruYgifSx7ImlkIjoiMyIsIm5hbWUiOiLslYTsmIEifSx7ImlkIjoiNCIsIm5hbWUiOiLsoJXshK0ifSx7ImlkIjoiNSIsIm5hbWUiOiLsmIjsiqwifSx7ImlkIjoiNiIsIm5hbWUiOiLspIDqsr0ifSx7ImlkIjoiNyIsIm5hbWUiOiLsnKTsoJUifSx7ImlkIjoiOCIsIm5hbWUiOiLsp4DtmIQifSx7ImlkIjoiOSIsIm5hbWUiOiLsmrDtmJUifV0sImV4cGVuc2VzIjpbeyJpZCI6ImV4cDEiLCJuYW1lIjoi66eJ6rWt7IiYIC0g7YWM7J2067iUIDEiLCJhbW91bnQiOjk2MDAwLCJwYWlkQnkiOiIzIiwic3BsaXRBbW9uZyI6WyIyIiwiMyIsIjUiLCI3IiwiOCJdfSx7ImlkIjoiZXhwMiIsIm5hbWUiOiLrp4nqta3siJggLSDthYzsnbTruJQyIiwiYW1vdW50Ijo5ODAwMCwicGFpZEJ5IjoiMSIsInNwbGl0QW1vbmciOlsiMSIsIjQiLCI2IiwiOSJdfSx7ImlkIjoiZXhwMyIsIm5hbWUiOiLrgq3rp4zsp5zsnqUiLCJhbW91bnQiOjc1MjAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIyIiwiNCIsIjUiLCI2Il19LHsiaWQiOiJleHA0IiwibmFtZSI6IuyVvOqwhCDtjrjsnZjsoJAiLCJhbW91bnQiOjQ5NTAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIxIiwiMiIsIjQiLCI1IiwiNiIsIjciLCI5Il19LHsiaWQiOiJleHA1IiwibmFtZSI6Iuq3nOu5iCDsnKDrpZjruYQiLCJhbW91bnQiOjMzMTAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIyIiwiNCIsIjUiLCI2Il19LHsiaWQiOiJleHA2IiwibmFtZSI6IuyImeyGjC0g7JW87IudIiwiYW1vdW50IjoxMzUzMDAsInBhaWRCeSI6IjYiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyIsIjkiXX0seyJpZCI6ImV4cDciLCJuYW1lIjoi7KCA7IiY7KeAIOyYpOumrOuwsCIsImFtb3VudCI6NDQwMDAsInBhaWRCeSI6IjEiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyJdfSx7ImlkIjoiZXhwOCIsIm5hbWUiOiLsiJnshowgLSDsnbjsm5Ag7LaU6rCAIOydtOu2iCIsImFtb3VudCI6MzAwMDAsInBhaWRCeSI6IjEiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyIsIjkiXX0seyJpZCI6ImV4cDkiLCJuYW1lIjoi64Kt66eM7Kec7J6lIC0g7KeA66+8IiwiYW1vdW50IjoyMTMwMCwicGFpZEJ5IjoiMSIsInNwbGl0QW1vbmciOlsiMSIsIjciLCI5Il19XSwiZ3JvdXBOYW1lIjoi6rCV7JuQIOyXrO2WiSJ9');
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');
  
  // Wait for the state to be loaded from URL
  console.log('Waiting for state to load from URL...');
  
  // Wait for people to be loaded (checking if any person names are visible)
  try {
    // Wait for the expenses table to appear
    await page.waitForSelector('table', { timeout: 10000 });
    console.log('Expenses table found!');
    
    // Also wait for settlement results
    await page.waitForSelector('text=정산 결과', { timeout: 10000 });
    console.log('Settlement results section found!');
  } catch (error) {
    console.log('Some elements not found, but continuing...');
  }
  
  // Wait a bit more to ensure everything is rendered
  await page.waitForTimeout(2000);
  
  // Log what we see on the page
  const groupName = await page.locator('input[placeholder="우리 모임"]').inputValue();
  console.log('Group name:', groupName);
  
  // Count people
  const peopleCount = await page.locator('div:has(> h2:text("참가자 설정")) button:has-text("✖")').count();
  console.log('Number of people loaded:', peopleCount);
  
  // Count expenses
  const expenseCount = await page.locator('table tbody tr').count();
  console.log('Number of expenses loaded:', expenseCount);
  
  // Take a full page screenshot
  console.log('Taking screenshot...');
  await page.screenshot({ 
    path: 'wetravel-screenshot.png',
    fullPage: true 
  });
  
  console.log('Screenshot saved as wetravel-screenshot.png');
  
  // Also take a viewport screenshot for quick viewing
  await page.screenshot({ 
    path: 'wetravel-viewport.png',
    fullPage: false 
  });
  
  console.log('Viewport screenshot saved as wetravel-viewport.png');
  
  // Keep browser open for a moment to see the results
  await page.waitForTimeout(2000);
  
  await browser.close();
  console.log('Done!');
})();