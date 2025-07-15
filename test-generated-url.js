const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const url = 'https://wetravel-prototype.vercel.app/?state=eyJwZW9wbGUiOlt7ImlkIjoiMSIsIm5hbWUiOiLsp4Drr7wifSx7ImlkIjoiMiIsIm5hbWUiOiLqt5zruYgifSx7ImlkIjoiMyIsIm5hbWUiOiLslYTsmIEifSx7ImlkIjoiNCIsIm5hbWUiOiLsoJXshK0ifSx7ImlkIjoiNSIsIm5hbWUiOiLsmIjsiqwifSx7ImlkIjoiNiIsIm5hbWUiOiLspIDqsr0ifSx7ImlkIjoiNyIsIm5hbWUiOiLsnKTsoJUifSx7ImlkIjoiOCIsIm5hbWUiOiLsp4DtmIQifSx7ImlkIjoiOSIsIm5hbWUiOiLsmrDtmJUifV0sImV4cGVuc2VzIjpbeyJpZCI6ImV4cDEiLCJuYW1lIjoi66eJ6rWt7IiYIC0g7YWM7J2067iUIDEiLCJhbW91bnQiOjk2MDAwLCJwYWlkQnkiOiIzIiwic3BsaXRBbW9uZyI6WyIyIiwiMyIsIjUiLCI3IiwiOCJdfSx7ImlkIjoiZXhwMiIsIm5hbWUiOiLrp4nqta3siJggLSDthYzsnbTruJQyIiwiYW1vdW50Ijo5ODAwMCwicGFpZEJ5IjoiMSIsInNwbGl0QW1vbmciOlsiMSIsIjQiLCI2IiwiOSJdfSx7ImlkIjoiZXhwMyIsIm5hbWUiOiLrgq3rp4zsp5zsnqUiLCJhbW91bnQiOjc1MjAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIyIiwiNCIsIjUiLCI2Il19LHsiaWQiOiJleHA0IiwibmFtZSI6IuyVvOqwhCDtjrjsnZjsoJAiLCJhbW91bnQiOjQ5NTAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIxIiwiMiIsIjQiLCI1IiwiNiIsIjciLCI5Il19LHsiaWQiOiJleHA1IiwibmFtZSI6Iuq3nOu5iCDsnKDrpZjruYQiLCJhbW91bnQiOjMzMTAwLCJwYWlkQnkiOiIyIiwic3BsaXRBbW9uZyI6WyIyIiwiNCIsIjUiLCI2Il19LHsiaWQiOiJleHA2IiwibmFtZSI6IuyImeyGjC0g7JW87IudIiwiYW1vdW50IjoxMzUzMDAsInBhaWRCeSI6IjYiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyIsIjkiXX0seyJpZCI6ImV4cDciLCJuYW1lIjoi7KCA7IiY7KeAIOyYpOumrOuwsCIsImFtb3VudCI6NDQwMDAsInBhaWRCeSI6IjEiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyJdfSx7ImlkIjoiZXhwOCIsIm5hbWUiOiLsiJnshowgLSDsnbjsm5Ag7LaU6rCAIOydtOu2iCIsImFtb3VudCI6MzAwMDAsInBhaWRCeSI6IjEiLCJzcGxpdEFtb25nIjpbIjEiLCIyIiwiNCIsIjUiLCI2IiwiNyIsIjkiXX0seyJpZCI6ImV4cDkiLCJuYW1lIjoi64Kt66eM7Kec7J6lIC0g7KeA66+8IiwiYW1vdW50IjoyMTMwMCwicGFpZEJ5IjoiMSIsInNwbGl0QW1vbmciOlsiMSIsIjciLCI5Il19XSwiZ3JvdXBOYW1lIjoi6rCV7JuQIOyXrO2WiSJ9';
  
  console.log('Navigating to URL...');
  await page.goto(url);
  
  // Wait for the page to load
  await page.waitForTimeout(3000);
  
  // Check if people are loaded
  const peopleCount = await page.locator('.flex.flex-wrap.gap-2 > div').count();
  console.log(`참가자 수: ${peopleCount}명`);
  
  // Check if expenses are loaded
  const expenseRows = await page.locator('tbody tr').count();
  console.log(`비용 항목 수: ${expenseRows}개`);
  
  // Check group name
  const groupName = await page.inputValue('input[placeholder="그룹 이름"]');
  console.log(`그룹 이름: ${groupName}`);
  
  // Scroll to see settlement results
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  // Take a screenshot
  await page.screenshot({ path: 'generated-url-test.png', fullPage: true });
  console.log('Screenshot saved as generated-url-test.png');
  
  // Check for any errors in console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  
  await page.waitForTimeout(2000);
  await browser.close();
})();