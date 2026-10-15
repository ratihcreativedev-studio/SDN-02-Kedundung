'use client'

import { useState } from 'react'
import { auth, googleProvider } from '@/lib/firebase/config'
import { signInWithPopup } from 'firebase/auth'
import { LogIn, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { setSessionAction } from '../actions'

export function LoginForm({ initialError = '' }: { initialError?: string }) {
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState(initialError)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsPending(true)
    setErrorMsg('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      
      if (!result.user.email) {
        throw new Error('Email tidak ditemukan dari akun Google Anda.')
      }

      // Verifikasi whitelist dan set session
      const idToken = await result.user.getIdToken(true)
      const res = await setSessionAction(idToken, result.user.photoURL)
      if (res?.error) {
        throw new Error(res.error)
      }
      
      router.replace('/admin')
      router.refresh()
      
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Gagal masuk dengan Google.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 dark:bg-zinc-900/80 dark:border-zinc-800/50">
      <div className="mb-8 text-center">
        <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">SIPANDA</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Login Admin SDN Kedundung 2</p>
      </div>

      <div className="space-y-6">
        {errorMsg && (
          <div className="p-4 text-sm text-red-600 bg-red-50/50 rounded-xl border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isPending}
          className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">
            {isPending ? 'Menghubungkan...' : 'Masuk dengan Google'}
          </span>
        </button>
        
        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 px-4">
          Hanya email yang terdaftar sebagai admin yang dapat mengakses sistem ini.
        </p>
      </div>
    </div>
  )
}
