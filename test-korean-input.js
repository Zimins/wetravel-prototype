const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false, // 브라우저를 표시하여 실제 동작 확인
    slowMo: 500 // 각 동작 사이에 딜레이를 주어 시각적으로 확인
  });
  const page = await browser.newPage();
  
  console.log('1. 홈페이지 접속...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // 초기 화면 스크린샷
  await page.screenshot({ path: 'test-01-initial.png' });
  console.log('   ✓ 초기 화면 캡처 완료');
  
  // 참가자 추가 테스트
  console.log('\n2. 참가자 추가 테스트...');
  
  // 첫 번째 참가자 추가
  await page.fill('input[placeholder="이름 입력"]', '김철수');
  await page.screenshot({ path: 'test-02-typed-name1.png' });
  await page.click('button:has-text("추가")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-03-added-person1.png' });
  console.log('   ✓ 첫 번째 참가자 "김철수" 추가 완료');
  
  // 두 번째 참가자 추가
  const nameInput = page.locator('input[placeholder="이름 입력"]');
  await nameInput.click();
  await nameInput.fill('이영희');
  await page.click('button:has-text("추가")');
  await page.waitForTimeout(1000);
  console.log('   ✓ 두 번째 참가자 "이영희" 추가 완료');
  
  // 세 번째 참가자 추가
  await nameInput.click();
  await nameInput.fill('박민수');
  await page.click('button:has-text("추가")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-04-three-people.png' });
  console.log('   ✓ 세 번째 참가자 "박민수" 추가 완료');
  
  // 비용 입력 테스트
  console.log('\n3. 비용 입력 테스트...');
  
  // 첫 번째 비용 추가
  await page.fill('input[placeholder="항목명 (예: 점심)"]', '점심 식사');
  await page.fill('input[placeholder="금액"]', '45000');
  await page.screenshot({ path: 'test-05-expense-input.png' });
  await page.click('button:has-text("추가"):nth-of-type(2)');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-06-expense-added.png' });
  console.log('   ✓ 첫 번째 비용 "점심 식사 45,000원" 추가 완료');
  
  // 두 번째 비용 추가
  await page.fill('input[placeholder="항목명 (예: 점심)"]', '카페');
  await page.fill('input[placeholder="금액"]', '18000');
  await page.click('button:has-text("추가"):nth-of-type(2)');
  await page.waitForTimeout(1000);
  console.log('   ✓ 두 번째 비용 "카페 18,000원" 추가 완료');
  
  // 세 번째 비용 추가 (한 사람만 부담)
  await page.fill('input[placeholder="항목명 (예: 점심)"]', '택시비');
  await page.fill('input[placeholder="금액"]', '15000');
  await page.click('button:has-text("추가"):nth-of-type(2)');
  await page.waitForTimeout(1000);
  
  // 택시비는 김철수와 이영희만 나눔 (박민수 체크 해제)
  const checkboxes = await page.$$('input[type="checkbox"]');
  if (checkboxes.length >= 9) { // 3개 비용 x 3명 = 9개 체크박스
    await checkboxes[8].uncheck(); // 마지막 행의 마지막 체크박스 (박민수)
  }
  await page.waitForTimeout(1000);
  
  // 결제자 변경 테스트
  console.log('\n4. 결제자 변경 테스트...');
  const selects = await page.$$('select');
  if (selects.length >= 2) {
    await selects[1].selectOption({ index: 1 }); // 두 번째 비용의 결제자를 변경
  }
  await page.waitForTimeout(1000);
  
  // 최종 화면 스크린샷
  await page.screenshot({ path: 'test-07-final-state.png', fullPage: true });
  console.log('   ✓ 최종 정산 결과 캡처 완료');
  
  // 정산 결과 확인
  console.log('\n5. 정산 결과 확인...');
  const settlementExists = await page.locator('text=정산 결과').isVisible();
  if (settlementExists) {
    console.log('   ✓ 정산 결과가 정상적으로 표시됨');
    
    // 정산 내역 텍스트 추출
    const settlements = await page.$$eval('.text-2xl.font-black.text-transparent', 
      elements => elements.map(el => el.textContent)
    );
    console.log('   ✓ 정산 금액:', settlements);
  }
  
  console.log('\n테스트 완료! 스크린샷을 확인하세요.');
  
  // 브라우저는 열어둠 (수동으로 추가 테스트 가능)
  // await browser.close();
})();