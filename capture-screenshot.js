const { chromium } = require('playwright');

(async () => {
  // 헤드리스 모드로 실행
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 60000 
  });
  const page = await browser.newPage();
  
  // 3000 포트로 접속
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  // 페이지가 완전히 로드될 때까지 대기
  await page.waitForLoadState('networkidle');
  
  // CSS가 적용될 때까지 추가 대기
  await page.waitForTimeout(3000);
  
  // 스크린샷 캡처
  await page.screenshot({ 
    path: 'wetravel-homepage.png',
    fullPage: true 
  });
  
  console.log('스크린샷이 wetravel-homepage.png로 저장되었습니다.');
  
  // 브라우저 정보 확인
  const url = page.url();
  console.log('현재 URL:', url);
  
  // CSS 파일 로드 확인
  const cssLinks = await page.$$eval('link[rel="stylesheet"]', links => 
    links.map(link => link.href)
  );
  console.log('로드된 CSS 파일:', cssLinks);
  
  await browser.close();
})();