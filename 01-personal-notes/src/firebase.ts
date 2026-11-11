import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBeW2kXnUNegQdhJt6vPCX84pxLD8uCx3A',
  authDomain: 'master-firebase-auth-yt.firebaseapp.com',
  projectId: 'master-firebase-auth-yt',
  storageBucket: 'master-firebase-auth-yt.firebasestorage.app',
  messagingSenderId: '1027219125467',
  appId: '1:1027219125467:web:c5e2356a8f2b260ce908fe',
  measurementId: 'G-L6GZ08DFDS',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
