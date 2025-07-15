'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Expense {
  id: string
  name: string
  amount: number
  paidBy: string
  splitAmong: string[]
}

interface Person {
  id: string
  name: string
}

interface Settlement {
  from: string
  to: string
  amount: number
}

function ExpenseCalculator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [people, setPeople] = useState<Person[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newPersonName, setNewPersonName] = useState('')
  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('')
  const [groupName, setGroupName] = useState('우리 모임')
  const [showCopied, setShowCopied] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<string>('all')
  const [filterType, setFilterType] = useState<'all' | 'from' | 'to'>('all')
  
  // Load state from URL on mount
  useEffect(() => {
    const stateParam = searchParams.get('state')
    if (stateParam) {
      try {
        // UTF-8 문자열을 base64에서 안전하게 디코딩
        const decodedString = decodeURIComponent(escape(atob(stateParam)))
        const decodedState = JSON.parse(decodedString)
        setPeople(decodedState.people || [])
        setExpenses(decodedState.expenses || [])
        setGroupName(decodedState.groupName || '우리 모임')
      } catch (error) {
        console.error('Failed to parse state from URL', error)
      }
    }
  }, [searchParams])
  
  // Update URL when state changes
  useEffect(() => {
    // UTF-8 문자열을 base64로 안전하게 인코딩
    const stateString = JSON.stringify({ people, expenses, groupName })
    const state = btoa(unescape(encodeURIComponent(stateString)))
    router.replace(`?state=${state}`, { scroll: false })
  }, [people, expenses, groupName, router])
  
  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([...people, { id: Date.now().toString(), name: newPersonName.trim() }])
      setNewPersonName('')
    }
  }
  
  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id))
    setExpenses(expenses.map(expense => ({
      ...expense,
      paidBy: expense.paidBy === id ? '' : expense.paidBy,
      splitAmong: expense.splitAmong.filter(personId => personId !== id)
    })))
  }
  
  const addExpense = () => {
    if (newExpenseName.trim() && newExpenseAmount && people.length > 0) {
      const paidBy = newExpensePaidBy || people[0].id
      setExpenses([...expenses, {
        id: Date.now().toString(),
        name: newExpenseName.trim(),
        amount: parseFloat(newExpenseAmount),
        paidBy: paidBy,
        splitAmong: people.map(p => p.id)
      }])
      setNewExpenseName('')
      setNewExpenseAmount('')
      setNewExpensePaidBy('')
    }
  }
  
  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }
  
  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ))
  }
  
  const togglePersonInExpense = (expenseId: string, personId: string) => {
    const expense = expenses.find(e => e.id === expenseId)
    if (!expense) return
    
    const isIncluded = expense.splitAmong.includes(personId)
    updateExpense(expenseId, {
      splitAmong: isIncluded 
        ? expense.splitAmong.filter(id => id !== personId)
        : [...expense.splitAmong, personId]
    })
  }
  
  const calculateSettlements = (): Settlement[] => {
    // 각 사람 간의 빚을 추적하는 2차원 맵
    const debts: Record<string, Record<string, number>> = {}
    
    // 초기화
    people.forEach(person => {
      debts[person.id] = {}
      people.forEach(other => {
        if (person.id !== other.id) {
          debts[person.id][other.id] = 0
        }
      })
    })
    
    // 각 비용에 대해 개별적으로 계산
    expenses.forEach(expense => {
      if (expense.paidBy && expense.splitAmong.length > 0) {
        const perPersonAmount = expense.amount / expense.splitAmong.length
        
        // 비용을 나눠 낸 사람들이 지불한 사람에게 빚을 짐
        expense.splitAmong.forEach(personId => {
          if (personId !== expense.paidBy) {
            debts[personId][expense.paidBy] = (debts[personId][expense.paidBy] || 0) + perPersonAmount
          }
        })
      }
    })
    
    // 빚을 상쇄 (A가 B에게 X원, B가 A에게 Y원이면 상쇄)
    const netDebts: Record<string, Record<string, number>> = {}
    people.forEach(person => {
      netDebts[person.id] = {}
    })
    
    people.forEach(person1 => {
      people.forEach(person2 => {
        if (person1.id !== person2.id && person1.id < person2.id) {
          const debt1to2 = debts[person1.id][person2.id] || 0
          const debt2to1 = debts[person2.id][person1.id] || 0
          
          if (debt1to2 > debt2to1) {
            netDebts[person1.id][person2.id] = debt1to2 - debt2to1
          } else if (debt2to1 > debt1to2) {
            netDebts[person2.id][person1.id] = debt2to1 - debt1to2
          }
        }
      })
    })
    
    // Settlement 배열로 변환
    const settlements: Settlement[] = []
    Object.entries(netDebts).forEach(([fromId, toMap]) => {
      Object.entries(toMap).forEach(([toId, amount]) => {
        if (amount > 0.01) {
          settlements.push({
            from: fromId,
            to: toId,
            amount: Math.round(amount * 100) / 100
          })
        }
      })
    })
    
    return settlements
  }
  
  const settlements = calculateSettlements()
  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || ''
  
  // 필터링된 정산 결과
  const filteredSettlements = selectedPerson === 'all' 
    ? settlements 
    : settlements.filter(s => {
        if (filterType === 'from') return s.from === selectedPerson
        if (filterType === 'to') return s.to === selectedPerson
        return s.from === selectedPerson || s.to === selectedPerson
      })
  
  // Calculate total expense and per person average
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const averagePerPerson = people.length > 0 ? totalExpense / people.length : 0
  
  // 공유 링크 복사 함수
  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              정산 계산기
            </span>
          </h1>
          <p className="text-xl text-white/80 font-light">간편하게 그룹 비용을 정산하세요</p>
          
          {/* 그룹 이름 설정 */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹 이름"
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all backdrop-blur-sm text-center font-semibold"
            />
            <button
              onClick={copyShareLink}
              className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 font-bold flex items-center gap-2 ${
                showCopied ? 'from-green-500 to-green-600' : ''
              }`}
            >
              {showCopied ? (
                <>
                  <span>✓</span>
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>공유하기</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* People Management */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
            <span className="text-3xl">👥</span>
            <span>참가자 설정</span>
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPerson()}
              placeholder="이름 입력"
              className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all backdrop-blur-sm"
            />
            <button
              onClick={addPerson}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 font-bold"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {people.map(person => (
              <div key={person.id} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-5 py-3 rounded-full border border-white/30 backdrop-blur-sm hover:border-white/50 transition-all">
                <span className="font-semibold text-white">{person.name}</span>
                <button
                  onClick={() => removePerson(person.id)}
                  className="text-white/70 hover:text-white hover:bg-red-500/30 rounded-full w-7 h-7 flex items-center justify-center transition-all font-bold text-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Expense Management */}
        {people.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <span>비용 입력</span>
            </h2>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExpense()}
                placeholder="항목명 (예: 점심)"
                className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all backdrop-blur-sm"
              />
              <input
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExpense()}
                placeholder="금액"
                className="w-36 px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all backdrop-blur-sm"
              />
              <select
                value={newExpensePaidBy}
                onChange={(e) => setNewExpensePaidBy(e.target.value)}
                className="px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm"
              >
                <option value="" className="bg-gray-800 text-white/50">결제자 선택</option>
                {people.map(person => (
                  <option key={person.id} value={person.id} className="bg-gray-800 text-white">{person.name}</option>
                ))}
              </select>
              <button
                onClick={addExpense}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 font-bold"
              >
                추가
              </button>
            </div>
            
            {/* Expense Table */}
            {expenses.length > 0 && (
              <div className="overflow-x-auto rounded-2xl bg-black/20 backdrop-blur-sm">
                <table className="w-full">
                  <thead className="bg-white/10 border-b border-white/20">
                    <tr>
                      <th className="text-left p-5 font-bold text-white/90">항목</th>
                      <th className="text-right p-5 font-bold text-white/90">금액</th>
                      <th className="p-5 font-bold text-white/90">결제자</th>
                      {people.map(person => (
                        <th key={person.id} className="p-5 text-center font-bold text-white/90">{person.name}</th>
                      ))}
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense, index) => (
                      <tr key={expense.id} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-black/10'} hover:bg-white/10 transition-all`}>
                        <td className="p-5 font-semibold text-white">{expense.name}</td>
                        <td className="text-right p-5">
                          <input
                            type="number"
                            value={expense.amount}
                            onChange={(e) => updateExpense(expense.id, { amount: parseFloat(e.target.value) || 0 })}
                            className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-cyan-400 font-bold text-right focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm"
                          />
                        </td>
                        <td className="p-4">
                          <select
                            value={expense.paidBy}
                            onChange={(e) => updateExpense(expense.id, { paidBy: e.target.value })}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm"
                          >
                            {people.map(person => (
                              <option key={person.id} value={person.id} className="bg-gray-800 text-white">{person.name}</option>
                            ))}
                          </select>
                        </td>
                        {people.map(person => (
                          <td key={person.id} className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={expense.splitAmong.includes(person.id)}
                              onChange={() => togglePersonInExpense(expense.id, person.id)}
                              className="w-5 h-5 text-cyan-400 rounded focus:ring-cyan-400 cursor-pointer accent-cyan-400"
                            />
                          </td>
                        ))}
                        <td className="p-4">
                          <button
                            onClick={() => removeExpense(expense.id)}
                            className="text-red-400 hover:text-white hover:bg-red-500/30 px-4 py-2 rounded-xl transition-all font-medium"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Summary Stats */}
            {expenses.length > 0 && (
              <div className="mt-8">
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-6 rounded-2xl border border-white/30 backdrop-blur-sm inline-block">
                  <p className="text-sm text-white/70 mb-2">총 비용</p>
                  <p className="text-3xl font-black text-white">₩{totalExpense.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Settlement Results - Always visible when there are settlements */}
        {settlements.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">✨</span>
                <span>정산 결과</span>
              </h2>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'from' | 'to')}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm"
                >
                  <option value="all" className="bg-gray-800 text-white">전체</option>
                  <option value="from" className="bg-gray-800 text-white">보내는 사람</option>
                  <option value="to" className="bg-gray-800 text-white">받는 사람</option>
                </select>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="px-5 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm"
                >
                  <option value="all" className="bg-gray-800 text-white">전체 보기</option>
                  {people.map(person => (
                    <option key={person.id} value={person.id} className="bg-gray-800 text-white">{person.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              {filteredSettlements.map((settlement, index) => (
                <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-white text-lg">{getPersonName(settlement.from)}</span>
                    <span className="text-white/60 text-2xl">→</span>
                    <span className="font-bold text-white text-lg">{getPersonName(settlement.to)}</span>
                  </div>
                  <span className="text-2xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                    ₩{settlement.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            {filteredSettlements.length === 0 && selectedPerson !== 'all' && (
              <p className="text-center text-white/60 py-8">선택한 사람과 관련된 정산 내역이 없습니다.</p>
            )}
          </div>
        )}
        
        {/* Empty state message */}
        {people.length === 0 && (
          <div className="text-center py-32">
            <div className="text-7xl mb-6 animate-bounce">👆</div>
            <p className="text-white/80 text-2xl font-light">참가자를 추가하여 시작하세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center"><div className="text-white text-2xl">로딩 중...</div></div>}>
      <ExpenseCalculator />
    </Suspense>
  )
}