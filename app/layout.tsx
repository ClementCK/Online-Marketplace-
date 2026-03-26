import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PinoyMart HK – Filipino Online Shopping in Hong Kong',
  description: 'Shop pre-owned clothing from the Filipino community in Hong Kong. Browse tops, bottoms, dresses and more.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-(--color-background) text-(--color-foreground) antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
