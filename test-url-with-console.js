const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console logs and errors
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  const url = 'https://wetravel-prototype.vercel.app/?state=eyJwZW9wbGUiOlt7ImlkIjoiMSIsIm5hbWUiOiLsp4Drr7wifSx7ImlkIjoiMiIsIm5hbWUiOiLqt5zruYgifSx7ImlkIjoiMyIsIm5hbWUiOiLslYTsmIEifSx7ImlkIjoiNCIsIm5hbWUiOiLsoJXshK0ifSx7ImlkIjoiNSIsIm5hbWUiOiLsmIjsiqwifSx7ImlkIjoiNiIsIm5hbWUiOiLspIDqsr0ifSx7ImlkIjoiNyIsIm5hbWUiOiLsnKTsoJUifSx7ImlkIjoiOCIsIm5hbWUiOiLsp4DtmIQifSx7ImlkIjoiOSIsIm5hbWUiOiLsmrDtmJUifV0sImV4cGVuc2VzIjpbeyJpZCI6ImV4cDEiLCJuYW1lIjoi66eJ6rWt7IiYIC0g7YWM7J2067iUIDEiLCJhbW91bnQiOjk2MDAwLCJwYWlkQnkiOiIzIiwic3BsaXRBbW9uZyI6WyIyIiwiMyIsIjUiLCI3IiwiOCJdfSx7ImlkIjoiZXhwMiIsIm5hbWUiOiLrp4nqta3siJggLSDthYzsnbTruJQyIiwiYW1vdW50Ijo5ODAwMCwicGFpZEJ5IjoiMSIsInNwbGl0QW1vbmciOlsiMSIsIjQiLCI2IiwiOSJdfSx7ImlkIjoiZXhwMyIsIm5hbWUiOiLrgq3rp4zsp5zsnqUiLCJhbW91bnQiOjc1MjAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIyIiwiNCIsIjUiLCI2Il19LHsiaWQiOiJleHA0IiwibmFtZSI6IuyVvOqwhCDtjrjsnZjsoJAiLCJhbW91bnQiOjQ5NTAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIxIiwiMiIsIjQiLCI1IiwiNiIsIjciLCI5Il19LHsiaWQiOiJleHA1IiwibmFtZSI6Iuq3nOu5iCDsnKDrpZjruYQiLCJhbW91bnQiOjMzMTAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIyIiwiNCIsIjUiLCI2Il19LHsiaWQiOiJleHA2IiwibmFtZSI6IuyImeyGjC0g7JW87IudIiwiYW1vdW50IjoxMzUzMDAsInBhaWRCeSI6IjYiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyIsIjkiXX0seyJpZCI6ImV4cDciLCJuYW1lIjoi7KCA7IiY7KeAIOyYpOumrOuwsCIsImFtb3VudCI6NDQwMDAsInBhaWRCeSI6IjEiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyJdfSx7ImlkIjoiZXhwOCIsIm5hbWUiOiLsiJnshowgLSDsnbjsm5Ag7LaU6rCAIOydtOu2iCIsImFtb3VudCI6MzAwMDAsInBhaWRCeSI6IjEiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyIsIjkiXX0seyJpZCI6ImV4cDkiLCJuYW1lIjoi64Kt66eM7Kec7J6lIC0g7KeA66+8IiwiYW1vdW50IjoyMTMwMCwicGFpZEJ5IjoiMSIsInNwbGl0QW1vbmciOlsiMSIsIjciLCI5Il19XSwiZ3JvdXBOYW1lIjoi6rCV7JuQIOyXrO2WiSJ9';
  
  console.log('Navigating to URL...');
  await page.goto(url);
  
  // Wait a bit for any errors to appear
  await page.waitForTimeout(3000);
  
  // Print all console logs
  console.log('\n=== Console Logs ===');
  consoleLogs.forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });
  
  // Check URL after navigation
  const currentUrl = page.url();
  console.log('\nCurrent URL:', currentUrl);
  
  // Try to decode the state from the current URL
  const urlParams = new URL(currentUrl).searchParams;
  const stateParam = urlParams.get('state');
  console.log('\nState parameter exists:', !!stateParam);
  console.log('State length:', stateParam ? stateParam.length : 0);
  
  // Check localStorage
  const localStorageData = await page.evaluate(() => {
    return Object.keys(localStorage).map(key => ({
      key,
      value: localStorage.getItem(key)
    }));
  });
  console.log('\nLocalStorage:', localStorageData);
  
  await browser.close();
})();