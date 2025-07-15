import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCthClgy-dk8NpmjaXle41wG342V28J0Qk",
  authDomain: "we-travel-guys.firebaseapp.com",
  databaseURL: "https://we-travel-guys-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "we-travel-guys",
  storageBucket: "we-travel-guys.firebasestorage.app",
  messagingSenderId: "370402175267",
  appId: "1:370402175267:web:87eb1dafe15ee440af0496",
  measurementId: "G-Z6ZDBX774P"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

console.log('Firebase initialized with project:', firebaseConfig.projectId)