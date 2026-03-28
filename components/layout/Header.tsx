'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User | null
  isAdmin: boolean
}

export default function Header({ user, isAdmin }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const totalItems = useCartStore((s) => s.totalItems())

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-(--color-primary) text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🛍️</span>
            <span>CC <span className="text-(--color-accent)">Pre-loved</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/products" className="hover:text-(--color-accent) transition-colors">
              Shop
            </Link>
            {isAdmin && (
              <Link href="/admin" className="bg-(--color-accent) text-(--color-foreground) px-3 py-1 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link href="/account/orders" className="hover:text-(--color-accent) transition-colors">
                  My Orders
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hover:text-(--color-accent) transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-(--color-accent) transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-(--color-accent) text-(--color-foreground) px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
            <Link href="/cart" className="relative">
              <span className="text-xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-(--color-secondary) text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile: cart + hamburger */}
          <div className="flex items-center gap-4 md:hidden">
            <Link href="/cart" className="relative">
              <span className="text-xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-(--color-secondary) text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3 text-sm font-medium border-t border-white/20 pt-3">
            <Link href="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="font-bold text-(--color-accent)">
                Admin Panel
              </Link>
            )}
            {user ? (
              <>
                <Link href="/account/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                <button onClick={handleSignOut} className="text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
