'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup, getGroup, updateGroup, subscribeToGroup, GroupData } from '@/lib/database'

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

interface ExpenseTrackerProps {
  groupId?: string
}

export default function ExpenseTracker({ groupId }: ExpenseTrackerProps) {
  const router = useRouter()
  
  const [people, setPeople] = useState<Person[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newPersonName, setNewPersonName] = useState('')
  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('')
  const [groupName, setGroupName] = useState('친구 여행')
  const [showCopied, setShowCopied] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<string>('all')
  const [filterType, setFilterType] = useState<'all' | 'from' | 'to'>('all')
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
  const [tempSplitAmong, setTempSplitAmong] = useState<string[]>([])
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number>(0)
  const [isCreating, setIsCreating] = useState(false)
  const [isLocalUpdate, setIsLocalUpdate] = useState(false)
  const [hasLocalChanges, setHasLocalChanges] = useState(false)
  
  // Load group data or create new group
  useEffect(() => {
    if (!groupId) {
      // Auto-create new group when no groupId
      if (!loading && !isCreating) {
        console.log('No groupId, creating new group...')
        createNewGroup()
      }
      return
    }
    
    setLoading(true)
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToGroup(groupId, (data) => {
      console.log('Received data update from Firebase:', data)
      if (data) {
        // Only update if this is not a local update or if the data is newer
        if (!isLocalUpdate || data.updatedAt > lastUpdated) {
          setPeople(data.people || [])
          setExpenses(data.expenses || [])
          setGroupName(data.groupName || '친구 여행')
          setLastUpdated(data.updatedAt)
        }
        setLoading(false)
      } else {
        // Group doesn't exist
        setLoading(false)
        alert('존재하지 않는 그룹입니다.')
        router.push('/')
      }
    })
    
    return () => unsubscribe()
  }, [groupId])
  
  // Save to Firebase when data changes
  useEffect(() => {
    if (!groupId || loading || !lastUpdated || !hasLocalChanges) return
    
    const saveData = async () => {
      setIsLocalUpdate(true)
      setSyncing(true)
      try {
        const newTimestamp = Date.now()
        await updateGroup(groupId, {
          groupName,
          people,
          expenses,
          updatedAt: newTimestamp
        })
        setLastUpdated(newTimestamp)
        setHasLocalChanges(false)
      } catch (error) {
        console.error('Failed to save data:', error)
      } finally {
        setSyncing(false)
        setTimeout(() => setIsLocalUpdate(false), 100)
      }
    }
    
    // Debounce saves - 3초에 한 번만 저장
    const timeoutId = setTimeout(saveData, 3000)
    return () => clearTimeout(timeoutId)
  }, [people, expenses, groupName, groupId, loading, hasLocalChanges])
  
  const createNewGroup = async () => {
    if (isCreating) return // Prevent multiple calls
    
    setIsCreating(true)
    setLoading(true)
    try {
      console.log('Creating new group with name:', groupName)
      const newGroupId = await createGroup({
        groupName,
        people,
        expenses,
        updatedAt: Date.now()
      })
      console.log('Group created, redirecting to:', newGroupId)
      router.push(`/${newGroupId}`)
    } catch (error) {
      console.error('Failed to create group:', error)
      alert('그룹 생성에 실패했습니다. 다시 시도해주세요.')
      setLoading(false)
      setIsCreating(false)
    }
  }

  const createNewGroupManual = async () => {
    setLoading(true)
    try {
      const newGroupId = await createGroup({
        groupName: '친구 여행',
        people: [],
        expenses: [],
        updatedAt: Date.now()
      })
      router.push(`/${newGroupId}`)
    } catch (error) {
      console.error('Failed to create group:', error)
      alert('그룹 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }
  
  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([...people, { id: Date.now().toString(), name: newPersonName.trim() }])
      setNewPersonName('')
      setHasLocalChanges(true)
    }
  }
  
  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id))
    setExpenses(expenses.map(expense => ({
      ...expense,
      paidBy: expense.paidBy === id ? '' : expense.paidBy,
      splitAmong: expense.splitAmong.filter(personId => personId !== id)
    })))
    setHasLocalChanges(true)
  }
  
  const addExpense = () => {
    if (newExpenseName.trim() && newExpenseAmount && people.length > 0) {
      const paidBy = newExpensePaidBy || people[0].id
      const splitAmong = showExpenseDialog ? tempSplitAmong : people.map(p => p.id)
      setExpenses([...expenses, {
        id: Date.now().toString(),
        name: newExpenseName.trim(),
        amount: parseFloat(newExpenseAmount),
        paidBy: paidBy,
        splitAmong: splitAmong.length > 0 ? splitAmong : people.map(p => p.id)
      }])
      setNewExpenseName('')
      setNewExpenseAmount('')
      setNewExpensePaidBy('')
      setShowExpenseDialog(false)
      setTempSplitAmong([])
      setHasLocalChanges(true)
    }
  }
  
  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
    setHasLocalChanges(true)
  }
  
  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ))
    setHasLocalChanges(true)
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
      const url = groupId ? window.location.href : ''
      if (url) {
        navigator.clipboard.writeText(url)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      }
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">로딩 중...</div>
      </div>
    )
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
          
          {/* 그룹 이름 및 공유 섹션 */}
          {groupId && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <input
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value)
                  setHasLocalChanges(true)
                }}
                placeholder="그룹 이름"
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all backdrop-blur-sm text-center font-semibold"
              />
              <div className="flex items-center gap-3">
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
                <button
                  onClick={createNewGroupManual}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-200 font-bold flex items-center gap-2"
                >
                  <span>➕</span>
                  <span>새 그룹</span>
                </button>
              </div>
            </div>
          )}
          
        </div>
        
        {/* People Management */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-2 lg:p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-2 lg:mb-6 text-white flex items-center gap-3">
            <span className="text-3xl">👥</span>
            <span>참가자 설정</span>
          </h2>
          <div className="flex gap-2 mb-2 lg:mb-4">
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
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-2 lg:p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-2 lg:mb-6 text-white flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <span>비용 입력</span>
            </h2>
            {/* Desktop expense input */}
            <div className="hidden lg:flex gap-2 mb-6">
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
            
            {/* Mobile expense button */}
            <div className="lg:hidden mb-2 lg:mb-6">
              <button
                onClick={() => {
                  setShowExpenseDialog(true)
                  setTempSplitAmong(people.map(p => p.id))
                }}
                className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 font-bold flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span>비용 추가하기</span>
              </button>
            </div>
            
            {/* Expense Table */}
            {expenses.length > 0 && (
              <div className="overflow-x-auto rounded-2xl bg-black/20 backdrop-blur-sm">
                <table className="w-full">
                  <thead className="bg-white/10 border-b border-white/20">
                    <tr>
                      <th className="text-left p-3 lg:p-5 font-bold text-white/90">항목</th>
                      <th className="text-right p-3 lg:p-5 font-bold text-white/90">금액</th>
                      <th className="p-3 lg:p-5 font-bold text-white/90">결제자</th>
                      <th className="hidden lg:table-cell p-5 font-bold text-white/90" colSpan={people.length}>분할</th>
                      {people.map(person => (
                        <th key={person.id} className="hidden lg:table-cell p-5 text-center font-bold text-white/90">{person.name}</th>
                      ))}
                      <th className="p-3 lg:p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense, index) => (
                      <tr key={expense.id} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-black/10'} hover:bg-white/10 transition-all`}>
                        <td className="p-3 lg:p-5 font-semibold text-white">
                          <div className="lg:hidden text-xs text-white/60">{expense.name}</div>
                          <div className="hidden lg:block">{expense.name}</div>
                        </td>
                        <td className="text-right p-3 lg:p-5">
                          <input
                            type="number"
                            value={expense.amount}
                            onChange={(e) => updateExpense(expense.id, { amount: parseFloat(e.target.value) || 0 })}
                            className="w-24 lg:w-32 px-2 lg:px-3 py-1 lg:py-2 bg-white/10 border border-white/20 rounded-xl text-cyan-400 font-bold text-right focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm text-sm lg:text-base"
                          />
                        </td>
                        <td className="p-3 lg:p-4">
                          <select
                            value={expense.paidBy}
                            onChange={(e) => updateExpense(expense.id, { paidBy: e.target.value })}
                            className="px-2 lg:px-4 py-1 lg:py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm text-sm lg:text-base"
                          >
                            {people.map(person => (
                              <option key={person.id} value={person.id} className="bg-gray-800 text-white">{person.name}</option>
                            ))}
                          </select>
                          <div className="lg:hidden mt-2 flex items-center gap-2">
                            <span className="text-xs text-white/60">분할: {expense.splitAmong.length}명</span>
                            <button
                              onClick={() => {
                                setEditingExpenseId(expense.id)
                                setTempSplitAmong(expense.splitAmong)
                              }}
                              className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                            >
                              수정
                            </button>
                          </div>
                        </td>
                        {people.map(person => (
                          <td key={person.id} className="hidden lg:table-cell p-4 text-center">
                            <input
                              type="checkbox"
                              checked={expense.splitAmong.includes(person.id)}
                              onChange={() => togglePersonInExpense(expense.id, person.id)}
                              className="w-5 h-5 text-cyan-400 rounded focus:ring-cyan-400 cursor-pointer accent-cyan-400"
                            />
                          </td>
                        ))}
                        <td className="p-3 lg:p-4">
                          <button
                            onClick={() => removeExpense(expense.id)}
                            className="text-red-400 hover:text-white hover:bg-red-500/30 px-2 lg:px-4 py-1 lg:py-2 rounded-xl transition-all font-medium text-sm lg:text-base"
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
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-3 lg:p-6 rounded-2xl border border-white/30 backdrop-blur-sm inline-block">
                  <p className="text-sm text-white/70 mb-2">총 비용</p>
                  <p className="text-3xl font-black text-white">₩{totalExpense.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Settlement Results - Always visible when there are settlements */}
        {settlements.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-2 lg:p-8 border border-white/20">
            <div className="flex items-center justify-between mb-2 lg:mb-6">
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
                <div key={index} className="p-3 lg:p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all">
                  {/* Desktop layout */}
                  <div className="hidden lg:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white text-lg">{getPersonName(settlement.from)}</span>
                      <span className="text-white/60 text-2xl">→</span>
                      <span className="font-bold text-white text-lg">{getPersonName(settlement.to)}</span>
                    </div>
                    <span className="text-2xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                      ₩{settlement.amount.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Mobile layout */}
                  <div className="lg:hidden">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-white">{getPersonName(settlement.from)}</span>
                      <span className="text-white/60">→</span>
                      <span className="font-bold text-white">{getPersonName(settlement.to)}</span>
                    </div>
                    <div className="text-xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                      ₩{settlement.amount.toLocaleString()}
                    </div>
                  </div>
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
      
      {/* Expense Dialog for Mobile */}
      {showExpenseDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">비용 추가</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                placeholder="항목명 (예: 점심)"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all backdrop-blur-sm"
              />
              
              <input
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                placeholder="금액"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all backdrop-blur-sm"
              />
              
              <select
                value={newExpensePaidBy}
                onChange={(e) => setNewExpensePaidBy(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm"
              >
                <option value="" className="bg-gray-800 text-white/50">결제자 선택</option>
                {people.map(person => (
                  <option key={person.id} value={person.id} className="bg-gray-800 text-white">{person.name}</option>
                ))}
              </select>
              
              <div className="pt-4">
                <h4 className="text-white font-semibold mb-3">비용을 나눌 사람들</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {people.map(person => (
                    <label key={person.id} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempSplitAmong.includes(person.id)}
                        onChange={() => {
                          setTempSplitAmong(prev => 
                            prev.includes(person.id) 
                              ? prev.filter(id => id !== person.id)
                              : [...prev, person.id]
                          )
                        }}
                        className="w-5 h-5 text-cyan-400 rounded focus:ring-cyan-400 cursor-pointer accent-cyan-400"
                      />
                      <span className="text-white">{person.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowExpenseDialog(false)
                  setNewExpenseName('')
                  setNewExpenseAmount('')
                  setNewExpensePaidBy('')
                  setTempSplitAmong([])
                }}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all font-semibold"
              >
                취소
              </button>
              <button
                onClick={addExpense}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 font-bold"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Split Dialog for Mobile */}
      {editingExpenseId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">비용 분할 수정</h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {people.map(person => (
                <label key={person.id} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSplitAmong.includes(person.id)}
                    onChange={() => {
                      setTempSplitAmong(prev => 
                        prev.includes(person.id) 
                          ? prev.filter(id => id !== person.id)
                          : [...prev, person.id]
                      )
                    }}
                    className="w-5 h-5 text-cyan-400 rounded focus:ring-cyan-400 cursor-pointer accent-cyan-400"
                  />
                  <span className="text-white">{person.name}</span>
                </label>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingExpenseId(null)
                  setTempSplitAmong([])
                }}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all font-semibold"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (editingExpenseId && tempSplitAmong.length > 0) {
                    updateExpense(editingExpenseId, { splitAmong: tempSplitAmong })
                    setEditingExpenseId(null)
                    setTempSplitAmong([])
                  }
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 font-bold"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}