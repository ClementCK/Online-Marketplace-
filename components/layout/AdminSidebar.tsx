'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/products', label: 'Products', icon: '👗' },
  { href: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { href: '/admin/orders', label: 'Orders', icon: '🧾' },
  { href: '/admin/exchange-slots', label: 'Exchange Slots', icon: '📅' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <nav className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <div className="px-4 py-3 bg-(--color-primary) text-white">
          <p className="font-bold text-sm">Admin Panel</p>
          <p className="text-xs text-white/70">PinoyMart HK</p>
        </div>
        <ul className="py-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-(--color-primary) border-r-2 border-(--color-primary)'
                      : 'text-(--color-foreground) hover:bg-(--color-background)'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
          <li className="border-t border-(--color-border) mt-2 pt-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-(--color-muted) hover:text-(--color-foreground) transition-colors"
            >
              <span>🏠</span> Back to Store
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
