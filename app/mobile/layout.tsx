import type { Metadata, Viewport } from "next"
import { AuthProvider } from "@/providers/AuthProvider"

export const metadata: Metadata = {
  title: "Blue Pearl Dashboard",
  description: "Executive sales dashboard for Blue Pearl Mortgage",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BP Dashboard",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a5694",
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-pearl-950 text-white overflow-x-hidden">
        {children}
      </div>
    </AuthProvider>
  )
}
