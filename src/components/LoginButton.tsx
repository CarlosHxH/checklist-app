'use client'

import { signIn } from 'next-auth/react'

export default function LoginButton() {
  return (
    <div className="flex flex-col space-y-4">
      <button 
        onClick={() => signIn('github')}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Login with GitHub
      </button>
      <button 
        onClick={() => signIn('credentials')}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Login with Test Credentials
      </button>
    </div>
  )
}