import { ref, set, get, onValue, off } from 'firebase/database'
import { database } from './firebase'

export interface GroupData {
  groupName?: string
  people: { id: string; name: string }[]
  expenses: {
    id: string
    name: string
    amount: number
    paidBy: string
    splitAmong: string[]
  }[]
  updatedAt: number
}

export async function createGroup(data: GroupData): Promise<string> {
  const groupId = generateGroupId()
  const groupRef = ref(database, `groups/${groupId}`)
  
  try {
    await set(groupRef, {
      ...data,
      updatedAt: Date.now()
    })
    console.log('Group created successfully:', groupId)
    return groupId
  } catch (error) {
    console.error('Error creating group:', error)
    throw error
  }
}

export async function getGroup(groupId: string): Promise<GroupData | null> {
  const groupRef = ref(database, `groups/${groupId}`)
  const snapshot = await get(groupRef)
  
  if (snapshot.exists()) {
    return snapshot.val() as GroupData
  }
  
  return null
}

export async function updateGroup(groupId: string, data: GroupData): Promise<void> {
  const groupRef = ref(database, `groups/${groupId}`)
  
  await set(groupRef, {
    ...data,
    updatedAt: Date.now()
  })
}

export function subscribeToGroup(
  groupId: string, 
  callback: (data: GroupData | null) => void
): () => void {
  const groupRef = ref(database, `groups/${groupId}`)
  
  console.log('Setting up Firebase listener for group:', groupId)
  
  const unsubscribe = onValue(groupRef, (snapshot) => {
    console.log('Firebase data changed for group:', groupId)
    if (snapshot.exists()) {
      const data = snapshot.val() as GroupData
      console.log('Data received:', data)
      callback(data)
    } else {
      console.log('No data exists for group:', groupId)
      callback(null)
    }
  }, (error) => {
    console.error('Error subscribing to group:', error)
    callback(null)
  })
  
  return () => {
    console.log('Unsubscribing from group:', groupId)
    off(groupRef, 'value', unsubscribe)
  }
}

function generateGroupId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}