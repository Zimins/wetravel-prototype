// 스크린샷 데이터를 기반으로 state 생성
const testData = {
  people: [
    { id: "1", name: "지민" },
    { id: "2", name: "규빈" },
    { id: "3", name: "아영" },
    { id: "4", name: "정섭" },
    { id: "5", name: "예슬" },
    { id: "6", name: "준경" },
    { id: "7", name: "윤정" },
    { id: "8", name: "지현" },
    { id: "9", name: "우형" }
  ],
  expenses: [
    {
      id: "exp1",
      name: "막국수 - 테이블 1",
      amount: 96000,
      paidBy: "3", // 아영
      splitAmong: ["2", "3", "5", "7", "8"] // 규빈, 아영, 예슬, 윤정, 지현
    },
    {
      id: "exp2", 
      name: "막국수 - 테이블2",
      amount: 98000,
      paidBy: "1", // 지민
      splitAmong: ["1", "4", "6", "9"] // 지민, 정섭, 준경, 우형
    },
    {
      id: "exp3",
      name: "낭만짜장",
      amount: 75200,
      paidBy: "2", // 규빈
      splitAmong: ["2", "4", "5", "6"] // 규빈, 정섭, 예슬, 준경
    },
    {
      id: "exp4",
      name: "야간 편의점",
      amount: 49500,
      paidBy: "2", // 규빈
      splitAmong: ["1", "2", "4", "5", "6", "7", "9"] // 지민, 규빈, 정섭, 예슬, 준경, 윤정, 우형
    },
    {
      id: "exp5",
      name: "규빈 유류비",
      amount: 33100,
      paidBy: "2", // 규빈
      splitAmong: ["2", "4", "5", "6"] // 규빈, 정섭, 예슬, 준경
    },
    {
      id: "exp6",
      name: "숙소- 야식",
      amount: 135300,
      paidBy: "6", // 준경
      splitAmong: ["1", "2", "4", "5", "6", "7", "9"] // 지민, 규빈, 정섭, 예슬, 준경, 윤정, 우형
    },
    {
      id: "exp7",
      name: "저수지 오리배",
      amount: 44000,
      paidBy: "1", // 지민
      splitAmong: ["1", "2", "4", "5", "6", "7"] // 지민, 규빈, 정섭, 예슬, 준경, 윤정
    },
    {
      id: "exp8",
      name: "숙소 - 인원 추가 이불",
      amount: 30000,
      paidBy: "1", // 지민
      splitAmong: ["1", "2", "4", "5", "6", "7", "9"] // 지민, 규빈, 정섭, 예슬, 준경, 윤정, 우형
    },
    {
      id: "exp9",
      name: "낭만짜장 - 지민",
      amount: 21300,
      paidBy: "1", // 지민
      splitAmong: ["1", "7", "9"] // 지민, 윤정, 우형
    }
  ],
  groupName: "강원 여행"
};

// state를 base64로 인코딩
const stateString = JSON.stringify(testData);
const state = btoa(encodeURIComponent(stateString));

// URL 생성
const baseUrl = "https://wetravel-prototype.vercel.app/";
const fullUrl = `${baseUrl}?state=${state}`;

console.log("생성된 URL:");
console.log(fullUrl);
console.log("\n로컬 테스트용:");
console.log(`http://localhost:3002/?state=${state}`);

// 데이터 요약
console.log("\n데이터 요약:");
console.log(`- 참가자: ${testData.people.length}명`);
console.log(`- 비용 항목: ${testData.expenses.length}개`);
console.log(`- 총 비용: ₩${testData.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`);