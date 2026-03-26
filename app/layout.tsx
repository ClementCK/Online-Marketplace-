import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PinoyMart HK – Filipino Online Shopping in Hong Kong',
  description: 'Shop pre-owned clothing from the Filipino community in Hong Kong. Browse tops, bottoms, dresses and more.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = data?.is_admin ?? false
  }

  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-(--color-background) text-(--color-foreground) antialiased">
        <Header user={user} isAdmin={isAdmin} />
        {children}
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
