"use client"

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { startPrefetch } from '@/lib/prefetch'
import Image from 'next/image'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const supabaseConfigured = useMemo(() => {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])

  // Start prefetching data immediately when login page loads
  useEffect(() => {
    startPrefetch()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!supabaseConfigured) {
      setError('Supabase is not configured. Please contact your administrator.')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Ensure prefetch is running before navigating
      startPrefetch()
      router.push('/mobile/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pearl-950 mobile-grid-dots flex flex-col items-center justify-center px-6">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 mb-4 relative shadow-[0_0_20px_rgba(10,86,148,0.5)] rounded-2xl">
          <Image
            src="/BP-Logo.png"
            alt="Blue Pearl Mortgage"
            fill
            className="object-contain rounded-2xl"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-white [text-shadow:0_0_15px_rgba(10,86,148,0.8),0_0_30px_rgba(10,86,148,0.5)]">Blue Pearl</h1>
        <p className="text-[#4da6db] text-sm [text-shadow:0_0_10px_rgba(77,166,219,0.6)]">Executive Dashboard</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3.5 bg-[#0a5694]/60 border border-[#1a6aa8]/40 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4da6db] focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-3.5 bg-[#0a5694]/60 border border-[#1a6aa8]/40 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4da6db] focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-[#0a5694] hover:bg-[#0c65a8] active:bg-[#084a7a] border border-[#1a6aa8]/40 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-black/20"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-10 text-[#4da6db]/60 text-xs [text-shadow:0_0_8px_rgba(10,86,148,0.4)]">
        Admin access only
      </p>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-pearl-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-pearl-500/30 border-t-pearl-500 rounded-full animate-spin" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
