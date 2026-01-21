"use client"

import { useRouter } from 'next/navigation'
import { LogOut, User, Info, Shield } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { MobileNav, MobileHeader } from '@/components/mobile'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/mobile/login')
  }

  return (
    <div className="min-h-screen bg-pearl-950 mobile-grid-dots">
      <MobileHeader title="Settings" />
      
      <main className="px-4 py-6 pb-24">
        {/* User Info */}
        <div className="bg-[#0a5694] border border-[#1a6aa8]/40 rounded-2xl p-4 mb-6 shadow-md shadow-black/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">
                {user?.email?.split('@')[0] || 'Admin'}
              </h2>
              <p className="text-white/60 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <div className="bg-[#0a5694] border border-[#1a6aa8]/40 rounded-2xl overflow-hidden shadow-md shadow-black/20">
            <button
              className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-white/10 transition-colors"
              onClick={() => {}}
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1">
                <span className="text-white font-medium block">Admin Access</span>
                <span className="text-white/50 text-sm">You have admin privileges</span>
              </div>
            </button>

            <div className="h-px bg-white/10" />

            <button
              className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-white/10 transition-colors"
              onClick={() => {}}
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Info className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1">
                <span className="text-white font-medium block">About</span>
                <span className="text-white/50 text-sm">Blue Pearl Dashboard v1.0</span>
              </div>
            </button>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-4 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-left hover:bg-red-500/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400 font-medium">Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-8">
          Blue Pearl Mortgage Executive Dashboard
          <br />
          &copy; {new Date().getFullYear()} All rights reserved
        </p>
      </main>

      <MobileNav />
    </div>
  )
}
