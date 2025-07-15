'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const ExpenseTracker = dynamic(() => import('../expense-tracker'), {
  ssr: false
})

export default function GroupPage() {
  const params = useParams()
  const groupId = params.groupId as string

  return <ExpenseTracker groupId={groupId} />
}